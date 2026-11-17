// @vitest-environment jsdom
/**
 * Acceptance tests for the trust intake form.
 *
 * Each test mounts the REAL form HTML with the REAL behavior module, fills it in
 * the way a client would (firing the same input/change events a browser does),
 * and where the PDF matters, renders the submission with the real PDF generator
 * and reads the text back out.
 *
 * All names and details here are invented.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { INTAKE_HTML } from "@/pages/IntakeForm";
import {
  STEP_COUNT,
  addEntry,
  addRow,
  ageOn,
  buildSubmission,
  mountIntakeForm,
  validateStep,
  type IntakeSubmission,
} from "./intakeBehavior";
import {
  BACKUP_WARNING,
  EXCLUDED_CHILD_NOTE,
  LAST_DEATH_HELP,
} from "./intakeTemplates";
import { renderIntakePdfBuffer } from "../../../server/generateIntakePdf";
import { extractPdfTextFlat } from "../../../server/__testutils__/pdfText";

let root: HTMLElement;
let submitted: IntakeSubmission[];
let unmount: (() => void) | undefined;

beforeEach(() => {
  unmount?.();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  document.body.innerHTML = INTAKE_HTML;
  root = document.getElementById("intake-wrapper")!;
  submitted = [];
  unmount = mountIntakeForm(root, { onSubmit: d => submitted.push(d) });
});

// ── Helpers ─────────────────────────────────────────────────────────────────

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function el<T extends HTMLElement = HTMLElement>(
  sel: string,
  scope: ParentNode = root
): T {
  const found = scope.querySelector<T>(sel);
  if (!found) throw new Error(`No element matches ${sel}`);
  return found;
}

function fire(target: HTMLElement) {
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new Event("change", { bubbles: true }));
}

function set(target: string | Field, value: string, scope: ParentNode = root) {
  const field = typeof target === "string" ? el<Field>(target, scope) : target;
  field.value = value;
  fire(field);
}

function check(
  target: string | HTMLInputElement,
  on = true,
  scope: ParentNode = root
) {
  const box =
    typeof target === "string" ? el<HTMLInputElement>(target, scope) : target;
  box.checked = on;
  fire(box);
}

const shown = (sel: string, scope: ParentNode = root) =>
  !el(sel, scope).closest(".hidden");
const person = (p: 1 | 2, k: string) =>
  el<HTMLInputElement>(`[data-person="${p}"] [data-k="${k}"]`);
const court = (p: 1 | 2) => el(`[data-court="${p}"]`);
const next = () =>
  (window as unknown as { intakeNavigate: (d: number) => void }).intakeNavigate(
    1
  );
const activeStep = () =>
  Number(el(".section.active").id.replace("section-", ""));
const errorText = () =>
  Array.from(root.querySelectorAll(".field-error"))
    .map(e => e.textContent)
    .join(" | ");

function dobYearsAgo(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function fillClient() {
  set("#g1-first", "Jane");
  set("#g1-mid", "Quincy");
  set("#g1-last", "Testerson");
  set("#g1-dob", "1980-03-04");
  set("#g1-email", "jane@example.com");
  set("#g1-phone", "7035550101");
  set("#g1-addr", "100 Example Lane");
  set("#g1-city", "Alexandria");
  set("#g1-state", "VA");
}

function fillSpouse() {
  check("#hasSpouse");
  set("#g2-first", "John");
  set("#g2-last", "Testerson");
  set("#g2-dob", "1979-05-06");
  set("#g2-email", "john@example.com");
  set("#g2-phone", "7035550102");
}

/** Never married before, no court orders, no judgment. */
function answerGates(p: 1 | 2) {
  set('[data-name="marriedBefore"]', "No", court(p));
  check("[data-order-none]", true, court(p));
  set('[data-name="judgment"]', "No", court(p));
}

function fillChild(
  entry: HTMLElement,
  c: {
    first: string;
    last: string;
    dob: string;
    parentage?: string;
    share1?: string;
    share2?: string;
  }
) {
  set("[data-child-first]", c.first, entry);
  set("[data-child-last]", c.last, entry);
  set("[data-child-dob]", c.dob, entry);
  if (c.parentage) set("[data-child-parentage]", c.parentage, entry);
  if (c.share1) set('[data-child-share="1"]', c.share1, entry);
  if (c.share2) set('[data-child-share="2"]', c.share2, entry);
}

const firstChild = () => el("#childrenList > .subsection");

function goToStep(step: number) {
  for (let guard = 0; activeStep() < step && guard < 10; guard++) {
    const before = activeStep();
    next();
    if (activeStep() === before)
      throw new Error(`Blocked on step ${before}: ${errorText()}`);
  }
}

function submit(): IntakeSubmission {
  goToStep(STEP_COUNT - 1);
  next();
  if (submitted.length !== 1)
    throw new Error(
      `Submit was blocked on step ${activeStep()}: ${errorText()}`
    );
  return submitted[0];
}

