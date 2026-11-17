/**
 * intakeBehavior.ts — everything the trust intake form does after it is on the
 * page: conditional display, per-spouse answers, validation, the attorney
 * flags, and navigation.
 *
 * It operates on a DOM root rather than on React state because the form itself
 * is delivered as raw HTML (see IntakeForm.tsx). Keeping the logic here instead
 * of in an injected <script> string means the unit tests exercise the exact
 * code the browser runs.
 */

import { collectIntakeData, type IntakeData } from "./intakeCollect";
import {
  COURT_ORDER_ITEMS,
  ENTRY_BUILDERS,
  LAST_DEATH_HELP,
  ROW_BUILDERS,
  type EntryKind,
  type Person,
  type RoleKey,
  type RowKind,
  type SlotKey,
} from "./intakeTemplates";

import type { AttorneyFlag } from "@shared/intake";

type Ctl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type { AttorneyFlag };

export type IntakeSubmission = IntakeData & {
  schemaVersion: 2;
  attorneyFlags: AttorneyFlag[];
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  submittedAt: string;
};

export type IntakeError = { message: string; el: HTMLElement | null };

export type PersonInfo = {
  first: string;
  middle: string;
  last: string;
  suffix: string;
  /** "First Last" — how the person is referred to in labels. */
  display: string;
  /** Full legal name as entered. */
  full: string;
  phone: string;
  email: string;
};

export type IntakeState = {
  /** The joint-trust toggle is on: both people are grantors of one trust. */
  joint: boolean;
  /** Two people are planning: a joint trust, or marital status is Married. */
  couple: boolean;
  anyMinor: boolean;
  minorProvisions: boolean;
  p1: PersonInfo;
  p2: PersonInfo;
};

const ROLES: RoleKey[] = ["trustee", "pr", "agent", "hca", "hipaa"];
const SLOTS: SlotKey[] = ["primary", "backup1", "backup2"];
const SYNCED_FIELDS = ["name", "relationship", "cityState", "phone", "email"];

/** How each role is named in the attorney flags. */
const ROLE_FLAG_NAMES: Record<RoleKey, string> = {
  trustee: "successor trustee",
  pr: "personal representative",
  agent: "financial agent",
  hca: "health care agent",
  hipaa: "HIPAA authorized individual",
};

const ENTRY_LISTS: Record<EntryKind, string> = {
  child: "childrenList",
  otherBen: "otherBenList",
  property: "realPropertyList",
  financial: "financialList",
  retirement: "retirementList",
  insurance: "insuranceList",
  business: "businessList",
  otherAsset: "otherAssetList",
};

const ROW_LISTS: Record<RowKind, string> = {
  bequest: "bequestList",
  lastBen: "lastBenList",
};

// ── Small DOM helpers ───────────────────────────────────────────────────────

const ID_SELECTOR = /^#([\w-]+)$/;

/**
 * querySelector, with ids resolved through the document's id table. The form
 * re-reads its state on every keystroke, so the lookups it repeats most must
 * not walk the whole tree. Ids are unique across the page.
 */
function q<T extends Element = HTMLElement>(
  root: ParentNode | null,
  sel: string
): T | null {
  if (!root) return null;
  const id = ID_SELECTOR.exec(sel);
  if (id) {
    const doc = (root as Node).ownerDocument ?? (root as Document);
    return doc.getElementById(id[1]) as T | null;
  }
  return root.querySelector<T>(sel);
}

const qa = <T extends Element = HTMLElement>(
  root: ParentNode | null,
  sel: string
): T[] => (root ? Array.from(root.querySelectorAll<T>(sel)) : []);

/**
 * The parts of the form that exist from the start and never move: each
 * spouse's keyed answers, the name tags, the role blocks. Indexed once per
 * mounted form; entries added later ("+ Add Child") are looked up live.
 */
type StaticIndex = {
  byKey: Record<Person, Map<string, Ctl>>;
  b2Buttons: Record<Person, HTMLButtonElement[]>;
  personTags: HTMLElement[];
  personNames: HTMLElement[];
  roleBlocks: HTMLElement[];
  computed: HTMLTextAreaElement[];
  sameAnswers: HTMLInputElement[];
  guardianSuffix: HTMLElement | null;
  lastDeathHelp: HTMLElement | null;
};

const staticIndexes = new WeakMap<ParentNode, StaticIndex>();

/** Elements that come and go with the "+ Add" buttons. Rebuilt after any add or remove. */
type DynamicIndex = { conditional: HTMLElement[]; owners: HTMLSelectElement[] };

const dynamicIndexes = new WeakMap<ParentNode, DynamicIndex>();

function dynamicIndex(root: ParentNode): DynamicIndex {
  let ix = dynamicIndexes.get(root);
  if (!ix) {
    ix = {
      conditional: qa(root, "[data-show-if]"),
      owners: qa<HTMLSelectElement>(root, "[data-owner]"),
    };
    dynamicIndexes.set(root, ix);
  }
  return ix;
}

/** Call after adding or removing any part of the form. */
export function entriesChanged(root: ParentNode): void {
  dynamicIndexes.delete(root);
}

