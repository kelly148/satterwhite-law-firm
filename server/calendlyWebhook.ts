/**
 * calendlyWebhook.ts — Calendly webhook handler
 *
 * Listens for Calendly webhook events (invitee.created, invitee.canceled)
 * and saves bookings to the database, then notifies the attorney.
 *
 * Endpoint: POST /api/calendly/webhook
 *
 * Setup instructions:
 * 1. Go to https://calendly.com/integrations/webhooks
 * 2. Create a new webhook subscription with URL:
 *    https://satterlaw-6bmn3gsb.manus.space/api/calendly/webhook
 * 3. Subscribe to events: invitee.created, invitee.canceled
 * 4. Copy the signing key and add it as CALENDLY_WEBHOOK_SECRET in Settings → Secrets
 *
 * Signature verification uses HMAC-SHA256 with the signing key.
 * If no signing key is configured, the webhook still processes events (less secure).
 */

import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { getDb } from "./db";
import { consultationBookings } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

export function registerCalendlyWebhook(app: Express): void {
  app.post("/api/calendly/webhook", async (req: Request, res: Response) => {
    // ── Signature verification (optional but recommended) ──────────────────
    const signingKey = process.env.CALENDLY_WEBHOOK_SECRET;
    if (signingKey) {
      const signature = req.headers["calendly-webhook-signature"] as string | undefined;
      if (signature) {
        try {
          // Calendly uses: t=<timestamp>,v1=<hmac>
          const parts = signature.split(",");
          const tPart = parts.find(p => p.startsWith("t="));
          const v1Part = parts.find(p => p.startsWith("v1="));
          if (tPart && v1Part) {
            const timestamp = tPart.slice(2);
            const receivedSig = v1Part.slice(3);
            const rawBody = JSON.stringify(req.body);
            const expectedSig = crypto
              .createHmac("sha256", signingKey)
              .update(`${timestamp}.${rawBody}`)
              .digest("hex");
            if (!crypto.timingSafeEqual(Buffer.from(receivedSig, "hex"), Buffer.from(expectedSig, "hex"))) {
              console.warn("[Calendly Webhook] Signature mismatch — ignoring event");
              return res.status(200).json({ received: true, warning: "signature mismatch" });
            }
          }
        } catch (err) {
          console.warn("[Calendly Webhook] Signature check error:", err);
        }
      }
    }

    const payload = req.body;
    const eventType: string = payload?.event ?? "";
    const invitee = payload?.payload?.invitee ?? {};
    const eventDetails = payload?.payload?.event ?? {};

    console.log(`[Calendly Webhook] Received: ${eventType}`);

    // Respond immediately — process async
    res.status(200).json({ received: true });

    setImmediate(() => processCalendlyEvent(eventType, invitee, eventDetails, payload).catch(console.error));
  });
}

async function processCalendlyEvent(
  eventType: string,
  invitee: any,
  eventDetails: any,
  payload: any
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error("[Calendly] Database not available");
    return;
  }

  // Extract the Calendly event UUID from the URI
  const eventUri: string = eventDetails?.uri ?? invitee?.event ?? "";
  const eventId = eventUri.split("/").pop() ?? eventUri;

  if (!eventId) {
    console.warn("[Calendly] No event ID found in payload");
    return;
  }

  const inviteeName: string = invitee?.name ?? "";
  const inviteeEmail: string = invitee?.email ?? "";
  const startTimeRaw: string = eventDetails?.start_time ?? invitee?.scheduled_event?.start_time ?? "";
  const endTimeRaw: string = eventDetails?.end_time ?? invitee?.scheduled_event?.end_time ?? "";
  const eventTypeName: string = eventDetails?.name ?? payload?.payload?.event_type?.name ?? "30-Minute Consultation";

  // Collect any questions/answers from the booking form
  const questionsAnswers: any[] = invitee?.questions_and_answers ?? [];
  const phone = questionsAnswers.find((q: any) =>
    /phone/i.test(q.question ?? "")
  )?.answer ?? "";
  const notesLines = questionsAnswers
    .filter((q: any) => !/phone/i.test(q.question ?? ""))
    .map((q: any) => `${q.question}: ${q.answer}`)
    .join("\n");

  const startTime = startTimeRaw ? new Date(startTimeRaw) : null;
  const endTime = endTimeRaw ? new Date(endTimeRaw) : null;

  const formatDt = (d: Date | null) =>
    d
      ? d.toLocaleString("en-US", {
          timeZone: "America/New_York",
          dateStyle: "full",
          timeStyle: "short",
        })
      : "Unknown";

  if (eventType === "invitee.created") {
    // Check for duplicate
    const existing = await db
      .select({ id: consultationBookings.id })
      .from(consultationBookings)
      .where(eq(consultationBookings.calendlyEventId, eventId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(consultationBookings).values({
        calendlyEventId: eventId,
        calendlyEventType: eventTypeName,
        inviteeName,
        inviteeEmail,
        inviteePhone: phone || null,
        startTime,
        endTime,
        status: "active",
        notes: notesLines || null,
        createdAt: new Date(),
      });
      console.log(`[Calendly] Booking saved — ${inviteeName} (${inviteeEmail}) at ${formatDt(startTime)}`);
    } else {
      console.log(`[Calendly] Duplicate booking ignored — ${eventId}`);
      return;
    }

    // Notify the attorney
    await notifyOwner({
      title: `📅 New Consultation Booked — ${inviteeName}`,
      content: [
        `A new consultation has been scheduled:`,
        ``,
        `Client:   ${inviteeName}`,
        `Email:    ${inviteeEmail}`,
        `Phone:    ${phone || "Not provided"}`,
        ``,
        `Date/Time: ${formatDt(startTime)} – ${endTime ? endTime.toLocaleTimeString("en-US", { timeZone: "America/New_York", timeStyle: "short" }) : ""}  (ET)`,
        `Event:     ${eventTypeName}`,
        notesLines ? `\nNotes:\n${notesLines}` : "",
      ]
        .filter(l => l !== undefined)
        .join("\n"),
    });
  } else if (eventType === "invitee.canceled") {
    const cancelReason: string = invitee?.cancel_reason ?? invitee?.cancellation?.reason ?? "";

    await db
      .update(consultationBookings)
      .set({ status: "canceled", cancelReason: cancelReason || null })
      .where(eq(consultationBookings.calendlyEventId, eventId));

    console.log(`[Calendly] Booking canceled — ${eventId}`);

    await notifyOwner({
      title: `❌ Consultation Canceled — ${inviteeName}`,
      content: [
        `A consultation has been canceled:`,
        ``,
        `Client:    ${inviteeName}`,
        `Email:     ${inviteeEmail}`,
        `Date/Time: ${formatDt(startTime)} (ET)`,
        cancelReason ? `Reason:    ${cancelReason}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } else {
    console.log(`[Calendly Webhook] Unhandled event type: ${eventType}`);
  }
}
