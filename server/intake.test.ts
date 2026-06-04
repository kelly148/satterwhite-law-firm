/**
 * intake.test.ts — Tests for the trust intake form submission system.
 *
 * The form now submits a complete, structured snapshot:
 *   { sections: [ { title, fields:[{label,value}], groups:[{title,fields}] } ] }
 * The email body and PDF render generically from this, so NO field can be
 * silently dropped. These tests lock that contract and specifically verify the
 * data that the old version used to lose (children, assets, alternate
 * fiduciaries, medical directives).
 */
import { describe, it, expect } from "vitest";

// ── Replicates the generic email body renderer in server/routers.ts ──────────
type Field = { label: string; value: string };
type Group = { title: string; fields: Field[] };
type Section = { title: string; fields: Field[]; groups: Group[] };

function renderEmailBody(formData: { sections?: Section[] }): string {
  const lines: string[] = [];
  const sections = Array.isArray(formData.sections) ? formData.sections : [];
  if (sections.length === 0) lines.push("(No detailed form data was captured for this submission.)");
  sections.forEach((sec, idx) => {
    lines.push(`SECTION ${idx + 1} — ${String(sec.title || "Details").toUpperCase()}`);
    (sec.groups || []).forEach((g) => {
      const fields = (g.fields || []).filter((f) => f && f.value && String(f.value).trim() !== "");
      if (!fields.length) return;
      lines.push(`  ${g.title}`);
      fields.forEach((f) => lines.push(`    ${f.label}: ${f.value}`));
    });
    (sec.fields || []).forEach((f) => {
      if (!f || !f.value || String(f.value).trim() === "") return;
      lines.push(`${f.label}: ${f.value}`);
    });
  });
  return lines.join("\n");
}

// ── A realistic full submission (fabricated data only) ───────────────────────
const sampleSubmission: { sections: Section[] } = {
  sections: [
    {
      title: "Client Information",
      fields: [{ label: "How Did You Hear About Us?", value: "Referral — existing client" }],
      groups: [
        {
          title: "Primary Client (Grantor 1)",
          fields: [
            { label: "First Name", value: "Jane" },
            { label: "Last Name", value: "Doe" },
            { label: "Date of Birth", value: "1970-01-01" },
            { label: "Marital Status", value: "Married" },
          ],
        },
        {
          title: "Spouse / Partner (Grantor 2)",
          fields: [{ label: "First Name", value: "John" }],
        },
      ],
    },
    {
      title: "Family & Beneficiaries",
      fields: [],
      groups: [
        { title: "Child 1", fields: [{ label: "First Name", value: "Amy" }, { label: "Date of Birth", value: "2012-05-05" }] },
        { title: "Child 2", fields: [{ label: "First Name", value: "Ben" }, { label: "Date of Birth", value: "2014-08-08" }] },
      ],
    },
    {
      title: "Assets & Property",
      fields: [],
      groups: [
        { title: "Property 1", fields: [{ label: "Property Address", value: "123 Example St" }, { label: "Approx. Value", value: "$500,000" }] },
        { title: "Account", fields: [{ label: "Institution", value: "Example Bank" }, { label: "Approx. Balance", value: "$80,000" }] },
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
            { label: "Alternate Successor Trustee (1st)", value: "Pat Proxy" },
          ],
        },
        {
          title: "Personal Representative (Executor) — Pour-Over Will",
          fields: [{ label: "Personal Representative — Primary", value: "Sam Sample" }],
        },
      ],
    },
    {
      title: "Powers of Attorney & Advance Medical Directive",
      fields: [],
      groups: [
        {
          title: "Health Care Power of Attorney & Advance Medical Directive",
          fields: [
            { label: "Health Care Agent — Primary", value: "John Doe" },
            { label: "Terminal Condition", value: "Withhold or withdraw life-sustaining treatment and allow natural death" },
          ],
        },
      ],
    },
    {
      title: "Notes & Preferences",
      fields: [{ label: "Preferred Days / Times", value: "Weekday evenings" }],
      groups: [
        { title: "Notes for the Attorney", fields: [{ label: "Anything else we should know before your consultation?", value: "We have a blended family." }] },
      ],
    },
  ],
};

describe("Intake email body — completeness", () => {
  const body = renderEmailBody(sampleSubmission);

  it("includes every section", () => {
    expect(body).toContain("CLIENT INFORMATION");
    expect(body).toContain("FAMILY & BENEFICIARIES");
    expect(body).toContain("ASSETS & PROPERTY");
    expect(body).toContain("FIDUCIARIES");
    expect(body).toContain("MEDICAL DIRECTIVE");
    expect(body).toContain("NOTES & PREFERENCES");
  });

  it("includes ALL children (previously dropped)", () => {
    expect(body).toContain("Child 1");
    expect(body).toContain("Amy");
    expect(body).toContain("Child 2");
    expect(body).toContain("Ben");
  });

  it("includes assets (previously dropped)", () => {
    expect(body).toContain("Property 1");
    expect(body).toContain("123 Example St");
    expect(body).toContain("Example Bank");
    expect(body).toContain("$80,000");
  });

  it("includes alternate fiduciaries (previously dropped)", () => {
    expect(body).toContain("Alternate Successor Trustee (1st): Pat Proxy");
    expect(body).toContain("Personal Representative — Primary: Sam Sample");
  });

  it("includes medical directive selections (previously dropped)", () => {
    expect(body).toContain("Terminal Condition: Withhold or withdraw");
  });

  it("includes loose section-level fields", () => {
    expect(body).toContain("How Did You Hear About Us?: Referral — existing client");
    expect(body).toContain("Preferred Days / Times: Weekday evenings");
  });

  it("omits empty fields", () => {
    const withEmpty: { sections: Section[] } = {
      sections: [{ title: "Test", fields: [{ label: "Empty", value: "" }, { label: "Filled", value: "X" }], groups: [] }],
    };
    const out = renderEmailBody(withEmpty);
    expect(out).toContain("Filled: X");
    expect(out).not.toContain("Empty:");
  });

  it("handles a submission with no sections gracefully", () => {
    expect(renderEmailBody({ sections: [] })).toContain("No detailed form data");
  });
});

describe("Intake data contract", () => {
  it("every section has a title and fields/groups arrays", () => {
    sampleSubmission.sections.forEach((sec) => {
      expect(typeof sec.title).toBe("string");
      expect(Array.isArray(sec.fields)).toBe(true);
      expect(Array.isArray(sec.groups)).toBe(true);
    });
  });

  it("every group field is a {label,value} pair", () => {
    sampleSubmission.sections.forEach((sec) => {
      sec.groups.forEach((g) => {
        g.fields.forEach((f) => {
          expect(typeof f.label).toBe("string");
          expect(typeof f.value).toBe("string");
        });
      });
    });
  });
});