function staticIndex(root: ParentNode): StaticIndex {
  let ix = staticIndexes.get(root);
  if (ix) return ix;
  ix = {
    byKey: { 1: new Map(), 2: new Map() },
    b2Buttons: { 1: [], 2: [] },
    personTags: qa(root, "[data-person-tag]"),
    personNames: qa(root, "[data-person-name]"),
    roleBlocks: qa(root, "[data-role]"),
    computed: qa<HTMLTextAreaElement>(root, "[data-computed]"),
    sameAnswers: qa<HTMLInputElement>(root, ".p2-same-cb"),
    guardianSuffix: q(root, "[data-guardian-suffix]"),
    lastDeathHelp: q(root, "[data-last-death-help]"),
  };
  for (const block of qa(root, "[data-person]")) {
    const p = Number(block.dataset.person) as Person;
    for (const el of qa<Ctl>(block, "[data-k]"))
      ix.byKey[p].set(el.dataset.k ?? "", el);
    ix.b2Buttons[p].push(...qa<HTMLButtonElement>(block, "[data-open-b2]"));
  }
  staticIndexes.set(root, ix);
  return ix;
}

const val = (root: ParentNode | null, sel: string): string =>
  (q<Ctl>(root, sel)?.value ?? "").trim();

const isChecked = (root: ParentNode | null, sel: string): boolean =>
  !!q<HTMLInputElement>(root, sel)?.checked;

const isShown = (el: Element): boolean => !el.closest(".hidden");

const isToggle = (el: Element): el is HTMLInputElement =>
  el instanceof HTMLInputElement &&
  (el.type === "checkbox" || el.type === "radio");

// ── Names ───────────────────────────────────────────────────────────────────

const normalize = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[.,'’"()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function personInfo(root: ParentNode, p: Person): PersonInfo {
  const pre = p === 1 ? "#g1" : "#g2";
  const first = val(root, `${pre}-first`);
  const middle = val(root, `${pre}-mid`);
  const last = val(root, `${pre}-last`);
  const suffix = val(root, `${pre}-suffix`);
  return {
    first,
    middle,
    last,
    suffix,
    display: [first, last].filter(Boolean).join(" "),
    full: [first, middle, last, suffix].filter(Boolean).join(" "),
    phone: val(root, `${pre}-phone`),
    email: val(root, `${pre}-email`),
  };
}

/** "Spouse 1 (Jane Doe)", or just "Spouse 1" until a name is entered. */
export const spouseLabel = (info: PersonInfo, p: Person): string =>
  info.display ? `Spouse ${p} (${info.display})` : `Spouse ${p}`;

/** Every way a person's own name might be typed into a "full legal name" box. */
function nameVariants(info: PersonInfo): Set<string> {
  const out = new Set<string>();
  if (!info.first || !info.last) return out;
  const bases = [`${info.first} ${info.last}`];
  if (info.middle) {
    bases.push(`${info.first} ${info.middle} ${info.last}`);
    bases.push(`${info.first} ${info.middle[0]} ${info.last}`);
  }
  // A grantor with a suffix is only matched with it: "John Doe" is his father.
  for (const b of bases)
    out.add(normalize(info.suffix ? `${b} ${info.suffix}` : b));
  return out;
}

export const isSamePerson = (name: string, info: PersonInfo): boolean =>
  nameVariants(info).has(normalize(name));

const isSpouseRelationship = (rel: string): boolean =>
  /^(my )?(spouse|wife|husband|domestic partner)$/.test(normalize(rel));

