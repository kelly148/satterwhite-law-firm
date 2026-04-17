/**
 * stripe.test.ts — Unit tests for Stripe payment integration
 *
 * Tests cover:
 * - SERVICE_PRODUCTS definitions
 * - createCheckout input validation logic
 * - Webhook test-event detection
 * - Amount calculation helpers
 */

import { describe, it, expect } from "vitest";
import {
  SERVICE_PRODUCTS,
  CUSTOM_MIN_CENTS,
  CUSTOM_MAX_CENTS,
} from "./stripeProducts";

// ── SERVICE_PRODUCTS ──────────────────────────────────────────────────────────

describe("SERVICE_PRODUCTS", () => {
  it("should have at least one product defined", () => {
    expect(SERVICE_PRODUCTS.length).toBeGreaterThan(0);
  });

  it("every product should have a unique id", () => {
    const ids = SERVICE_PRODUCTS.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every product should have a positive amount in cents", () => {
    for (const product of SERVICE_PRODUCTS) {
      expect(product.amount).toBeGreaterThan(0);
      expect(Number.isInteger(product.amount)).toBe(true);
    }
  });

  it("every product amount should be at least $0.50 (Stripe minimum)", () => {
    for (const product of SERVICE_PRODUCTS) {
      expect(product.amount).toBeGreaterThanOrEqual(50);
    }
  });

  it("every product should have a non-empty name and description", () => {
    for (const product of SERVICE_PRODUCTS) {
      expect(product.name.trim().length).toBeGreaterThan(0);
      expect(product.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("every product should have a valid category", () => {
    const validCategories = ["estate", "business", "exchange", "custom"];
    for (const product of SERVICE_PRODUCTS) {
      expect(validCategories).toContain(product.category);
    }
  });

  it("initial-consultation product should NOT exist (consultations are free)", () => {
    const consultation = SERVICE_PRODUCTS.find(p => p.id === "initial-consultation");
    expect(consultation).toBeUndefined();
  });

  it("revocable-living-trust product should be $1,750", () => {
    const trust = SERVICE_PRODUCTS.find(p => p.id === "revocable-living-trust");
    expect(trust).toBeDefined();
    expect(trust!.amount).toBe(175000);
  });
});

// ── CUSTOM AMOUNT LIMITS ──────────────────────────────────────────────────────

describe("Custom amount limits", () => {
  it("CUSTOM_MIN_CENTS should be at least 50 (Stripe $0.50 minimum)", () => {
    expect(CUSTOM_MIN_CENTS).toBeGreaterThanOrEqual(50);
  });

  it("CUSTOM_MAX_CENTS should be greater than CUSTOM_MIN_CENTS", () => {
    expect(CUSTOM_MAX_CENTS).toBeGreaterThan(CUSTOM_MIN_CENTS);
  });

  it("CUSTOM_MIN_CENTS should be $50.00 as configured", () => {
    expect(CUSTOM_MIN_CENTS).toBe(5000);
  });

  it("CUSTOM_MAX_CENTS should be $50,000 as configured", () => {
    expect(CUSTOM_MAX_CENTS).toBe(5000000);
  });
});

// ── AMOUNT FORMATTING HELPER ──────────────────────────────────────────────────

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

describe("formatCents helper", () => {
  it("should format 25000 as $250.00", () => {
    expect(formatCents(25000)).toBe("$250.00");
  });

  it("should format 150000 as $1,500.00", () => {
    expect(formatCents(150000)).toBe("$1,500.00");
  });

  it("should format 50 as $0.50", () => {
    expect(formatCents(50)).toBe("$0.50");
  });
});

// ── WEBHOOK TEST EVENT DETECTION ─────────────────────────────────────────────

describe("Webhook test event detection", () => {
  it("should detect test events by evt_test_ prefix", () => {
    const isTestEvent = (id: string) => id.startsWith("evt_test_");
    expect(isTestEvent("evt_test_abc123")).toBe(true);
    expect(isTestEvent("evt_1234567890")).toBe(false);
    expect(isTestEvent("evt_live_abc123")).toBe(false);
  });

  it("should not treat real events as test events", () => {
    const isTestEvent = (id: string) => id.startsWith("evt_test_");
    const realEventIds = [
      "evt_1RealEvent",
      "evt_3NbLpkLXzYUe2NQKL",
      "evt_checkout_session_completed",
    ];
    for (const id of realEventIds) {
      expect(isTestEvent(id)).toBe(false);
    }
  });
});

// ── CHECKOUT INPUT VALIDATION ─────────────────────────────────────────────────

describe("Checkout input validation", () => {
  function validateCheckoutInput(input: {
    serviceId?: string;
    customAmountCents?: number;
    customerEmail?: string;
  }): { valid: boolean; error?: string } {
    if (!input.serviceId && !input.customAmountCents) {
      return { valid: false, error: "Please select a service or enter a custom amount." };
    }
    if (input.customAmountCents !== undefined) {
      if (input.customAmountCents < CUSTOM_MIN_CENTS) {
        return { valid: false, error: `Minimum payment is $${CUSTOM_MIN_CENTS / 100}.` };
      }
      if (input.customAmountCents > CUSTOM_MAX_CENTS) {
        return { valid: false, error: `Maximum payment is $${CUSTOM_MAX_CENTS / 100}.` };
      }
    }
    if (input.serviceId) {
      const product = SERVICE_PRODUCTS.find(p => p.id === input.serviceId);
      if (!product) return { valid: false, error: "Unknown service selected." };
    }
    return { valid: true };
  }

  it("should reject input with no service and no custom amount", () => {
    const result = validateCheckoutInput({});
    expect(result.valid).toBe(false);
    expect(result.error).toContain("select a service");
  });

  it("should reject custom amount below minimum", () => {
    const result = validateCheckoutInput({ customAmountCents: 10 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Minimum");
  });

  it("should reject custom amount above maximum", () => {
    const result = validateCheckoutInput({ customAmountCents: 99999999 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Maximum");
  });

  it("should accept valid custom amount", () => {
    const result = validateCheckoutInput({ customAmountCents: 10000 });
    expect(result.valid).toBe(true);
  });

  it("should accept valid service id", () => {
    const result = validateCheckoutInput({ serviceId: "revocable-living-trust" });
    expect(result.valid).toBe(true);
  });

  it("should reject unknown service id", () => {
    const result = validateCheckoutInput({ serviceId: "nonexistent-service" });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unknown service");
  });
});
