/**
 * intakeFlags.test.ts — the server side of the trust intake changes:
 * the attorney flags box, phone formatting, the client's copy of the PDF, and
 * (acceptance test 6) submissions saved before any of this existed.
 *
 * All names and details here are invented.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatPhone, readAttorneyFlags } from "../shared/intake";
import { renderIntakePdfBuffer } from "./generateIntakePdf";
import { appRouter, buildFullEmailBody } from "./routers";
import { getDb } from "./db";
import { isEmailConfigured, sendEmail } from "./email";
import { extractPdfText, extractPdfTextFlat } from "./__testutils__/pdfText";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({ getDb: vi.fn() }));
vi.mock("./email", () => ({ sendEmail: vi.fn(), isEmailConfigured: vi.fn() }));
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(false),
}));

afterEach(() => vi.clearAllMocks());

// ── Fixtures ────────────────────────────────────────────────────────────────

/** Exactly the shape, labels and values the form produced before this change. */
const submissionBeforeChange = {
  clientName: "Jane Doe",
  clientEmail: "jane@example.com",
  clientPhone: "7035550101",
  submittedAt: "Monday, March 2, 2026 at 10:15 AM",
  sections: [
    {
      title: "Client Information",
      fields: [
        {
          label: "How Did You Hear About Us?",
          value: "Referral — existing client",
        },
      ],
      groups: [
        {
          title: "Primary Client (Grantor 1)",
          fields: [
            { label: "First Name", value: "Jane" },
            { label: "Middle Name", value: "Q" },
            { label: "Last Name", value: "Doe" },
            { label: "Phone", value: "7035550101" },
            { label: "Marital Status", value: "Married" },
          ],
        },
      ],
    },
    {
      title: "Family & Beneficiaries",
      fields: [],
      groups: [
        {
          title: "Child 1",
          fields: [
            { label: "First Name", value: "Amy" },
            { label: "Relationship", value: "Biological child" },
            { label: "Currently a Minor?", value: "Yes" },
          ],
        },
      ],
    },
    {
      title: "Assets & Property",
      fields: [],
      groups: [
        {
          title: "Estimated Estate Value",
          fields: [{ label: "Prior Estate Planning?", value: "Will only" }],
        },
      ],
    },
    {
      title: "Fiduciaries",
      fields: [],
      groups: [
        {
          title: "Trustee",
          fields: [
            { label: "Successor Trustee — Primary", value: "Sam Sample" },
            { label: "Phone / Email", value: "sam@example.com" },
            { label: "Alternate Successor Trustee (1st)", value: "Pat Proxy" },
          ],
        },
      ],
    },
  ],
};

/** The even older shape the admin view still has a fallback for. */
const legacySubmission = {
  "g1-first": "Jane",
  "g1-last": "Doe",
  subsections: [
    { title: "Trustee", fields: { "Successor Trustee": "Sam Sample" } },
  ],
};

const flaggedSubmission = {
  ...submissionBeforeChange,
  schemaVersion: 2,
  attorneyFlags: [
    {
      label: "Court-ordered obligations",
      items: ["Keep life insurance in force or name a specific beneficiary"],
    },
    {
      label: "Roles with no backup",
      items: ["No backup for successor trustee"],
    },
  ],
};

// ── Acceptance test 6 ───────────────────────────────────────────────────────