/** Free text that plainly names a grantor: "my wife", or the grantor's own full name. */
function mentionsGrantor(text: string, grantors: PersonInfo[]): boolean {
  if (/\b(my|our)\s+(spouse|wife|husband)\b(?!['’]s)/i.test(text)) return true;
  if (/\bsurviving\s+(spouse|wife|husband)\b/i.test(text)) return true;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return grantors.some(g => {
    if (!g.first || !g.last) return false;
    const tail = g.suffix
      ? `[,.]?\\s+${esc(g.suffix.replace(/\./g, ""))}\\b`
      : "(?![,.]?\\s*(jr|sr|ii|iii|iv)\\b)";
    return new RegExp(
      `\\b${esc(g.first)}\\s+(\\S+\\s+)?${esc(g.last)}\\b${tail}(?!['’]s)`,
      "i"
    ).test(text);
  });
}

// ── Children ────────────────────────────────────────────────────────────────

type ChildInfo = {
  el: HTMLElement;
  name: string;
  dob: string;
  started: boolean;
  parentage: string;
  share1: string;
  share2: string;
};

function readChildren(root: ParentNode): ChildInfo[] {
  const list = q(root, "#childrenList");
  const entries = list
    ? Array.from(list.children).filter((el): el is HTMLElement =>
        el.classList.contains("subsection")
      )
    : [];
  return entries.map(el => {
    const first = val(el, "[data-child-first]");
    const last = val(el, "[data-child-last]");
    const dob = val(el, "[data-child-dob]");
    return {
      el,
      name: [first, last].filter(Boolean).join(" "),
      dob,
      started: !!(first || last || dob),
      parentage: val(el, "[data-child-parentage]"),
      share1: val(el, '[data-child-share="1"]'),
      share2: val(el, '[data-child-share="2"]'),
    };
  });
}

/** Whole years between a yyyy-mm-dd date of birth and `now`; null if unreadable. */
export function ageOn(dob: string, now: Date): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let age = now.getFullYear() - y;
  if (
    now.getMonth() + 1 < mo ||
    (now.getMonth() + 1 === mo && now.getDate() < d)
  )
    age--;
  return age;
}

// ── State ───────────────────────────────────────────────────────────────────

export function readState(
  root: ParentNode,
  now: Date = new Date()
): IntakeState {
  const joint = isChecked(root, "#hasSpouse");
  const couple = joint || val(root, "#g1-marital") === "Married";
  const anyMinor = readChildren(root).some(c => {
    const age = ageOn(c.dob, now);
    return age !== null && age < 18;
  });
  return {
    joint,
    couple,
    anyMinor,
    minorProvisions: anyMinor || isChecked(root, "#hasMinors"),
    p1: personInfo(root, 1),
    p2: personInfo(root, 2),
  };
}

const persons = (s: IntakeState): Person[] => (s.couple ? [1, 2] : [1]);

// ── Conditional display ─────────────────────────────────────────────────────

function readNamed(scope: ParentNode, name: string): string {
  const el = q<Ctl>(scope, `[data-name="${name}"]`);
  if (el) return isToggle(el) ? (el.checked ? "on" : "") : el.value;
  return (
    q<HTMLInputElement>(scope, `input[type=radio][name="${name}"]:checked`)
      ?.value ?? ""
  );
}

/**
 * Grammar: terms joined by `&&`, groups of those joined by `||`.
 *   @couple        a flag on IntakeState
 *   name           the control with data-name="name" in scope is checked / non-empty
 *   name=a|b       that control's value is a or b
 *   !term          negation
 */
export function evalCondition(
  root: ParentNode,
  el: Element,
  expr: string,
  state: IntakeState,
  seen: Map<ParentNode, Map<string, string>> = new Map()
): boolean {
  const scope = el.parentElement?.closest("[data-scope]") ?? root;
  // Several elements in one scope usually ask about the same control.
  const read = (name: string): string => {
    let known = seen.get(scope);
    if (!known) seen.set(scope, (known = new Map()));
    let v = known.get(name);
    if (v === undefined) known.set(name, (v = readNamed(scope, name)));
    return v;
  };
  const term = (raw: string): boolean => {
    let t = raw.trim();
    const negate = t.startsWith("!");
    if (negate) t = t.slice(1);
    let result: boolean;
    if (t.startsWith("@")) {
      result = !!state[t.slice(1) as keyof IntakeState];
    } else {
      const [name, rhs] = t.split("=");
      const v = read(name);
      result = rhs === undefined ? !!v : rhs.split("|").includes(v);
    }
    return negate ? !result : result;
  };
  return expr.split("||").some(group => group.split("&&").every(term));
}

function applyConditions(root: ParentNode, state: IntakeState): void {
  const seen = new Map<ParentNode, Map<string, string>>();
  for (const el of dynamicIndex(root).conditional) {
    const hide = !evalCondition(root, el, el.dataset.showIf ?? "", state, seen);
    if (el.classList.contains("hidden") !== hide)
      el.classList.toggle("hidden", hide);
  }
}

// ── Copying answers: "same as trustee" and "same as my spouse" ──────────────

/** Write only on a real change: this runs for every keyed control on every keystroke. */
function setLocked(el: Ctl, locked: boolean): void {
  if (el instanceof HTMLSelectElement || isToggle(el)) {
    if (el.disabled !== locked) el.disabled = locked;
  } else if (el.readOnly !== locked) {
    el.readOnly = locked;
  }
  if (el.classList.contains("synced") !== locked)
    el.classList.toggle("synced", locked);
}

function setText(el: Element | null, text: string): void {
  if (el && el.textContent !== text) el.textContent = text;
}

function setValue(el: Ctl | null, value: string): void {
  if (el && el.value !== value) el.value = value;
}

function copyValue(from: Ctl | null, to: Ctl | null): void {
  if (!from || !to) return;
  if (isToggle(from) && isToggle(to)) {
    if (to.checked !== from.checked) to.checked = from.checked;
  } else {
    setValue(to, from.value);
  }
  setLocked(to, true);
}

const personKey = (root: ParentNode, p: Person, k: string): Ctl | null =>
  staticIndex(root).byKey[p].get(k) ?? null;

function syncSameAsTrustee(root: ParentNode, p: Person): void {
  for (const role of ["pr", "agent", "hca"] as RoleKey[]) {
    const same = personKey(root, p, `${role}.same`);
    if (!same || !isToggle(same) || !same.checked) continue;
    for (const slot of SLOTS) {
      for (const f of SYNCED_FIELDS) {
        copyValue(
          personKey(root, p, `trustee.${slot}.${f}`),
          personKey(root, p, `${role}.${slot}.${f}`)
        );
      }
    }
    copyValue(
      personKey(root, p, "trustee.b2open"),
      personKey(root, p, `${role}.b2open`)
    );
  }
}

/**
 * Copy Spouse 1's answers into Spouse 2's own fields, then swap the names:
 * wherever Spouse 1 named Spouse 2, Spouse 2's copy names Spouse 1.
 */
function copySpouseAnswers(root: ParentNode, state: IntakeState): void {
  const ix = staticIndex(root);
  ix.byKey[1].forEach((src, k) => copyValue(src, ix.byKey[2].get(k) ?? null));
  const street = val(root, "#g1-addr");
  const cityState = [val(root, "#g1-city"), val(root, "#g1-state")]
    .filter(Boolean)
    .join(", ");
  for (const role of ROLES) {
    for (const slot of SLOTS) {
      const field = (f: string) =>
        personKey(root, 2, `${role}.${slot}.${f}`) as HTMLInputElement | null;
      const name = field("name");
      if (!name || !name.value.trim()) continue;
      if (
        !isSamePerson(name.value, state.p2) &&
        !isSpouseRelationship(field("relationship")?.value ?? "")
      )
        continue;
      const set = (f: string, v: string) => {
        const el = field(f);
        if (el) el.value = v;
      };
      set("name", state.p1.full);
      set("relationship", "Spouse");
      set("cityState", cityState);
      set("phone", state.p1.phone);
      set("email", state.p1.email);
      set("street", street);
    }
  }
  for (const b of ix.b2Buttons[2]) b.disabled = true;
}

function applyCopies(root: ParentNode, state: IntakeState): void {
  const ix = staticIndex(root);
  for (const p of [1, 2] as Person[]) {
    ix.byKey[p].forEach(el => setLocked(el, false));
    for (const b of ix.b2Buttons[p]) b.disabled = false;
  }
  syncSameAsTrustee(root, 1);
  if (state.couple && ix.sameAnswers.some(cb => cb.checked))
    copySpouseAnswers(root, state);
  if (state.couple) syncSameAsTrustee(root, 2);
}

// ── Labels and computed fields ──────────────────────────────────────────────

function setOptionText(
  select: HTMLSelectElement | null,
  value: string,
  text: string
): void {
  const opt = select
    ? Array.from(select.options).find(o => o.value === value)
    : null;
  if (opt && opt.text !== text) opt.text = text;
}

function shareBuckets(
  kids: ChildInfo[],
  share: (c: ChildInfo) => string
): string {
  const names = (list: ChildInfo[]) => list.map(c => c.name).join(", ");
  const included = kids.filter(c => share(c) === "Yes");
  const excluded = kids.filter(c => share(c) === "No");
  const undecided = kids.filter(c => share(c) !== "Yes" && share(c) !== "No");
  return [
    included.length ? `Included: ${names(included)}` : "",
    excluded.length ? `Not included: ${names(excluded)}` : "",
    undecided.length ? `Undecided: ${names(undecided)}` : "",
  ]
    .filter(Boolean)
    .join(". ");
}

/** Which children share, from the per-child answers in Section 2. */
export function childrenSummary(root: ParentNode, state: IntakeState): string {
  const kids = readChildren(root).filter(c => c.name);
  if (!kids.length) return "No children are listed in Section 2.";
  if (!state.couple) return shareBuckets(kids, c => c.share1);
  return [
    `${spouseLabel(state.p1, 1)} — ${shareBuckets(kids, c => c.share1)}`,
    `${spouseLabel(state.p2, 2)} — ${shareBuckets(kids, c => c.share2)}`,
  ].join("\n");
}

function applyLabels(root: ParentNode, state: IntakeState, now: Date): void {
  const label = (p: Person) => spouseLabel(p === 1 ? state.p1 : state.p2, p);

  const ix = staticIndex(root);
  for (const el of ix.personTags) {
    setText(
      el,
      state.couple ? `${label(Number(el.dataset.personTag) as Person)} — ` : ""
    );
  }
  for (const el of ix.personNames) {
    setText(el, label(Number(el.dataset.personName) as Person));
  }
  const suffix = ix.guardianSuffix;
  setText(suffix, state.couple ? " — Both Spouses" : "");

  for (const sel of dynamicIndex(root).owners) {
    setOptionText(sel, "p1", label(1));
    setOptionText(sel, "p2", label(2));
  }

  const question = "Should this child receive a share under your plan?";
  for (const c of readChildren(root)) {
    const age = ageOn(c.dob, now);
    const minor = q<HTMLInputElement>(c.el, "[data-child-minor]");
    setValue(
      minor,
      age === null
        ? ""
        : age < 18
          ? `Yes (age ${Math.max(age, 0)})`
          : `No (age ${age})`
    );

    const parentage = q<HTMLSelectElement>(c.el, "[data-child-parentage]");
    setOptionText(
      parentage,
      "p1",
      `${label(1)}'s child from a prior relationship`
    );
    setOptionText(
      parentage,
      "p2",
      `${label(2)}'s child from a prior relationship`
    );

    for (const p of [1, 2] as Person[]) {
      setText(
        q(c.el, `[data-share-label="${p}"]`),
        state.couple ? `${label(p)}: ${question}` : question
      );
    }
  }

  const summary = childrenSummary(root, state);
  for (const el of ix.computed) setValue(el, summary);

  const help = ix.lastDeathHelp;
  setText(
    help,
    state.joint ? LAST_DEATH_HELP : "This is who inherits after you have died."
  );
}

function applyWarnings(root: ParentNode): void {
  for (const block of staticIndex(root).roleBlocks) {
    const role = block.dataset.role;
    const warn = q(block, "[data-backup-warning]");
    const p = Number(
      block.closest<HTMLElement>("[data-person]")?.dataset.person
    ) as Person;
    if (!warn || !p) continue;
    const primary = personKey(root, p, `${role}.primary.name`)?.value.trim();
    const backup = personKey(root, p, `${role}.backup1.name`)?.value.trim();
    const hide = !(primary && !backup);
    if (warn.classList.contains("hidden") !== hide)
      warn.classList.toggle("hidden", hide);
  }
  const g = q(root, "#guardianSection");
  const warn = q(g, "[data-backup-warning]");
  if (warn)
    warn.classList.toggle(
      "hidden",
      !(val(g, "#guardian1") && !val(g, "#guardian2"))
    );
}

/** Bring every derived part of the form in line with what has been entered. */
export function refreshIntake(
  root: ParentNode,
  now: Date = new Date()
): IntakeState {
  const state = readState(root, now);
  applyCopies(root, state);
  applyLabels(root, state, now);
  applyConditions(root, state);
  applyWarnings(root);
  return state;
}

// ── Repeatable entries ──────────────────────────────────────────────────────

function nextCount(list: HTMLElement): number {
  const n = Number(list.dataset.count ?? "0") + 1;
  list.dataset.count = String(n);
  return n;
}

export function addEntry(root: ParentNode, kind: EntryKind): HTMLElement {
  const list = q(root, `#${ENTRY_LISTS[kind]}`);
  if (!list) throw new Error(`Intake form is missing #${ENTRY_LISTS[kind]}`);
  const el = list.ownerDocument.createElement("div");
  el.className = "subsection";
  el.style.marginBottom = "12px";
  el.setAttribute("data-scope", "");
  el.innerHTML = ENTRY_BUILDERS[kind](nextCount(list));
  list.appendChild(el);
  entriesChanged(root);
  refreshIntake(root);
  return el;
}

export function addRow(root: ParentNode, kind: RowKind): HTMLElement {
  const list = q(root, `#${ROW_LISTS[kind]}`);
  if (!list) throw new Error(`Intake form is missing #${ROW_LISTS[kind]}`);
  const el = list.ownerDocument.createElement("div");
  el.className = "form-row cols-3";
  el.style.marginBottom = "10px";
  el.innerHTML = ROW_BUILDERS[kind]();
  list.appendChild(el);
  entriesChanged(root);
  return el;
}

// ── Validation ──────────────────────────────────────────────────────────────

export const STEP_COUNT = 7;

export function validateStep(
  root: ParentNode,
  step: number,
  now: Date = new Date()
): IntakeError[] {
  const s = readState(root, now);
  const errors: IntakeError[] = [];
  const need = (scope: ParentNode | null, sel: string, message: string) => {
    const el = q<Ctl>(scope, sel);
    if (el && isShown(el) && !el.value.trim()) errors.push({ el, message });
  };
  const whose = (p: Person) =>
    s.couple ? `${spouseLabel(p === 1 ? s.p1 : s.p2, p)}: ` : "";

  if (step === 0) {
    need(root, "#g1-first", "Enter the first name.");
    need(root, "#g1-last", "Enter the last name.");
    need(root, "#g1-dob", "Enter the date of birth.");
    need(root, "#g1-email", "Enter an email address.");
    need(root, "#g1-phone", "Enter a phone number.");
    if (s.couple) {
      need(root, "#g2-first", "Enter your spouse's first name.");
      need(root, "#g2-last", "Enter your spouse's last name.");
      need(root, "#g2-dob", "Enter your spouse's date of birth.");
      need(root, "#g2-email", "Enter your spouse's email address.");
      need(root, "#g2-phone", "Enter your spouse's phone number.");
    }
    for (const p of persons(s)) {
      const block = q(root, `[data-court="${p}"]`);
      need(
        block,
        '[data-name="marriedBefore"]',
        `${whose(p)}Please answer whether you have been married before.`
      );
      const group = q(block, "[data-order-group]");
      if (group && !q(group, "input:checked")) {
        errors.push({
          el: group,
          message: `${whose(p)}Check everything that applies, or check "None of these".`,
        });
      }
      need(
        block,
        '[data-name="judgment"]',
        `${whose(p)}Please answer whether there is an unpaid court judgment.`
      );
    }
  }

  if (step === 1) {
    const kids = readChildren(root).filter(c => c.started);
    for (const c of kids) {
      need(c.el, "[data-child-first]", "Enter this child's first name.");
      need(c.el, "[data-child-last]", "Enter this child's last name.");
      need(c.el, "[data-child-dob]", "Enter this child's date of birth.");
      need(c.el, "[data-child-parentage]", "Select whose child this is.");
      need(
        c.el,
        '[data-child-share="1"]',
        "Please answer whether this child should receive a share."
      );
      need(
        c.el,
        '[data-child-share="2"]',
        "Please answer whether this child should receive a share."
      );
    }
    if (isChecked(root, "#blendedFamily")) {
      const ok = s.couple
        ? kids.some(c => c.parentage === "p1" || c.parentage === "p2")
        : kids.length > 0;
      if (!ok) {
        errors.push({
          el:
            q(root, "#blendedFamily")?.closest<HTMLElement>(".toggle-group") ??
            null,
          message: s.couple
            ? "You marked this as a blended family. Add each child above and select whose child they are; at least one must be from a prior relationship."
            : "You marked this as a blended family. Add each child above.",
        });
      }
    }
  }

  if (step === 3 && s.joint) {
    const message = `Your spouse is the other grantor of this joint trust, so neither of you can be named here. ${LAST_DEATH_HELP}`;
    const grantors = [s.p1, s.p2];
    for (const row of qa(root, "#lastBenList > .form-row")) {
      const name = q<HTMLInputElement>(row, "[data-lastben-name]");
      const rel = q<HTMLInputElement>(row, "[data-lastben-rel]");
      if (name && grantors.some(g => isSamePerson(name.value, g)))
        errors.push({ el: name, message });
      else if (rel && isSpouseRelationship(rel.value))
        errors.push({ el: rel, message });
    }
    const plan = q<HTMLTextAreaElement>(root, "#distPlan");
    if (plan && mentionsGrantor(plan.value, grantors))
      errors.push({ el: plan, message });
  }

  if (step === 4 && s.anyMinor) {
    const g = q(root, "#guardianSection");
    if (!isChecked(g, "#guardianUndecided")) {
      need(
        g,
        "#guardian1",
        'Name a guardian, or check "We have not decided yet".'
      );
      need(g, "#guardian1-rel", "Enter the guardian's relationship to you.");
      need(g, "#guardian1-city", "Enter the guardian's city and state.");
      if (!isChecked(g, "#guardianNoBackup")) {
        need(
          g,
          "#guardian2",
          'Name a backup guardian, or check "We have not chosen a backup guardian yet".'
        );
        need(
          g,
          "#guardian2-rel",
          "Enter the backup guardian's relationship to you."
        );
        need(
          g,
          "#guardian2-city",
          "Enter the backup guardian's city and state."
        );
      }
      need(
        g,
        "#guardianAgree",
        "Please answer whether both of you agree on this choice."
      );
    }
  }

  return errors;
}

export function clearErrors(root: ParentNode): void {
  for (const el of qa(root, ".field-error")) el.remove();
  for (const el of qa(root, ".invalid")) el.classList.remove("invalid");
  q(root, "#step-error-msg")?.classList.add("hidden");
}

export function showErrors(root: ParentNode, errors: IntakeError[]): void {
  clearErrors(root);
  for (const e of errors) {
    if (!e.el) continue;
    e.el.classList.add("invalid");
    const note = e.el.ownerDocument.createElement("div");
    note.className = "field-error";
    note.textContent = e.message;
    (e.el.closest(".form-group") ?? e.el.parentElement ?? e.el).appendChild(
      note
    );
  }
  const box = q(root, "#step-error-msg");
  if (box) {
    box.textContent =
      errors.length === 1
        ? "One item above needs your attention before you continue."
        : `${errors.length} items above need your attention before you continue.`;
    box.classList.remove("hidden");
  }
}

// ── Attorney flags ──────────────────────────────────────────────────────────

/**
 * The short list printed on page 1 of the attorney's copy: the answers that
 * change how the plan is drafted, pulled out so they cannot be missed.
 */
export function computeAttorneyFlags(
  root: ParentNode,
  now: Date = new Date()
): AttorneyFlag[] {
  const s = readState(root, now);
  const flags: AttorneyFlag[] = [];
  const label = (p: Person) => spouseLabel(p === 1 ? s.p1 : s.p2, p);
  const whose = (p: Person) => (s.couple ? `${label(p)}: ` : "");

  const orders: string[] = [];
  for (const p of persons(s)) {
    const block = q(root, `[data-court="${p}"]`);
    const checked = COURT_ORDER_ITEMS.filter(i =>
      isChecked(block, `[data-name="${i.name}"]`)
    );
    for (const i of checked) orders.push(`${whose(p)}${i.text}`);
    if (checked.length) {
      const detail = val(block, "[data-order-detail]");
      if (detail) orders.push(`${whose(p)}Order requires: ${detail}`);
      const delivery = val(block, "[data-order-delivery]");
      if (delivery) orders.push(`${whose(p)}Decree or order: ${delivery}`);
    }
    if (val(block, '[data-name="judgment"]') === "Yes") {
      const detail = val(block, "[data-judgment-detail]");
      orders.push(
        `${whose(p)}Unpaid court judgment${detail ? ` (${detail})` : ""}`
      );
    }
  }
  if (orders.length)
    flags.push({ label: "Court-ordered obligations", items: orders });

  const kids = readChildren(root).filter(c => c.name);
  const excluded: string[] = [];
  const undecided: string[] = [];
  for (const c of kids) {
    for (const p of persons(s)) {
      const share = p === 1 ? c.share1 : c.share2;
      const by = s.couple ? `, per ${label(p)}` : "";
      if (share === "No") excluded.push(`${c.name}${by}`);
      else if (share !== "Yes") undecided.push(`${c.name}${by}`);
    }
  }
  if (excluded.length)
    flags.push({ label: "Children excluded from the plan", items: excluded });
  if (undecided.length)
    flags.push({ label: "Child's share undecided", items: undecided });

  const gaps: string[] = [];
  for (const p of persons(s)) {
    const unnamed: string[] = [];
    const noBackup: string[] = [];
    for (const role of ROLES) {
      const sameAsHca = personKey(root, p, "hipaa.same");
      if (
        role === "hipaa" &&
        sameAsHca &&
        isToggle(sameAsHca) &&
        sameAsHca.checked
      )
        continue;
      const primary = personKey(root, p, `${role}.primary.name`)?.value.trim();
      const backup = personKey(root, p, `${role}.backup1.name`)?.value.trim();
      if (!primary) unnamed.push(ROLE_FLAG_NAMES[role]);
      else if (!backup) noBackup.push(ROLE_FLAG_NAMES[role]);
    }
    if (unnamed.length)
      gaps.push(`${whose(p)}No one named as ${unnamed.join(", ")}`);
    if (noBackup.length)
      gaps.push(`${whose(p)}No backup for ${noBackup.join(", ")}`);
  }

  if (s.anyMinor) {
    const g = q(root, "#guardianSection");
    const guardian: string[] = [];
    if (isChecked(g, "#guardianUndecided")) {
      guardian.push("Not decided yet");
    } else {
      if (!val(g, "#guardian2"))
        gaps.push("No backup guardian for the minor children");
      if (val(g, "#guardianAgree").startsWith("No"))
        guardian.push("Spouses want to discuss the choice of guardian");
    }
    if (guardian.length)
      flags.push({ label: "Guardian for minor children", items: guardian });
  }
  if (gaps.length) flags.push({ label: "Roles with no backup", items: gaps });

  if (val(root, "#expedite") === "Yes") {
    flags.push({
      label: "Expedited preparation requested",
      items: [val(root, "#expediteReason") || "No reason given"],
    });
  }

  return flags;
}

// ── Submission ──────────────────────────────────────────────────────────────

export function buildSubmission(
  root: ParentNode,
  now: Date = new Date()
): IntakeSubmission {
  const state = refreshIntake(root, now);
  return {
    ...collectIntakeData(root, { keepEmptySections: true }),
    schemaVersion: 2,
    attorneyFlags: computeAttorneyFlags(root, now),
    clientName:
      [state.p1.first, state.p1.middle, state.p1.last]
        .filter(Boolean)
        .join(" ") || "Client",
    clientEmail: state.p1.email,
    clientPhone: state.p1.phone,
    submittedAt: now.toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "full",
      timeStyle: "short",
    }),
  };
}

