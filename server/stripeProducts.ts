/**
 * stripeProducts.ts — Centralized payment service definitions
 *
 * All prices are in USD cents (Stripe standard).
 * Update amounts here to change what clients see on the payment page.
 */

export interface ServiceProduct {
  id: string;
  name: string;
  description: string;
  amount: number; // cents
  category: "estate" | "business" | "custom";
}

export const SERVICE_PRODUCTS: ServiceProduct[] = [
  {
    id: "revocable-living-trust",
    name: "Revocable Living Trust Package",
    description: "Revocable living trust, pour-over will, durable POA, and advance medical directive.",
    amount: 175000, // $1,750.00
    category: "estate",
  },
  {
    id: "will-package",
    name: "Last Will & Testament Package",
    description: "Last will and testament, durable POA, and advance medical directive.",
    amount: 75000, // $750.00
    category: "estate",
  },
  {
    id: "trust-amendment",
    name: "Trust Amendment",
    description: "Amendment to an existing revocable living trust.",
    amount: 50000, // $500.00
    category: "estate",
  },
  {
    id: "llc-formation",
    name: "LLC Formation",
    description: "Business entity formation including articles of organization and operating agreement.",
    amount: 75000, // $750.00
    category: "business",
  },
  {
    id: "retainer",
    name: "General Retainer",
    description: "General retainer for ongoing legal services.",
    amount: 100000, // $1,000.00
    category: "estate",
  },
];

/** Minimum custom payment amount in cents ($50 minimum per Stripe rules) */
export const CUSTOM_MIN_CENTS = 5000;
/** Maximum custom payment amount in cents ($50,000) */
export const CUSTOM_MAX_CENTS = 5000000;