describe("6. a submission saved before this change", () => {
  it("still renders to PDF with every answer and no 'undefined'", async () => {
    const text = extractPdfText(
      await renderIntakePdfBuffer(submissionBeforeChange, "Jane Doe")
    );
    expect(text).not.toMatch(/undefined|null|NaN|\[object/);
    expect(text).not.toContain("ATTORNEY FLAGS");
    for (const expected of [
      "SECTION 1 — CLIENT INFORMATION",
      "SECTION 4 — FIDUCIARIES",
      "CURRENTLY A MINOR?",
      "PRIOR ESTATE PLANNING?",
      "Will only",
      "ALTERNATE SUCCESSOR TRUSTEE (1ST)",
      "Pat Proxy",
      "sam@example.com",
    ]) {
      expect(text, expected).toContain(expected);
    }
  });

  it("renders the oldest stored shape without errors", async () => {
    const text = extractPdfText(
      await renderIntakePdfBuffer(legacySubmission, "Jane Doe")
    );
    expect(text).not.toMatch(/undefined|\[object/);
    expect(text).toContain(
      "No detailed form data was captured for this submission."
    );
  });

  it("is told apart from a new submission that simply raised no flags", () => {
    expect(readAttorneyFlags(submissionBeforeChange)).toBeNull();
    expect(readAttorneyFlags(legacySubmission)).toBeNull();
    expect(
      readAttorneyFlags({ ...submissionBeforeChange, attorneyFlags: [] })
    ).toEqual([]);
  });

  it("produces the same notification email as before, with no flags block", () => {
    const body = buildFullEmailBody(
      submissionBeforeChange,
      "Jane Doe",
      "jane@example.com",
      "7035550101",
      "today",
      true
    );
    expect(body).not.toContain("ATTORNEY FLAGS");
    expect(body).not.toMatch(/undefined/);
    expect(body).toContain("Alternate Successor Trustee (1st): Pat Proxy");
  });
});

describe("answers that belong to a whole section", () => {
  it("are set apart from the group above them, which may be one spouse's", async () => {
    const data = {
      sections: [
        {
          title: "Fiduciaries",
          fields: [{ label: "Same answers as my spouse", value: "Yes" }],
          groups: [
            {
              title: "Spouse 2 (John Testerson) — Trustee",
              fields: [{ label: "Co-Trustees?", value: "No" }],
            },
          ],
        },
      ],
    };
    const lines = extractPdfText(
      await renderIntakePdfBuffer(data, "Jane Testerson")
    ).split("\n");
    const spouse = lines.indexOf("Spouse 2 (John Testerson) — Trustee");
    const heading = lines.indexOf("Other Answers in This Section");
    const answer = lines.indexOf("SAME ANSWERS AS MY SPOUSE");
    expect(spouse).toBeGreaterThan(-1);
    expect(heading).toBeGreaterThan(spouse);
    expect(answer).toBeGreaterThan(heading);
  });

  it("get no extra heading when the section has no groups", async () => {
    const data = {
      sections: [
        {
          title: "Notes & Preferences",
          fields: [{ label: "Preferred Days / Times", value: "Mornings" }],
          groups: [],
        },
      ],
    };
    expect(
      extractPdfText(await renderIntakePdfBuffer(data, "Jane Testerson"))
    ).not.toContain("Other Answers in This Section");
  });
});

// ── Attorney flags ──────────────────────────────────────────────────────────

describe("attorney flags box", () => {
  it("is printed on page 1, ahead of the first section", async () => {
    const text = extractPdfText(
      await renderIntakePdfBuffer(flaggedSubmission, "Jane Doe")
    );
    const lines = text.split("\n");
    const at = (s: string) => lines.indexOf(s);
    expect(at("ATTORNEY FLAGS")).toBeGreaterThan(-1);
    expect(at("COURT-ORDERED OBLIGATIONS")).toBeGreaterThan(
      at("ATTORNEY FLAGS")
    );
    expect(at("ROLES WITH NO BACKUP")).toBeGreaterThan(
      at("COURT-ORDERED OBLIGATIONS")
    );
    expect(at("SECTION 1 — CLIENT INFORMATION")).toBeGreaterThan(
      at("ROLES WITH NO BACKUP")
    );
  });

  it("says so when a new submission raised nothing", async () => {
    const text = extractPdfTextFlat(
      await renderIntakePdfBuffer(
        { ...flaggedSubmission, attorneyFlags: [] },
        "Jane Doe"
      )
    );
    expect(text).toContain("ATTORNEY FLAGS None raised by this intake.");
  });

  it("is left off the client's copy", async () => {
    const text = extractPdfText(
      await renderIntakePdfBuffer(flaggedSubmission, "Jane Doe", {
        audience: "client",
      })
    );
    expect(text).not.toContain("ATTORNEY FLAGS");
    expect(text).toContain("SECTION 1 — CLIENT INFORMATION");
  });

  it("leads the notification email", () => {
    const body = buildFullEmailBody(
      flaggedSubmission,
      "Jane Doe",
      "jane@example.com",
      "7035550101",
      "today",
      true
    );
    expect(body.indexOf("ATTORNEY FLAGS")).toBeGreaterThan(-1);
    expect(body.indexOf("ATTORNEY FLAGS")).toBeLessThan(
      body.indexOf("SECTION 1")
    );
    expect(body).toContain(
      "Court-ordered obligations:\n    • Keep life insurance in force or name a specific beneficiary"
    );
  });

  it("ignores malformed flags instead of trusting stored JSON", () => {
    expect(
      readAttorneyFlags({
        attorneyFlags: [
          { label: "Kept", items: ["one", "", 7, null, "two"] },
          { label: "", items: ["no label"] },
          { label: "No items", items: [] },
          "nonsense",
          null,
        ],
      })
    ).toEqual([{ label: "Kept", items: ["one", "two"] }]);
    expect(readAttorneyFlags({ attorneyFlags: "nope" })).toBeNull();
    expect(readAttorneyFlags(null)).toBeNull();
  });
});

describe("intake.submit", () => {
  const caller = appRouter.createCaller({
    user: null,
    req: { headers: {} },
    res: {},
  } as TrpcContext);

  it("emails the attorney the flagged PDF and hands the client a copy without the box", async () => {
    const values = vi.fn().mockResolvedValue({});
    vi.mocked(getDb).mockResolvedValue({ insert: () => ({ values }) } as never);
    vi.mocked(isEmailConfigured).mockReturnValue(true);
    vi.mocked(sendEmail).mockResolvedValue(true);

    const formDataJson = JSON.stringify(flaggedSubmission);
    const result = await caller.intake.submit({
      clientName: "Jane Doe",
      clientEmail: "jane@example.com",
      clientPhone: "7035550101",
      formDataJson,
    });

    // stored exactly as submitted
    expect(values.mock.calls[0][0].formDataJson).toBe(formDataJson);

    const attached =
      vi.mocked(sendEmail).mock.calls[0][0].attachments![0].content;
    expect(extractPdfText(attached)).toContain("ATTORNEY FLAGS");
    expect(vi.mocked(sendEmail).mock.calls[0][0].text).toContain(
      "ATTORNEY FLAGS"
    );

    const clientCopy = Buffer.from(result.pdfBase64!, "base64");
    expect(clientCopy.subarray(0, 4).toString()).toBe("%PDF");
    expect(extractPdfText(clientCopy)).not.toContain("ATTORNEY FLAGS");
  });
});

// ── Phone formatting (item 16) ──────────────────────────────────────────────

describe("formatPhone", () => {
  it("formats a bare string of ten digits", () => {
    expect(formatPhone("7035550123")).toBe("(703) 555-0123");
  });
  it("normalizes other ways of writing the same number", () => {
    for (const v of [
      "703-555-0123",
      "703.555.0123",
      "(703)555-0123",
      " 703 555 0123 ",
      "17035550123",
      "+1 703 555 0123",
    ]) {
      expect(formatPhone(v), v).toBe("(703) 555-0123");
    }
  });
  it("leaves anything else exactly as entered", () => {
    for (const v of [
      "",
      "555-0123",
      "703-555-0123 x12",
      "sam@example.com",
      "+44 20 7946 0958",
      "—",
    ]) {
      expect(formatPhone(v), v).toBe(v.trim());
    }
  });
  it("is applied to phone fields in the PDF, and only to them", async () => {
    const text = extractPdfText(
      await renderIntakePdfBuffer(submissionBeforeChange, "Jane Doe")
    );
    expect(text).toContain("(703) 555-0101");
    expect(text).not.toContain("7035550101");
    expect(text).toContain("sam@example.com"); // a "Phone / Email" answer that is an email
  });
});
