/**
 * email.test.ts — Unit tests for the SMTP email layer.
 *
 * Tests cover:
 * - App Password normalization (Google shows them space-separated)
 * - From-header address extraction
 * - SMTP config resolution, defaults, and TLS mode selection
 *
 * Nothing here opens a socket; resolveSmtpConfig is pure and takes its
 * environment as an argument.
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  normalizeAppPassword,
  extractAddress,
  resolveSmtpConfig,
  isEmailConfigured,
} from "./email";

const COMPLETE = {
  SMTP_USER: "kelly@thesatterwhitelawfirm.com",
  SMTP_PASS: "abcd efgh ijkl mnop",
  EMAIL_FROM: "Satterwhite Law <kelly@thesatterwhitelawfirm.com>",
} as NodeJS.ProcessEnv;

// ── APP PASSWORD NORMALIZATION ───────────────────────────────────────────────

describe("normalizeAppPassword", () => {
  it("strips the display spaces Google adds", () => {
    expect(normalizeAppPassword("abcd efgh ijkl mnop")).toBe("abcdefghijklmnop");
  });

  it("leaves an already-compact password alone", () => {
    expect(normalizeAppPassword("abcdefghijklmnop")).toBe("abcdefghijklmnop");
  });

  it("strips tabs and newlines from a careless paste", () => {
    expect(normalizeAppPassword(" abcd\tefgh\nijkl mnop ")).toBe("abcdefghijklmnop");
  });
});

// ── ADDRESS EXTRACTION ───────────────────────────────────────────────────────

describe("extractAddress", () => {
  it("pulls the address out of a display-name header", () => {
    expect(extractAddress("Satterwhite Law <intake@example.com>")).toBe("intake@example.com");
  });

  it("passes a bare address through", () => {
    expect(extractAddress("intake@example.com")).toBe("intake@example.com");
  });

  it("normalizes case and surrounding whitespace", () => {
    expect(extractAddress("  Intake@Example.COM  ")).toBe("intake@example.com");
  });
});

// ── CONFIG RESOLUTION ────────────────────────────────────────────────────────

describe("resolveSmtpConfig", () => {
  it("returns null when nothing is set", () => {
    expect(resolveSmtpConfig({})).toBeNull();
  });

  it("returns null if any one of the three required values is missing", () => {
    for (const missing of ["SMTP_USER", "SMTP_PASS", "EMAIL_FROM"] as const) {
      const env = { ...COMPLETE };
      delete env[missing];
      expect(resolveSmtpConfig(env), `missing ${missing}`).toBeNull();
    }
  });

  it("defaults to Google Workspace on the implicit-TLS port", () => {
    const config = resolveSmtpConfig(COMPLETE);
    expect(config).not.toBeNull();
    expect(config!.host).toBe("smtp.gmail.com");
    expect(config!.port).toBe(465);
    expect(config!.secure).toBe(true);
  });

  it("strips the App Password spaces before handing it to the transport", () => {
    expect(resolveSmtpConfig(COMPLETE)!.pass).toBe("abcdefghijklmnop");
  });

  it("uses STARTTLS rather than implicit TLS on port 587", () => {
    const config = resolveSmtpConfig({ ...COMPLETE, SMTP_PORT: "587" });
    expect(config!.port).toBe(587);
    expect(config!.secure).toBe(false);
  });

  it("honours a non-Google SMTP host", () => {
    const config = resolveSmtpConfig({ ...COMPLETE, SMTP_HOST: "smtp.example.net" });
    expect(config!.host).toBe("smtp.example.net");
  });

  it("falls back to the default port when SMTP_PORT is not a usable number", () => {
    for (const bad of ["", "   ", "not-a-port", "0", "-1"]) {
      const config = resolveSmtpConfig({ ...COMPLETE, SMTP_PORT: bad });
      expect(config!.port, `port input ${JSON.stringify(bad)}`).toBe(465);
    }
  });

  it("preserves the full From header including the display name", () => {
    expect(resolveSmtpConfig(COMPLETE)!.from).toBe(
      "Satterwhite Law <kelly@thesatterwhitelawfirm.com>"
    );
  });
});

// ── isEmailConfigured ────────────────────────────────────────────────────────

describe("isEmailConfigured", () => {
  const saved = { ...process.env };

  afterEach(() => {
    process.env = { ...saved };
  });

  it("is false when SMTP is not set up", () => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.EMAIL_FROM;
    expect(isEmailConfigured()).toBe(false);
  });

  it("is true once all three required values are present", () => {
    Object.assign(process.env, COMPLETE);
    expect(isEmailConfigured()).toBe(true);
  });
});
