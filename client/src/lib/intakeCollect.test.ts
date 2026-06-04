// @vitest-environment jsdom
/**
 * UAT for the intake form collector.
 *
 * Loads the REAL intake form HTML, simulates a client filling it out (including
 * a child, an asset, and an alternate trustee — the data that used to be
 * silently dropped), then runs the collector and asserts everything is captured.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { collectIntakeData } from "./intakeCollect";
import { INTAKE_HTML } from "@/pages/IntakeForm";

// Append a repeat-item subsection the way the form's "+ Add" buttons do.
function addSubsection(listId: string, title: string, fieldLabels: string[]): HTMLElement {
  const list = document.getElementById(listId)!;
  const sub = document.createElement("div");
  sub.className = "subsection";
  let html = `<div class="subsection-title">${title}</div>`;
  for (const label of fieldLabels) {
    html += `<div class="form-row"><div class="form-group"><label>${label}</label><input type="text"></div></div>`;
  }
  sub.innerHTML = html;
  list.appendChild(sub);
  return sub;
}

function setInputUnderLabel(scope: ParentNode, labelText: string, value: string) {
  const groups = Array.from(scope.querySelectorAll(".form-group"));
  for (const g of groups) {
    const lab = g.querySelector("label");
    if (lab && lab.textContent && lab.textContent.replace("*", "").trim().startsWith(labelText)) {
      const input = g.querySelector("input, textarea") as HTMLInputElement | null;
      if (input) { input.value = value; return; }
    }
  }
  throw new Error(`No input found for label "${labelText}"`);
}

function findData(data: ReturnType<typeof collectIntakeData>, sectionMatch: RegExp) {
  return data.sections.find((s) => sectionMatch.test(s.title));
}

describe("Intake collector UAT — real form HTML", () => {
  beforeEach(() => {
    document.body.innerHTML = INTAKE_HTML;
  });

  it("captures primary client info", () => {
    const root = document.getElementById("intake-wrapper")!;
    (root.querySelector("#g1-first") as HTMLInputElement).value = "Jane";
    (root.querySelector("#g1-last") as HTMLInputElement).value = "Doe";
    (root.querySelector("#g1-email") as HTMLInputElement).value = "jane@example.com";
    (root.querySelector("#g1-marital") as HTMLSelectElement).value = "Married";

    const data = collectIntakeData(root);
    const client = findData(data, /Client Information/i)!;
    expect(client).toBeTruthy();
    const primary = client.groups.find((g) => /Primary Client/i.test(g.title))!;
    const labels = primary.fields.map((f) => `${f.label}: ${f.value}`);
    expect(labels).toContain("First Name: Jane");
    expect(labels).toContain("Last Name: Doe");
    expect(labels).toContain("Email: jane@example.com");
    expect(labels).toContain("Marital Status: Married");
  });

  it("captures a child the client added (previously dropped)", () => {
    const root = document.getElementById("intake-wrapper")!;
    const child = addSubsection("childrenList", "Child 1", ["First Name", "Last Name"]);
    setInputUnderLabel(child, "First Name", "Amy");
    setInputUnderLabel(child, "Last Name", "Doe");

    const data = collectIntakeData(root);
    const family = findData(data, /Family/i)!;
    const childGroup = family.groups.find((g) => g.title === "Child 1")!;
    expect(childGroup).toBeTruthy();
    expect(childGroup.fields.map((f) => f.value)).toEqual(expect.arrayContaining(["Amy", "Doe"]));
  });

  it("captures an asset the client added (previously dropped)", () => {
    const root = document.getElementById("intake-wrapper")!;
    const prop = addSubsection("realPropertyList", "Property 1", ["Property Address", "Approx. Value"]);
    setInputUnderLabel(prop, "Property Address", "123 Example St");
    setInputUnderLabel(prop, "Approx. Value", "$500,000");

    const data = collectIntakeData(root);
    const assets = findData(data, /Assets/i)!;
    const propGroup = assets.groups.find((g) => g.title === "Property 1")!;
    expect(propGroup).toBeTruthy();
    const vals = propGroup.fields.map((f) => f.value);
    expect(vals).toContain("123 Example St");
    expect(vals).toContain("$500,000");
  });

  it("captures the ALTERNATE trustee, not just the primary (previously dropped)", () => {
    const root = document.getElementById("intake-wrapper")!;
    (root.querySelector("#trustee1") as HTMLInputElement).value = "Sam Sample";
    setInputUnderLabel(root, "Alternate Successor Trustee (1st)", "Pat Proxy");

    const data = collectIntakeData(root);
    const fid = findData(data, /Fiduciaries/i)!;
    const trusteeGroup = fid.groups.find((g) => /Trustee/i.test(g.title))!;
    const flat = trusteeGroup.fields.map((f) => `${f.label}: ${f.value}`).join(" | ");
    expect(flat).toContain("Sam Sample");
    expect(flat).toContain("Pat Proxy");
  });

  it("captures a radio selection by its visible text (previously stored as 'on')", () => {
    const root = document.getElementById("intake-wrapper")!;
    const terminalRadio = root.querySelector('input[name="terminal"]') as HTMLInputElement;
    terminalRadio.checked = true;

    const data = collectIntakeData(root);
    const all = data.sections.flatMap((s) => [...s.fields, ...s.groups.flatMap((g) => g.fields)]);
    const terminal = all.find((f) => /Terminal Condition/i.test(f.label));
    expect(terminal).toBeTruthy();
    expect(terminal!.value).toMatch(/Withhold or withdraw/i);
    expect(terminal!.value).not.toBe("on");
  });

  it("skips hidden conditional sections (e.g. spouse when not enabled)", () => {
    const root = document.getElementById("intake-wrapper")!;
    const data = collectIntakeData(root);
    const client = findData(data, /Client Information/i);
    const hasSpouseGroup = client?.groups.some((g) => /Spouse/i.test(g.title));
    expect(hasSpouseGroup).toBeFalsy();
  });

  it("captures the spouse group once enabled", () => {
    const root = document.getElementById("intake-wrapper")!;
    (root.querySelector("#hasSpouse") as HTMLInputElement).checked = true;
    (root.querySelector("#spouseSection") as HTMLElement).classList.remove("hidden");
    (root.querySelector("#g2-first") as HTMLInputElement).value = "John";

    const data = collectIntakeData(root);
    const client = findData(data, /Client Information/i)!;
    const spouse = client.groups.find((g) => /Spouse/i.test(g.title));
    expect(spouse).toBeTruthy();
    expect(spouse!.fields.map((f) => f.value)).toContain("John");
  });
});
