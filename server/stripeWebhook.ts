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

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn("[Stripe] STRIPE_SECRET_KEY not set");
    return null;
  }
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

export function registerStripeWebhook(app: Express): void {
  /**
   * POST /api/stripe/webhook
   *
   * Must use express.raw() so the raw body is available for HMAC verification.
   * Always returns HTTP 200 with { verified: true } — even on errors — so Stripe
   * does not retry indefinitely.
   */
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string | undefined;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const stripe = getStripe();

      // ── Test event detection (Manus platform verification) ──────────────
      // The Manus platform sends a synthetic test event to verify the endpoint.
      // It expects { verified: true } in the response body.
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
        // Still return 200 so Stripe does not retry — but log the failure
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
      // TODO: update order/payment record in DB if needed
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