const groupTitles = (data: IntakeSubmission) =>
  data.sections.flatMap(s => s.groups.map(g => g.title));

function group(data: IntakeSubmission, title: string | RegExp) {
  const all = data.sections.flatMap(s => s.groups);
  const found = all.find(g =>
    typeof title === "string" ? g.title === title : title.test(g.title)
  );
  if (!found)
    throw new Error(
      `No group titled ${title}. Have: ${all.map(g => g.title).join("; ")}`
    );
  return Object.fromEntries(found.fields.map(f => [f.label, f.value]));
}

const flag = (data: IntakeSubmission, label: string) =>
  data.attorneyFlags.find(f => f.label === label)?.items ?? [];

/**
 * Render the submission the way the server would and read the text back.
 * Set INTAKE_SAMPLE_DIR to also keep the PDF itself, e.g. to attach samples to
 * a pull request:  INTAKE_SAMPLE_DIR=./samples pnpm test intakeBehavior
 */
async function pdfText(
  data: IntakeSubmission,
  audience: "attorney" | "client" = "attorney",
  sample?: string
) {
  const pdf = await renderIntakePdfBuffer(data, data.clientName, { audience });
  const dir = process.env.INTAKE_SAMPLE_DIR;
  if (sample && dir) writeFileSync(join(dir, `${sample}.pdf`), pdf);
  return extractPdfTextFlat(pdf);
}

// ── Acceptance test 1 ───────────────────────────────────────────────────────

describe("1. single client, no children, never married before", () => {
  beforeEach(() => {
    fillClient();
    set("#g1-marital", "Single");
    answerGates(1);
  });

  it("is offered a backup for every fiduciary role", () => {
    for (const role of ["trustee", "pr", "agent", "hca"]) {
      expect(
        shown(`[data-person="1"] [data-k="${role}.backup1.name"]`),
        role
      ).toBe(true);
      for (const f of ["relationship", "cityState", "phone", "email"]) {
        expect(
          shown(`[data-person="1"] [data-k="${role}.backup1.${f}"]`),
          `${role}.${f}`
        ).toBe(true);
      }
    }
    expect(shown('[data-person="1"] [data-k="hca.primary.street"]')).toBe(true);
  });

  it("sees none of the other new Tier 1 sections", () => {
    expect(shown("#spouseSection")).toBe(false);
    expect(shown('[data-court="2"]')).toBe(false);
    expect(shown("#guardianSection")).toBe(false);
    expect(shown("#minorSection")).toBe(false);
    for (const block of Array.from(
      root.querySelectorAll('[data-person="2"]')
    )) {
      expect(block.classList.contains("hidden")).toBe(true);
    }
    // follow-ups to the yes/no questions stay closed
    expect(shown("[data-order-delivery]", court(1))).toBe(false);
    expect(shown("[data-judgment-detail]", court(1))).toBe(false);
    // per-child questions that only apply to a couple
    expect(shown("[data-child-parentage]")).toBe(false);
    expect(shown('[data-child-share="2"]')).toBe(false);
  });

  it("can submit, and the record carries no spouse or guardian sections", () => {
    set(person(1, "trustee.primary.name"), "Pat Example");
    set(person(1, "trustee.backup1.name"), "Sam Example");
    const data = submit();
    const titles = groupTitles(data);
    expect(titles).toContain("Trustee");
    expect(titles.filter(t => /Spouse|Guardian/.test(t))).toEqual([]);
    expect(group(data, "Trustee")).toMatchObject({
      "Successor Trustee — Primary": "Pat Example",
      "Successor Trustee — First Backup": "Sam Example",
    });
    expect(group(data, "Prior Marriages & Court Orders")).toMatchObject({
      "Have you been married before?": "No",
      "Is there any unpaid court judgment against you?": "No",
    });
  });

  it("keeps all seven sections, in order, so an empty one is visible rather than renumbered away", async () => {
    const data = submit();
    expect(data.sections.map(s => s.title)).toEqual([
      "Client Information",
      "Family & Beneficiaries",
      "Assets & Property",
      "Distribution Plan",
      "Fiduciaries",
      "Powers of Attorney & Advance Medical Directive",
      "Notes & Preferences",
    ]);
    const family = data.sections[1];
    expect(family.groups).toEqual([]);
    expect(family.fields).toEqual([]);

    const text = await pdfText(data);
    expect(text).toContain(
      "SECTION 2 — FAMILY & BENEFICIARIES No answers were given in this section. SECTION 3 — ASSETS & PROPERTY"
    );
    expect(text).toContain("SECTION 5 — FIDUCIARIES");
    expect(text).toContain(
      "SECTION 6 — POWERS OF ATTORNEY & ADVANCE MEDICAL DIRECTIVE"
    );
  });

  it("must answer the prior-marriage and court-order questions", () => {
    set('[data-name="marriedBefore"]', "", court(1));
    check("[data-order-none]", false, court(1));
    next();
    expect(activeStep()).toBe(0);
    expect(errorText()).toMatch(/married before/);
    expect(errorText()).toMatch(/None of these/);
  });
});

