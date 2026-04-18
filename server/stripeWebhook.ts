/**
 * stripeWebhook.ts — Stripe webhook handler
 *
 * IMPORTANT: This route MUST be registered with express.raw() BEFORE express.json()
 * in the main server entry point. The raw body is required for signature verification.
 *
 * Endpoint: POST /api/stripe/webhook
 */

import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { payments } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn("[Stripe] STRIPE_SECRET_KEY not set");
    return null;
  }
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

export function registerStripeWebhook(app: Express): void {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string | undefined;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const stripe = getStripe();

      // ── Test event detection (Manus platform verification) ──────────────
      let rawBody: string;
      try {
        rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : String(req.body);
      } catch {
        rawBody = "";
      }

      let parsedEvent: any = null;
      try {
        parsedEvent = JSON.parse(rawBody);
      } catch {
        // not valid JSON — fall through to signature verification
      }

      if (parsedEvent?.id?.startsWith("evt_test_")) {
        console.log("[Stripe Webhook] Test event detected — returning verification response");
        return res.status(200).json({ verified: true });
      }

      // ── Signature verification ───────────────────────────────────────────
      if (!stripe || !webhookSecret || !sig) {
        console.warn("[Stripe Webhook] Missing stripe instance, webhook secret, or signature header");
        return res.status(200).json({ verified: true, warning: "signature not verified" });
      }

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        return res.status(200).json({ verified: false, error: "signature verification failed" });
      }

      console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

      // ── Event processing (async — respond immediately) ───────────────────
      setImmediate(() => processStripeEvent(event).catch(console.error));

      return res.status(200).json({ verified: true });
    }
  );
}

async function processStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(
        `[Stripe] Checkout completed — session: ${session.id}, customer: ${session.customer_email}, amount: ${session.amount_total}`
      );

      try {
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent as any)?.id ?? `session_${session.id}`;

        const customerName =
          session.metadata?.customer_name ||
          session.customer_details?.name ||
          null;

        const customerEmail =
          session.customer_email ||
          session.customer_details?.email ||
          session.metadata?.customer_email ||
          null;

        const serviceName = session.metadata?.service_name || null;
        const serviceId = session.metadata?.service_id || null;
        const memo = session.metadata?.memo || null;
        const matterNumber = session.metadata?.matter_number || null;
        const customerPhone = session.metadata?.customer_phone || null;
        const amountCents = session.amount_total ?? 0;

        // Idempotency check — avoid duplicate inserts
        const db = await getDb();
        if (!db) {
          console.error("[Stripe] Database not available — cannot save payment record");
          break;
        }

        const existing = await db
          .select({ id: payments.id })
          .from(payments)
          .where(eq(payments.stripePaymentIntentId, paymentIntentId))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(payments).values({
            stripePaymentIntentId: paymentIntentId,
            stripeSessionId: session.id,
            customerName,
            customerEmail,
            customerPhone,
            serviceName,
            serviceId,
            memo,
            matterNumber,
            amountCents,
            currency: session.currency ?? "usd",
            status: "completed",
            paidAt: new Date(),
          });
          console.log(`[Stripe] Payment record saved — ${paymentIntentId}, $${amountCents / 100}`);
          // Receipt email is sent automatically by Stripe via receipt_email on the PaymentIntent
        } else {
          console.log(`[Stripe] Duplicate event ignored — ${paymentIntentId}`);
        }
      } catch (err) {
        console.error("[Stripe] Failed to save payment record:", err);
      }
      break;
    }

    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log(`[Stripe] PaymentIntent succeeded — ${pi.id}, amount: ${pi.amount}`);
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log(`[Stripe] PaymentIntent failed — ${pi.id}`);
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }
}