// ── Mounting ────────────────────────────────────────────────────────────────

/** Small per-control reactions that have to happen before the general refresh. */
function onControlChange(root: ParentNode, target: Element): void {
  if (
    !(target instanceof HTMLInputElement) &&
    !(target instanceof HTMLSelectElement)
  )
    return;

  if (target.matches("[data-not-sure]")) {
    const answer = q<HTMLInputElement>(
      target.closest(".form-group"),
      "input[type=text]"
    );
    if (answer && target instanceof HTMLInputElement) {
      if (target.checked) answer.value = "Not sure";
      else if (answer.value === "Not sure") answer.value = "";
      answer.readOnly = target.checked;
    }
  }

  if (
    target.matches("[data-no-middle]") &&
    target instanceof HTMLInputElement
  ) {
    const middle = q<HTMLInputElement>(
      target.closest(".form-group"),
      "input[type=text]"
    );
    if (middle) {
      if (target.checked) middle.value = "";
      middle.disabled = target.checked;
    }
  }

  if (target instanceof HTMLInputElement && target.checked) {
    const group = target.closest("[data-order-group]");
    if (group && target.matches("[data-order-none]")) {
      for (const el of qa<HTMLInputElement>(group, "[data-order-item]"))
        el.checked = false;
    } else if (group && target.matches("[data-order-item]")) {
      const none = q<HTMLInputElement>(group, "[data-order-none]");
      if (none) none.checked = false;
    }
  }

  if (target.matches(".p2-same-cb") && target instanceof HTMLInputElement) {
    for (const el of qa<HTMLInputElement>(root, ".p2-same-cb"))
      el.checked = target.checked;
  }

  if (
    target.id === "ownsBusiness" &&
    target.value === "Yes" &&
    !q(root, "#businessList > .subsection")
  ) {
    addEntry(root, "business");
  }
}

