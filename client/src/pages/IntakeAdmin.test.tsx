/**
 * The admin view of a stored submission: flags first for new submissions, and
 * (acceptance test 6) older submissions opening exactly as they did before.
 *
 * All names and details here are invented.
 */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FormDataViewer } from "./IntakeAdmin";

const before = {
  sections: [
    {
      title: "Client Information",
      fields: [],
      groups: [
        {
          title: "Primary Client (Grantor 1)",
          fields: [
            { label: "First Name", value: "Jane" },
            { label: "Phone", value: "7035550101" },
          ],
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
            { label: "Alternate Successor Trustee (1st)", value: "Pat Proxy" },
          ],
        },
      ],
    },
  ],
};

const view = (data: unknown) =>
  renderToStaticMarkup(
    <FormDataViewer formDataJson={JSON.stringify(data)} formType="trust" />
  );

describe("admin view of an intake submission", () => {
  it("opens a submission saved before this change, with no flags panel and no 'undefined'", () => {
    const html = view(before);
    expect(html).toContain("Section 1 — Client Information");
    expect(html).toContain("Alternate Successor Trustee (1st)");
    expect(html).toContain("Pat Proxy");
    expect(html).not.toContain("Attorney flags");
    expect(html).not.toMatch(/undefined|\[object/);
  });

  it("opens the oldest stored shape through its fallback", () => {
    const html = view({
      "g1-first": "Jane",
      subsections: [
        { title: "Trustee", fields: { "Successor Trustee": "Sam Sample" } },
      ],
    });
    expect(html).toContain("Sam Sample");
    expect(html).not.toMatch(/undefined|\[object/);
  });

  it("shows the attorney flags above the sections for a new submission", () => {
    const html = view({
      ...before,
      attorneyFlags: [
        { label: "Children excluded from the plan", items: ["Robin Example"] },
      ],
    });
    expect(html.indexOf("Attorney flags")).toBeGreaterThan(-1);
    expect(html.indexOf("Attorney flags")).toBeLessThan(
      html.indexOf("Section 1")
    );
    expect(html).toContain("Children excluded from the plan");
    expect(html).toContain("Robin Example");
  });

  it("formats phone numbers", () => {
    expect(view(before)).toContain("(703) 555-0101");
  });
});