// ── Acceptance test 2 ───────────────────────────────────────────────────────

describe("2. married couple with one minor child of both", () => {
  beforeEach(() => {
    fillClient();
    fillSpouse();
    answerGates(1);
    answerGates(2);
    goToStep(1);
    fillChild(firstChild(), {
      first: "Alex",
      last: "Testerson",
      dob: dobYearsAgo(7),
      parentage: "both",
      share1: "Yes",
      share2: "Yes",
    });
  });

  it("derives minor status from the date of birth instead of asking", () => {
    expect(el<HTMLInputElement>("[data-child-minor]").value).toMatch(
      /^Yes \(age \d\)$/
    );
    expect(root.textContent).not.toMatch(/Currently a Minor\?/);
  });

  it("shows the guardian section and requires an answer", () => {
    expect(shown("#guardianSection")).toBe(true);
    goToStep(4);
    next();
    expect(activeStep()).toBe(4);
    expect(errorText()).toMatch(
      /Name a guardian, or check "We have not decided yet"/
    );
  });

  it('accepts "We have not decided yet" and records it explicitly', () => {
    goToStep(4);
    check("#guardianUndecided");
    const data = submit();
    expect(group(data, /^Guardian/)).toEqual({
      "We have not decided yet": "Yes",
    });
    expect(flag(data, "Guardian for minor children")).toEqual([
      "Not decided yet",
    ]);
  });

  it("accepts a named guardian and backup, asked once for both spouses", () => {
    goToStep(4);
    set("#guardian1", "Morgan Example");
    set("#guardian1-rel", "Sister");
    set("#guardian1-city", "Richmond, VA");
    next();
    expect(activeStep()).toBe(4); // backup and the agreement question are still open
    set("#guardian2", "Riley Example");
    set("#guardian2-rel", "Friend");
    set("#guardian2-city", "Fairfax, VA");
    set("#guardianAgree", "Yes");
    const data = submit();
    expect(root.querySelectorAll("#guardianSection").length).toBe(1);
    expect(
      group(data, "Guardian (Minor Children) — Both Spouses")
    ).toMatchObject({
      "Guardian — Primary": "Morgan Example",
      "Guardian — Backup": "Riley Example",
      "Do both of you agree on this choice?": "Yes",
    });
    expect(flag(data, "Guardian for minor children")).toEqual([]);
  });

  it("prints each spouse's medical answers under that spouse's own name in the PDF", async () => {
    goToStep(4);
    check("#guardianUndecided");
    goToStep(5);
    check(person(1, "terminal.0")); // withhold
    check(person(2, "terminal.1")); // continue
    set(person(1, "amd.notes"), "Jane note about comfort care");
    set(person(2, "amd.notes"), "John note about second opinions");
    const data = submit();

    const text = await pdfText(
      data,
      "attorney",
      "test-2-married-couple-minor-child"
    );
    const jane = text.indexOf(
      "Spouse 1 (Jane Testerson) — Health Care Power of Attorney"
    );
    const john = text.indexOf(
      "Spouse 2 (John Testerson) — Health Care Power of Attorney"
    );
    expect(jane).toBeGreaterThan(-1);
    expect(john).toBeGreaterThan(jane);

    const janeBlock = text.slice(jane, john);
    const johnBlock = text.slice(john);
    expect(janeBlock).toContain(
      "Withhold or withdraw life-sustaining treatment"
    );
    expect(janeBlock).toContain("Jane note about comfort care");
    expect(janeBlock).not.toContain("John note about second opinions");
    expect(johnBlock).toContain("Continue all life-sustaining treatment");
    expect(johnBlock).toContain("John note about second opinions");

    // No fiduciary or directive heading is left unattributed.
    const unattributed = groupTitles(data).filter(
      t =>
        /Trustee|Personal Representative|Power of Attorney|HIPAA/.test(t) &&
        !/^Spouse [12] \(/.test(t)
    );
    expect(unattributed).toEqual([]);
  });
});

// ── Acceptance test 3 ───────────────────────────────────────────────────────

describe("3. married couple, blended family", () => {
  beforeEach(() => {
    fillClient();
    fillSpouse();
    answerGates(1);
    answerGates(2);
    goToStep(1);
    check("#blendedFamily");
    fillChild(firstChild(), {
      first: "Alex",
      last: "Testerson",
      dob: dobYearsAgo(25),
      parentage: "both",
      share1: "Yes",
      share2: "Yes",
    });
  });

  it("requires at least one child from a prior relationship", () => {
    next();
    expect(activeStep()).toBe(1);
    expect(errorText()).toMatch(/blended family/);
  });

  it("requires a parentage value and an answer from each spouse for every child", () => {
    const robin = addEntry(root, "child");
    fillChild(robin, { first: "Robin", last: "Example", dob: dobYearsAgo(22) });
    next();
    expect(activeStep()).toBe(1);
    expect(errorText()).toMatch(/whose child this is/);
    expect(errorText()).toMatch(/should receive a share/);
  });

  it("records parentage and each spouse's answer, and shows both in the PDF", async () => {
    const robin = addEntry(root, "child");
    fillChild(robin, {
      first: "Robin",
      last: "Example",
      dob: dobYearsAgo(22),
      parentage: "p1",
      share1: "Yes",
      share2: "No",
    });
    expect(el('[data-show-if="share2=No"]', robin).textContent).toBe(
      EXCLUDED_CHILD_NOTE
    );
    expect(shown('[data-show-if="share2=No"]', robin)).toBe(true);
    expect(shown('[data-show-if="share1=No"]', robin)).toBe(false);

    const data = submit();
    expect(group(data, "Child 1")).toMatchObject({
      "This child is": "A child of both of us",
      "Spouse 1 (Jane Testerson): Should this child receive a share under your plan?":
        "Yes",
      "Spouse 2 (John Testerson): Should this child receive a share under your plan?":
        "Yes",
    });
    expect(group(data, "Child 2")).toMatchObject({
      "This child is":
        "Spouse 1 (Jane Testerson)'s child from a prior relationship",
      "Spouse 1 (Jane Testerson): Should this child receive a share under your plan?":
        "Yes",
      "Spouse 2 (John Testerson): Should this child receive a share under your plan?":
        "No",
    });
    expect(flag(data, "Children excluded from the plan")).toEqual([
      "Robin Example, per Spouse 2 (John Testerson)",
    ]);

    const text = await pdfText(data, "attorney", "test-3-blended-family");
    expect(text).toContain(
      "Spouse 1 (Jane Testerson)'s child from a prior relationship"
    );
    expect(text.toUpperCase()).toContain(
      "SPOUSE 2 (JOHN TESTERSON): SHOULD THIS CHILD RECEIVE A SHARE UNDER YOUR PLAN?"
    );
    expect(text).toContain("CHILDREN EXCLUDED FROM THE PLAN");
    expect(text).toContain("Robin Example, per Spouse 2 (John Testerson)");
  });

  it('says which children share when the plan refers to "children"', () => {
    const robin = addEntry(root, "child");
    fillChild(robin, {
      first: "Robin",
      last: "Example",
      dob: dobYearsAgo(22),
      parentage: "p1",
      share1: "Yes",
      share2: "No",
    });
    goToStep(3);
    check('input[name="distType"][value="equal"]');
    set('[data-name="tangible"]', "spouse-children");
    const data = buildSubmission(root);
    const expected =
      "Spouse 1 (Jane Testerson) — Included: Alex Testerson, Robin Example\n" +
      "Spouse 2 (John Testerson) — Included: Alex Testerson. Not included: Robin Example";
    expect(
      group(data, "Upon Death of Last (or Sole) Grantor")[
        "Children Who Share (from your answers in Section 2)"
      ]
    ).toBe(expected);
    expect(group(data, "Personal Property & Tangible Assets")).toMatchObject({
      "Distribution of Tangible Personal Property":
        "All to surviving spouse; then equally to children",
      "Children Who Share (from your answers in Section 2)": expected,
    });
  });
});

// ── Acceptance test 4 ───────────────────────────────────────────────────────

describe("4. joint plan: the last-death beneficiary may not be a grantor", () => {
  beforeEach(() => {
    fillClient();
    fillSpouse();
    answerGates(1);
    answerGates(2);
    goToStep(3);
  });

  it("explains who this question is about", () => {
    expect(el("[data-last-death-help]").textContent).toBe(LAST_DEATH_HELP);
    expect(LAST_DEATH_HELP).toBe(
      "This is who inherits after both of you have died."
    );
  });

  it("blocks the spouse entered by name as a beneficiary", () => {
    const row = addRow(root, "lastBen");
    set("[data-lastben-name]", "John Testerson", row);
    next();
    expect(activeStep()).toBe(3);
    expect(errorText()).toContain(LAST_DEATH_HELP);
  });

  it("blocks either grantor, however the name is written", () => {
    const row = addRow(root, "lastBen");
    for (const name of [
      "jane testerson",
      "Jane Quincy Testerson",
      "Jane Q. Testerson",
      "JOHN TESTERSON",
    ]) {
      set("[data-lastben-name]", name, row);
      expect(validateStep(root, 3), name).toHaveLength(1);
    }
  });

  it("blocks a beneficiary described as the spouse", () => {
    const row = addRow(root, "lastBen");
    set("[data-lastben-name]", "Johnny", row);
    set("[data-lastben-rel]", "Husband", row);
    expect(validateStep(root, 3)[0].message).toContain(LAST_DEATH_HELP);
  });

  it("blocks free text that leaves everything to the spouse", () => {
    for (const plan of [
      "Everything to my wife.",
      "All to my husband, then the kids",
      "100% to John Testerson",
    ]) {
      set("#distPlan", plan);
      expect(validateStep(root, 3), plan).toHaveLength(1);
    }
  });

  it("does not block other people who merely resemble a grantor", () => {
    const row = addRow(root, "lastBen");
    set("[data-lastben-name]", "John Testerson Jr.", row);
    set("[data-lastben-rel]", "Son", row);
    set(
      "#distPlan",
      "Half to our son John Testerson Jr.; half to my wife's sister Dana Example. A child's spouse takes nothing."
    );
    expect(validateStep(root, 3)).toEqual([]);
    next();
    expect(activeStep()).toBe(4);
  });

  it("does not apply to a sole-grantor plan, where the spouse can inherit", () => {
    check("#hasSpouse", false);
    set("#g1-marital", "Married");
    set("#distPlan", "Everything to my husband.");
    expect(validateStep(root, 3)).toEqual([]);
  });
});

// ── Acceptance test 5 ───────────────────────────────────────────────────────

describe("5. required by court order to keep life insurance", () => {
  beforeEach(() => {
    fillClient();
    set('[data-name="marriedBefore"]', "Yes", court(1));
    check('[data-name="oInsurance"]', true, court(1));
    set('[data-name="judgment"]', "No", court(1));
  });

  it("asks for the decree and explains why", () => {
    expect(shown("[data-order-delivery]", court(1))).toBe(true);
    const notice = el(".notice", court(1));
    expect(shown(".notice", court(1))).toBe(true);
    expect(notice.textContent).toContain(
      "Send us the decree or order (all pages)."
    );
    expect(notice.textContent).toContain(
      "Please send the full signed order, including any later changes. Your attorney needs to read it before drafting."
    );
  });

  it('keeps "None of these" and a real obligation from both being checked', () => {
    check("[data-order-none]", true, court(1));
    expect(
      el<HTMLInputElement>('[data-name="oInsurance"]', court(1)).checked
    ).toBe(false);
    check('[data-name="oInsurance"]', true, court(1));
    expect(el<HTMLInputElement>("[data-order-none]", court(1)).checked).toBe(
      false
    );
  });

  it("prints the checked obligations in the flags box at the top of the PDF", async () => {
    set(
      "[data-order-detail]",
      "Keep a $250,000 policy for the children",
      court(1)
    );
    set("[data-order-delivery]", "I will email it", court(1));
    const data = submit();
    expect(flag(data, "Court-ordered obligations")).toEqual([
      "Keep life insurance in force or name a specific beneficiary",
      "Order requires: Keep a $250,000 policy for the children",
      "Decree or order: I will email it",
    ]);

    const text = await pdfText(
      data,
      "attorney",
      "test-5-court-ordered-life-insurance"
    );
    const flags = text.indexOf("ATTORNEY FLAGS");
    const obligation = text.indexOf(
      "Keep life insurance in force or name a specific beneficiary"
    );
    const firstSection = text.indexOf("SECTION 1");
    expect(flags).toBeGreaterThan(-1);
    expect(obligation).toBeGreaterThan(flags);
    expect(obligation).toBeLessThan(firstSection);
  });

  it("leaves the flags box off the copy handed back to the client", async () => {
    const data = submit();
    const client = await pdfText(data, "client");
    expect(client).not.toContain("ATTORNEY FLAGS");
    // the answer itself is still in the body of the client's copy
    expect(client).toContain(
      "Keep life insurance in force or name a specific beneficiary"
    );
  });
});

// ── Fiduciaries: backups, reuse, and the spouse copy ────────────────────────

describe("fiduciary roles", () => {
  beforeEach(() => {
    fillClient();
    answerGates(1);
  });

  it("warns, without blocking, when a backup is left blank", () => {
    const warning = el(
      "[data-backup-warning]",
      el('[data-person="1"] [data-role="trustee"]')
    );
    expect(warning.textContent).toBe(BACKUP_WARNING);
    expect(warning.classList.contains("hidden")).toBe(true);
    set(person(1, "trustee.primary.name"), "Pat Example");
    expect(warning.classList.contains("hidden")).toBe(false);
    expect(validateStep(root, 4)).toEqual([]);
    set(person(1, "trustee.backup1.name"), "Sam Example");
    expect(warning.classList.contains("hidden")).toBe(true);
  });

  it("flags every role that has no backup, and every role with no one named", () => {
    set(person(1, "trustee.primary.name"), "Pat Example");
    set(person(1, "agent.primary.name"), "Pat Example");
    set(person(1, "agent.backup1.name"), "Sam Example");
    const data = buildSubmission(root);
    expect(flag(data, "Roles with no backup")).toEqual([
      "No one named as personal representative, health care agent",
      "No backup for successor trustee",
    ]);
  });

  it('reuses the trustee choices with one click on "Same people as my successor trustees"', () => {
    set(person(1, "trustee.primary.name"), "Pat Example");
    set(person(1, "trustee.primary.phone"), "7035550111");
    set(person(1, "trustee.backup1.name"), "Sam Example");
    check(person(1, "pr.same"));
    expect(person(1, "pr.primary.name").value).toBe("Pat Example");
    expect(person(1, "pr.primary.phone").value).toBe("7035550111");
    expect(person(1, "pr.backup1.name").value).toBe("Sam Example");
    // it follows later edits to the trustee
    set(person(1, "trustee.backup1.name"), "Sam Q. Example");
    expect(person(1, "pr.backup1.name").value).toBe("Sam Q. Example");
    // and the reused names are saved under the role itself
    const data = buildSubmission(root);
    expect(
      group(data, "Personal Representative (Executor) — Pour-Over Will")
    ).toMatchObject({
      "Same people as my successor trustees": "Yes",
      "Personal Representative — Primary": "Pat Example",
      "Personal Representative — First Backup": "Sam Q. Example",
    });
  });

  it("defaults the HIPAA individuals to the health care agents", () => {
    const data = buildSubmission(root);
    expect(group(data, "HIPAA Authorization")).toEqual({
      "Same people as my health care agents": "Yes",
    });
    check(person(1, "hipaa.same"), false);
    expect(shown('[data-person="1"] [data-k="hipaa.primary.name"]')).toBe(true);
  });

  it("offers an optional second backup", () => {
    expect(shown('[data-person="1"] [data-k="trustee.backup2.name"]')).toBe(
      false
    );
    el('[data-person="1"] [data-role="trustee"] [data-open-b2]').click();
    expect(shown('[data-person="1"] [data-k="trustee.backup2.name"]')).toBe(
      true
    );
  });
});

describe('spouse 2: "Same answers as my spouse"', () => {
  beforeEach(() => {
    fillClient();
    fillSpouse();
    // Jane names her husband first, then her sister.
    set(person(1, "trustee.primary.name"), "John Testerson");
    set(person(1, "trustee.primary.relationship"), "Husband");
    set(person(1, "trustee.backup1.name"), "Morgan Example");
    set(person(1, "trustee.backup1.relationship"), "Sister");
    check(person(1, "terminal.0"));
    set(person(1, "amd.organ"), "Yes — any organs and tissue");
    check(el<HTMLInputElement>(".p2-same-cb"));
  });

  it("copies the answers and swaps the spouses in the roles where one names the other", () => {
    expect(person(2, "trustee.primary.name").value).toBe(
      "Jane Quincy Testerson"
    );
    expect(person(2, "trustee.primary.relationship").value).toBe("Spouse");
    expect(person(2, "trustee.primary.phone").value).toBe("7035550101");
    expect(person(2, "trustee.primary.email").value).toBe("jane@example.com");
    expect(person(2, "trustee.primary.cityState").value).toBe("Alexandria, VA");
    // everyone else is carried over unchanged
    expect(person(2, "trustee.backup1.name").value).toBe("Morgan Example");
    expect(person(2, "trustee.backup1.relationship").value).toBe("Sister");
    expect(person(2, "terminal.0").checked).toBe(true);
    expect(person(2, "amd.organ").value).toBe("Yes — any organs and tissue");
  });

  it("stores spouse 2's answers as their own values", () => {
    const data = buildSubmission(root);
    expect(
      group(data, "Spouse 1 (Jane Testerson) — Trustee")[
        "Successor Trustee — Primary"
      ]
    ).toBe("John Testerson");
    expect(group(data, "Spouse 2 (John Testerson) — Trustee")).toMatchObject({
      "Successor Trustee — Primary": "Jane Quincy Testerson",
      "Primary — Relationship": "Spouse",
      "Successor Trustee — First Backup": "Morgan Example",
    });
    expect(
      group(data, /^Spouse 2 .* Health Care Power of Attorney/)
    ).toMatchObject({
      "Terminal Condition":
        "Withhold or withdraw life-sustaining treatment and allow natural death",
      "Organ & Tissue Donation": "Yes — any organs and tissue",
    });
  });

  it("keeps following spouse 1 until unchecked, then lets spouse 2 answer separately", () => {
    set(person(1, "trustee.backup1.name"), "Morgan A. Example");
    expect(person(2, "trustee.backup1.name").value).toBe("Morgan A. Example");
    expect(person(2, "trustee.backup1.name").readOnly).toBe(true);

    check(el<HTMLInputElement>(".p2-same-cb"), false);
    expect(person(2, "trustee.backup1.name").readOnly).toBe(false);
    set(person(2, "trustee.backup1.name"), "Riley Example");
    set(person(1, "trustee.backup1.name"), "Someone Else");
    expect(person(2, "trustee.backup1.name").value).toBe("Riley Example");
  });
});

// ── Tier 2 ──────────────────────────────────────────────────────────────────

describe("tier 2 questions", () => {
  beforeEach(() => {
    fillClient();
    answerGates(1);
  });

  it("asks for the full middle name, with a way to say there is none", () => {
    expect(
      el("#g1-mid").closest(".form-group")!.querySelector("label")!.textContent
    ).toBe("Full Middle Name (as on your ID)");
    check(
      "[data-no-middle]",
      true,
      el("#g1-mid").closest<HTMLElement>(".form-group")!
    );
    expect(el<HTMLInputElement>("#g1-mid").value).toBe("");
    expect(el<HTMLInputElement>("#g1-mid").disabled).toBe(true);
    set("#g1-aka", "Jane Q. Formername");
    const data = buildSubmission(root);
    expect(group(data, "Primary Client (Grantor 1)")).toMatchObject({
      "No middle name": "Yes",
      "Other Names You Have Used on Deeds or Accounts": "Jane Q. Formername",
    });
  });

  it("asks who owns each asset only when there are two people", () => {
    const account = addEntry(root, "retirement");
    expect(shown("[data-owner]", account)).toBe(false);
    fillSpouse();
    expect(shown("[data-owner]", account)).toBe(true);
    set("[data-owner]", "p2", account);
    const data = buildSubmission(root);
    expect(group(data, "Retirement Account").Owner).toBe(
      "Spouse 2 (John Testerson)"
    );
  });

  it("asks who the beneficiaries are today on retirement accounts and policies", () => {
    for (const kind of ["retirement", "insurance"] as const) {
      const entry = addEntry(root, kind);
      const labels = Array.from(
        entry.querySelectorAll(".form-group > label:first-child")
      ).map(l => l.textContent);
      expect(labels).toContain("Who is the primary beneficiary today?");
      expect(labels).toContain("Contingent beneficiary?");
    }
    const policy = el("#insuranceList > .subsection");
    const [primary] = Array.from(
      policy.querySelectorAll<HTMLInputElement>("[data-not-sure]")
    );
    check(primary);
    const data = buildSubmission(root);
    expect(
      group(data, "Insurance Policy")["Who is the primary beneficiary today?"]
    ).toBe("Not sure");
  });

  it("offers TSP as a retirement account and moves 529 and custodial accounts out of retirement", () => {
    const options = (entry: HTMLElement) =>
      Array.from(
        entry.querySelectorAll<HTMLOptionElement>(
          ".form-group:nth-child(2) option"
        )
      ).map(o => o.text);
    const retirement = options(addEntry(root, "retirement"));
    expect(retirement).toEqual(
      expect.arrayContaining([
        "TSP (Thrift Savings Plan)",
        "401(k)",
        "403(b)",
        "Roth IRA",
        "Traditional IRA",
        "Pension",
        "Other",
      ])
    );
    expect(retirement.join()).not.toMatch(/529|custodial/i);

    const account = addEntry(root, "financial");
    expect(options(account)).toEqual(
      expect.arrayContaining([
        "529 education account",
        "Child's savings or custodial account",
        "Brokerage (non-retirement)",
      ])
    );
    expect(shown('[data-show-if="acctType=529|custodial"]', account)).toBe(
      false
    );
    set('[data-name="acctType"]', "529", account);
    expect(shown('[data-show-if="acctType=529|custodial"]', account)).toBe(
      true
    );
  });

  it("asks how each property is titled and whether there is real estate in another state", () => {
    const property = el("#realPropertyList > .subsection");
    const labels = Array.from(property.querySelectorAll("label")).map(
      l => l.textContent
    );
    expect(labels).toContain("How is title held?");
    expect(labels).toContain("State where it is located");
    set('[data-name="otherStateProperty"]', "Yes");
    const data = buildSubmission(root);
    const assets = data.sections.find(s => /Assets/.test(s.title))!;
    expect(assets.fields).toContainEqual({
      label: "Do you own real estate in any other state?",
      value: "Yes",
    });
  });

  it("replaces the single prior-planning answer with four questions", () => {
    expect(root.textContent).not.toMatch(/Prior Estate Planning\?/);
    set('[data-name="priorTrust"]', "Yes");
    set('[data-name="childTrust"]', "No");
    expect(shown('[data-show-if^="priorWill=Yes"]')).toBe(true);
    const data = buildSubmission(root);
    expect(group(data, "Existing Trusts & Prior Planning")).toEqual({
      "Do you have an existing trust?": "Yes",
      "Has a trust been set up for any of your children?": "No",
    });
  });

  it("asks about business interests directly, and opens an entry on Yes", () => {
    expect(root.querySelector("#businessList > .subsection")).toBeNull();
    set("#ownsBusiness", "Yes");
    const business = el("#businessList > .subsection");
    const labels = Array.from(business.querySelectorAll("label")).map(
      l => l.textContent
    );
    expect(labels).toEqual(
      expect.arrayContaining([
        "Business Name",
        "Entity Type",
        "State",
        "Your Ownership %",
        "Is a professional license required to own it?",
      ])
    );
  });

  it("asks about military and federal service with a checklist", () => {
    const section = el('[data-name="service"]').closest<HTMLElement>(
      ".subsection"
    )!;
    expect(shown(".check-group", section)).toBe(false);
    set('[data-name="service"]', "Yes");
    expect(shown(".check-group", section)).toBe(true);
    const boxes = Array.from(
      section.querySelectorAll<HTMLInputElement>(".check-group input")
    );
    expect(boxes.map(b => b.closest("label")!.textContent!.trim())).toEqual([
      "Military retired pay",
      "VA disability compensation",
      "Survivor Benefit Plan (SBP)",
      "VGLI or SGLI",
      "FEGLI",
      "TSP (Thrift Savings Plan)",
      "Federal pension (FERS or CSRS)",
    ]);
    check(boxes[2]);
    check(boxes[5]);
    const data = buildSubmission(root);
    expect(
      group(data, "Military & Federal Service")["Check everything you have"]
    ).toBe("Survivor Benefit Plan (SBP), TSP (Thrift Savings Plan)");
  });

  it("asks about expedited timing and flags a yes", () => {
    set("#expedite", "Yes");
    set("#expediteReason", "Leaving the country on the 20th");
    const data = buildSubmission(root);
    expect(flag(data, "Expedited preparation requested")).toEqual([
      "Leaving the country on the 20th",
    ]);
    expect(el<HTMLInputElement>("#expediteReason").placeholder).toMatch(
      /do not include medical details/
    );
  });

  it("asks at what age a minor inherits outright and who manages it until then", () => {
    fillChild(firstChild(), {
      first: "Alex",
      last: "Testerson",
      dob: dobYearsAgo(7),
      share1: "Yes",
    });
    expect(shown("#minorSection")).toBe(true);
    const section = el("#minorSection");
    const ageSelect = el<HTMLSelectElement>("select", section);
    expect(
      ageSelect.closest(".form-group")!.querySelector("label")!.textContent
    ).toBe("At what age should a child receive their inheritance outright?");
    const age = Array.from(ageSelect.options).map(o => o.text);
    expect(age).toEqual([
      "Select",
      "18",
      "21",
      "25",
      "30",
      "Other (describe below)",
      "Not sure",
    ]);
    expect(
      el<HTMLSelectElement>('[data-name="minorManager"]', section)
        .selectedOptions[0].text
    ).toBe("My successor trustee");
  });
});

// ── Smaller units ───────────────────────────────────────────────────────────

describe("ageOn", () => {
  const today = new Date(2026, 5, 15); // 15 June 2026
  it("counts whole years, turning over on the birthday", () => {
    expect(ageOn("2008-06-15", today)).toBe(18);
    expect(ageOn("2008-06-16", today)).toBe(17);
    expect(ageOn("2020-01-01", today)).toBe(6);
  });
  it("returns null when there is no usable date", () => {
    expect(ageOn("", today)).toBeNull();
    expect(ageOn("not a date", today)).toBeNull();
  });
});

describe("submission size", () => {
  it("stays well inside the 64 KB the formDataJson column can hold, for a large joint plan", () => {
    fillClient();
    fillSpouse();
    answerGates(1);
    answerGates(2);
    for (let i = 0; i < 3; i++) addEntry(root, "child");
    for (let i = 0; i < 2; i++) addEntry(root, "property");
    for (const kind of [
      "financial",
      "retirement",
      "insurance",
      "otherAsset",
    ] as const) {
      for (let i = 0; i < 4; i++) addEntry(root, kind);
    }
    set("#ownsBusiness", "Yes");
    for (const box of Array.from(
      root.querySelectorAll<HTMLInputElement>('[data-name="b2open"]')
    ))
      check(box);
    for (const box of Array.from(
      root.querySelectorAll<HTMLInputElement>('[data-k="hipaa.same"]')
    ))
      check(box, false);
    // Fill every open text box with a realistically long answer.
    for (const input of Array.from(
      root.querySelectorAll<HTMLInputElement>(
        "input[type=text], input[type=tel], input[type=email]"
      )
    )) {
      if (!input.value && !input.readOnly)
        input.value = "A realistically long answer, 40 chars.";
    }
    for (const area of Array.from(
      root.querySelectorAll<HTMLTextAreaElement>("textarea")
    )) {
      if (!area.readOnly)
        area.value = "A paragraph of notes for the attorney. ".repeat(6);
    }
    const bytes = Buffer.byteLength(
      JSON.stringify(buildSubmission(root)),
      "utf8"
    );
    expect(bytes).toBeLessThan(50_000);
  });
});