export type MountOptions = {
  onSubmit: (data: IntakeSubmission) => void;
};

/**
 * Wire the form up. The HTML's inline `onclick="intakeNavigate(1)"` handlers
 * are kept, so the functions they call are published on `window` here.
 * Returns a cleanup function.
 */
export function mountIntakeForm(
  root: HTMLElement,
  opts: MountOptions
): () => void {
  const win = root.ownerDocument.defaultView as
    | (Window & Record<string, unknown>)
    | null;
  const byId = (id: string) => q(root, `#${id}`);
  let cur = 0;

  const scrollTop = () => {
    try {
      win?.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // not available outside a browser
    }
  };

  const showStep = (next: number, completed: boolean) => {
    const sections = qa(root, ".section");
    const steps = qa(root, ".progress-step");
    sections[cur]?.classList.remove("active");
    steps[cur]?.classList.remove("active");
    if (completed) steps[cur]?.classList.add("completed");
    cur = Math.max(0, Math.min(next, sections.length - 1));
    if (!completed) steps[cur]?.classList.remove("completed");
    sections[cur]?.classList.add("active");
    steps[cur]?.classList.add("active");
    const last = cur === sections.length - 1;
    const prev = byId("prevBtn");
    const nextBtn = byId("nextBtn");
    if (prev) prev.style.visibility = cur === 0 ? "hidden" : "visible";
    if (nextBtn) nextBtn.textContent = last ? "Submit →" : "Continue →";
    const indicator = byId("pageIndicator");
    if (indicator)
      indicator.textContent = `Page ${cur + 1} of ${sections.length}`;
    if (last) updateReview();
  };

  const updateReview = () => {
    const s = readState(root);
    const set = (id: string, text: string) => {
      const el = byId(id);
      if (el) el.textContent = text || "—";
    };
    set("rv-name", s.p1.full);
    set("rv-dob", val(root, "#g1-dob"));
    set("rv-email", s.p1.email);
    set("rv-phone", s.p1.phone);
    set(
      "rv-addr",
      [
        val(root, "#g1-addr"),
        val(root, "#g1-city"),
        val(root, "#g1-state"),
        val(root, "#g1-zip"),
      ]
        .filter(Boolean)
        .join(", ")
    );
    set("rv-marital", val(root, "#g1-marital"));
    set("rv-spouse", s.couple ? s.p2.full : "");
    set("rv-trustee", val(root, "#trustee1"));
    set("rv-poa", val(root, "#poa1"));
    set("rv-hca", val(root, "#hca1"));
  };

  const blocked = (step: number): boolean => {
    const errors = validateStep(root, step);
    if (!errors.length) return false;
    if (step !== cur) showStep(step, false);
    showErrors(root, errors);
    const first = errors.find(e => e.el)?.el;
    first?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    return true;
  };

  const navigate = (d: number) => {
    refreshIntake(root);
    if (d < 0) {
      clearErrors(root);
      showStep(cur - 1, false);
      scrollTop();
      return;
    }
    const last = cur === qa(root, ".section").length - 1;
    if (!last) {
      if (blocked(cur)) return;
      clearErrors(root);
      showStep(cur + 1, true);
      scrollTop();
      return;
    }
    // Submitting: an earlier answer may have changed since its page was checked.
    for (let step = 0; step < STEP_COUNT; step++) if (blocked(step)) return;
    clearErrors(root);
    const btn = byId("nextBtn") as HTMLButtonElement | null;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Submitting…";
    }
    byId("submit-error-msg")?.classList.add("hidden");
    opts.onSubmit(buildSubmission(root));
  };

  const toggleCollapse = (trigger: HTMLElement) => {
    trigger.classList.toggle("open");
    trigger.nextElementSibling?.classList.toggle("open");
  };

  const onChange = (e: Event) => {
    if (e.target instanceof Element) onControlChange(root, e.target);
    refreshIntake(root);
  };

  const onClick = (e: Event) => {
    const target = e.target instanceof Element ? e.target : null;
    const openB2 = target?.closest("[data-open-b2]");
    if (openB2) {
      const flag = q<HTMLInputElement>(
        openB2.parentElement,
        ':scope > [data-name="b2open"]'
      );
      if (flag) flag.checked = true;
      refreshIntake(root);
      return;
    }
    const remove = target?.closest("[data-remove-entry]");
    if (remove) {
      remove.closest(".subsection")?.remove();
      entriesChanged(root);
      refreshIntake(root);
    }
  };

  const globals: Record<string, unknown> = {
    intakeNavigate: navigate,
    intakeToggleCollapse: toggleCollapse,
    intakeAddChild: () => addEntry(root, "child"),
    intakeAddOtherBen: () => addEntry(root, "otherBen"),
    intakeAddRealProperty: () => addEntry(root, "property"),
    intakeAddFinancial: () => addEntry(root, "financial"),
    intakeAddRetirement: () => addEntry(root, "retirement"),
    intakeAddInsurance: () => addEntry(root, "insurance"),
    intakeAddBusiness: () => addEntry(root, "business"),
    intakeAddOtherAsset: () => addEntry(root, "otherAsset"),
    intakeAddBequest: () => addRow(root, "bequest"),
    intakeAddLastBen: () => addRow(root, "lastBen"),
  };
  if (win) Object.assign(win, globals);

  root.addEventListener("input", onChange);
  root.addEventListener("change", onChange);
  root.addEventListener("click", onClick);

  const prev = byId("prevBtn");
  if (prev) prev.style.visibility = "hidden";
  addEntry(root, "child");
  addEntry(root, "property");
  refreshIntake(root);

  return () => {
    root.removeEventListener("input", onChange);
    root.removeEventListener("change", onChange);
    root.removeEventListener("click", onClick);
    if (win) for (const name of Object.keys(globals)) delete win[name];
  };
}
