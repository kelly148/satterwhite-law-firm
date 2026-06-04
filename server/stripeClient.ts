/**
 * stripeClient.ts — Single source of truth for the Stripe client.
 *
 * Returns null when STRIPE_SECRET_KEY is not configured so callers can degrade
 * gracefully. Keeping the API version in one place avoids drift between the
 * checkout flow and the webhook handler.
 */
import Stripe from "stripe";

const STRIPE_API_VERSION = "2026-03-25.dahlia" as const;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn("[Stripe] STRIPE_SECRET_KEY not set");
    return null;
  }
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}
