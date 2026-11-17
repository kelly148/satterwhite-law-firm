/**
 * intakeTemplates.ts — HTML builders for the trust intake form.
 *
 * The form is delivered as raw HTML (see client/src/pages/IntakeForm.tsx) and
 * read back by label (see intakeCollect.ts), so every control here sits in a
 * `.form-group` with a visible <label>. Anything a client can answer more than
 * once (a fiduciary slot, a spouse's block, a child, an account) is built by a
 * function in this file so the static markup and the "+ Add" buttons cannot
 * drift apart.
 *
 * Conventions the behavior module (intakeBehavior.ts) relies on:
 *   data-show-if   conditional display; see evalCondition() for the grammar
 *   data-scope     the element that scopes data-name lookups for data-show-if
 *   data-name      a control that a data-show-if condition can read
 *   data-person    1 | 2 — a block answered separately by each spouse
 *   data-k         a key unique within one person, used to copy Spouse 1's
 *                  answers to Spouse 2
 *   data-collect="off"  a helper control the collector must not record
 */

export const STATE_OPTIONS =
  '<option value="">Select</option><option>VA</option><option>MD</option><option>DC</option><option>AL</option><option>AK</option><option>AZ</option><option>AR</option><option>CA</option><option>CO</option><option>CT</option><option>DE</option><option>FL</option><option>GA</option><option>HI</option><option>ID</option><option>IL</option><option>IN</option><option>IA</option><option>KS</option><option>KY</option><option>LA</option><option>ME</option><option>MA</option><option>MI</option><option>MN</option><option>MS</option><option>MO</option><option>MT</option><option>NE</option><option>NV</option><option>NH</option><option>NJ</option><option>NM</option><option>NY</option><option>NC</option><option>ND</option><option>OH</option><option>OK</option><option>OR</option><option>PA</option><option>RI</option><option>SC</option><option>SD</option><option>TN</option><option>TX</option><option>UT</option><option>VT</option><option>WA</option><option>WV</option><option>WI</option><option>WY</option>';

const YES_NO =
  '<option value="">Select</option><option>No</option><option>Yes</option>';

export type Person = 1 | 2;
export type RoleKey = "trustee" | "pr" | "agent" | "hca" | "hipaa";
export type SlotKey = "primary" | "backup1" | "backup2";

export const SLOT_LABELS: Record<SlotKey, string> = {
  primary: "Primary",
  backup1: "First Backup",
  backup2: "Second Backup",
};

export const ROLE_LABELS: Record<RoleKey, string> = {
  trustee: "Successor Trustee",
  pr: "Personal Representative",
  agent: "Agent (Attorney-in-Fact)",
  hca: "Health Care Agent",
  hipaa: "Authorized Individual",
};

export const BACKUP_WARNING =
  "If your first choice cannot serve and no backup is named, a court may have to appoint someone.";

export const EXCLUDED_CHILD_NOTE =
  "Your attorney will confirm this with you privately.";

export const LAST_DEATH_HELP =
  "This is who inherits after both of you have died.";

/** Prefix filled in by the behavior module: "Spouse 1 (Jane Doe) — " for a couple, empty otherwise. */
const personTag = (p: Person) => `<span data-person-tag="${p}"></span>`;

// ── Fiduciary slots ──────────────────────────────────────────────────────────

function slotHtml(
  role: RoleKey,
  slot: SlotKey,
  opts: { id?: string; required?: boolean; street?: boolean } = {}
): string {
  const k = `${role}.${slot}`;
  const sl = SLOT_LABELS[slot];
  const id = opts.id ? ` id="${opts.id}"` : "";
  const req = opts.required ? ' <span class="req">*</span>' : "";
  const street = opts.street
    ? `<div class="form-row"><div class="form-group"><label>${sl} — Street Address</label><input type="text" data-k="${k}.street" data-f="street" placeholder="Street address"></div></div>`
    : "";
  return `<div data-slot="${slot}">
    <div class="form-row cols-2">
      <div class="form-group"><label>${ROLE_LABELS[role]} — ${sl}${req}</label><input type="text"${id} data-k="${k}.name" data-f="name" placeholder="Full legal name"></div>
      <div class="form-group"><label>${sl} — Relationship</label><input type="text" data-k="${k}.relationship" data-f="relationship" placeholder="e.g., Daughter, Brother, Friend"></div>
    </div>
    <div class="form-row cols-3">
      <div class="form-group"><label>${sl} — City, State</label><input type="text" data-k="${k}.cityState" data-f="cityState" placeholder="City, State"></div>
      <div class="form-group"><label>${sl} — Phone</label><input type="tel" data-k="${k}.phone" data-f="phone" placeholder="(555) 555-5555"></div>
      <div class="form-group"><label>${sl} — Email</label><input type="email" data-k="${k}.email" data-f="email" placeholder="email@example.com"></div>
    </div>
    ${street}
  </div>`;
}

/** Primary, first backup, and an opt-in second backup for one role. */
function roleSlotsHtml(
  role: RoleKey,
  opts: { primaryId?: string; required?: boolean; street?: boolean } = {}
): string {
  return `${slotHtml(role, "primary", { id: opts.primaryId, required: opts.required, street: opts.street })}
    ${slotHtml(role, "backup1", { street: opts.street })}
    <div class="soft-warning hidden" data-backup-warning>${BACKUP_WARNING}</div>
    <input type="checkbox" class="hidden" data-collect="off" data-name="b2open" data-k="${role}.b2open">
    <button type="button" class="add-btn" data-open-b2 data-show-if="!b2open">+ Add a second backup (optional)</button>
    <div class="hidden" data-show-if="b2open">${slotHtml(role, "backup2", { street: opts.street })}</div>`;
}

const SAME_AS_TRUSTEE = (role: RoleKey) =>
  `<label class="check-option same-as"><input type="checkbox" data-name="sameAsTrustee" data-k="${role}.same"> Same people as my successor trustees</label>`;

const SAME_ANSWERS = `<label class="check-option same-as p2-same-row"><input type="checkbox" class="p2-same-cb"> Same answers as my spouse, with my spouse named in the roles where I am named</label>`;

function personOpen(p: Person): string {
  const show = p === 2 ? ' data-show-if="@couple"' : "";
  return `<div class="person-block${p === 2 ? " hidden" : ""}" data-person="${p}"${show}>
    <div class="person-header hidden" data-show-if="@couple"><span data-person-name="${p}"></span></div>
    ${p === 2 ? SAME_ANSWERS : ""}`;
}

/** Section 5: trustee and personal representative, answered by one person. */
export function fiduciaryPersonHtml(p: Person): string {
  return `${personOpen(p)}
    <div class="subsection" data-role="trustee" data-scope>
      <div class="subsection-title">${personTag(p)}Trustee</div>
      <div class="notice" style="margin-top:0;">While you are living and competent, you will serve as your own Trustee. The following individuals succeed you upon incapacity or death.</div>
      ${roleSlotsHtml("trustee", { primaryId: p === 1 ? "trustee1" : undefined, required: true })}
      <div class="form-row cols-2" style="margin-top:16px;">
        <div class="form-group"><label>Co-Trustees?</label><select data-k="trustee.co"><option>No — single trustee at all times</option><option>Yes — co-trustees must act unanimously</option><option>Yes — co-trustees may act independently</option></select></div>
        <div class="form-group"><label>Trustee Compensation</label><select data-k="trustee.comp"><option>No compensation (family member)</option><option>Reasonable compensation per Virginia law</option><option>Specified amount (describe in notes)</option></select></div>
      </div>
    </div>
    <div class="subsection" data-role="pr" data-scope>
      <div class="subsection-title">${personTag(p)}Personal Representative (Executor) — Pour-Over Will</div>
      ${SAME_AS_TRUSTEE("pr")}
      ${roleSlotsHtml("pr")}
    </div>
  </div>`;
}

/** Section 6: financial agent, health care agent, directives and HIPAA, answered by one person. */
export function directivesPersonHtml(p: Person): string {
  const sfx = p === 1 ? "" : "-2";
  const lst = (name: string, i: number, text: string) =>
    `<label class="radio-option"><input type="radio" name="${name}${sfx}" data-k="${name}.${i}"> ${text}</label>`;
  const lstOptions = (name: string) =>
    lst(
      name,
      0,
      "Withhold or withdraw life-sustaining treatment and allow natural death"
    ) +
    lst(name, 1, "Continue all life-sustaining treatment") +
    lst(name, 2, "Leave decision to my Health Care Agent");
  return `${personOpen(p)}
    <div class="subsection" data-role="agent" data-scope>
      <div class="subsection-title">${personTag(p)}Durable General Power of Attorney (Financial)</div>
      <div class="form-row cols-2">
        <div class="form-group"><label>State(s) Needed</label><div class="check-group"><label class="check-option"><input type="checkbox" checked data-k="poa.va"> Virginia</label><label class="check-option"><input type="checkbox" data-k="poa.md"> Maryland</label><label class="check-option"><input type="checkbox" data-k="poa.other"> Other</label></div></div>
        <div class="form-group"><label>Effective Date</label><select data-k="poa.effective"><option>Immediately upon execution (recommended in VA)</option><option>Springing — effective upon incapacity only</option></select></div>
      </div>
      ${SAME_AS_TRUSTEE("agent")}
      ${roleSlotsHtml("agent", { primaryId: p === 1 ? "poa1" : undefined, required: true })}
      <div class="form-row" style="margin-top:16px;"><div class="form-group"><label>Notes on POA Powers or Limitations</label><textarea data-k="poa.notes" placeholder="e.g., agent may make gifts up to annual exclusion amount..."></textarea></div></div>
    </div>
    <div class="subsection" data-role="hca" data-scope>
      <div class="subsection-title">${personTag(p)}Health Care Power of Attorney &amp; Advance Medical Directive</div>
      ${SAME_AS_TRUSTEE("hca")}
      ${roleSlotsHtml("hca", { primaryId: p === 1 ? "hca1" : undefined, required: true, street: true })}
      <hr class="divider">
      <div style="font-family:'Cormorant Garamond',serif;font-size:15px;color:var(--navy);margin-bottom:12px;">Life-Sustaining Treatment Preferences</div>
      <div class="form-row"><div class="form-group"><label>Terminal Condition</label>
        <div class="radio-group" style="flex-direction:column;gap:8px;margin-top:8px;">${lstOptions("terminal")}</div>
      </div></div>
      <div class="form-row"><div class="form-group"><label>Persistent Vegetative State</label>
        <div class="radio-group" style="flex-direction:column;gap:8px;margin-top:8px;">${lstOptions("pvs")}</div>
      </div></div>
      <div class="form-row cols-2">
        <div class="form-group"><label>Organ &amp; Tissue Donation</label><select data-k="amd.organ"><option>No donation</option><option>Yes — any organs and tissue</option><option>Yes — specific organs only (describe in notes)</option><option>As determined by my Health Care Agent</option></select></div>
        <div class="form-group"><label>Funeral / Burial Preferences</label><select data-k="amd.funeral"><option>No preference — as determined by family</option><option>Burial</option><option>Cremation</option><option>Pre-arranged (describe in notes)</option></select></div>
      </div>
      <div class="form-row"><div class="form-group"><label>Additional Medical Directive Instructions</label><textarea rows="3" data-k="amd.notes" placeholder="Religious beliefs affecting medical care, specific instructions, etc."></textarea></div></div>
    </div>
    <div class="subsection" data-role="hipaa" data-scope>
      <div class="subsection-title">${personTag(p)}HIPAA Authorization</div>
      <label class="check-option same-as"><input type="checkbox" checked data-name="sameAsHca" data-k="hipaa.same"> Same people as my health care agents</label>
      <div class="hidden" data-show-if="!sameAsHca">${roleSlotsHtml("hipaa")}</div>
    </div>
  </div>`;
}

// ── Section 1: prior marriages and court orders, per person ─────────────────

export const COURT_ORDER_ITEMS: { name: string; text: string }[] = [
  { name: "oChild", text: "Pay child support" },
  { name: "oSpousal", text: "Pay spousal support" },
  {
    name: "oInsurance",
    text: "Keep life insurance in force or name a specific beneficiary",
  },
  {
    name: "oProperty",
    text: "Leave property to someone or keep someone as a beneficiary",
  },
  { name: "oOther", text: "Other" },
];

const ANY_ORDER = COURT_ORDER_ITEMS.map(i => i.name).join("||");

export function courtOrdersHtml(p: Person): string {
  const show = p === 2 ? ' data-show-if="@couple"' : "";
  const boxes = COURT_ORDER_ITEMS.map(
    i =>
      `<label class="check-option"><input type="checkbox" data-name="${i.name}" data-order-item> ${i.text}</label>`
  ).join("");
  return `<div class="subsection${p === 2 ? " hidden" : ""}" data-court="${p}" data-scope${show}>
    <div class="subsection-title">${personTag(p)}Prior Marriages &amp; Court Orders</div>
    <div class="form-row cols-3">
      <div class="form-group"><label>Have you been married before? <span class="req">*</span></label><select data-name="marriedBefore">${YES_NO}</select></div>
      <div class="form-group hidden" data-show-if="marriedBefore=Yes"><label>Year the divorce was final</label><input type="text" inputmode="numeric" maxlength="4" placeholder="e.g., 2015"></div>
      <div class="form-group hidden" data-show-if="marriedBefore=Yes"><label>State where the divorce was granted</label><select>${STATE_OPTIONS}</select></div>
    </div>
    <div class="form-row hidden" data-show-if="marriedBefore=Yes"><div class="form-group"><label>Anything else about a prior marriage</label><input type="text" placeholder="e.g., more than one prior marriage, or a prior spouse who has died"></div></div>
    <div class="form-row"><div class="form-group"><label>Are you required by a divorce decree or other court order to do any of the following? <span class="req">*</span></label>
      <div class="check-group" data-order-group><label class="check-option"><input type="checkbox" data-name="oNone" data-order-none> None of these</label>${boxes}</div>
    </div></div>
    <div class="hidden" data-show-if="${ANY_ORDER}">
      <div class="form-row"><div class="form-group"><label>Briefly, what does the order require?</label><input type="text" data-order-detail placeholder="e.g., keep a $250,000 policy for the children until the youngest turns 21"></div></div>
      <div class="notice"><strong>Send us the decree or order (all pages).</strong> Please send the full signed order, including any later changes. Your attorney needs to read it before drafting. Email it to kelly@thesatterwhitelawfirm.com, or bring it to your consultation.</div>
      <div class="form-row"><div class="form-group"><label>How will you get the decree or order to us?</label><select data-order-delivery><option value="">Select</option><option>I will email it</option><option>I will bring it to my consultation</option><option>I do not have a copy</option></select></div></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Is there any unpaid court judgment against you? <span class="req">*</span></label><select data-name="judgment">${YES_NO}</select></div>
      <div class="form-group hidden" data-show-if="judgment=Yes"><label>Briefly describe the judgment</label><input type="text" data-judgment-detail placeholder="Who it is owed to and roughly how much"></div>
    </div>
  </div>`;
}

// ── Repeatable entries (the "+ Add" buttons) ────────────────────────────────

const OWNER = `<div class="form-group" data-show-if="@couple"><label>Owner</label><select data-owner><option value="">Select</option><option value="p1">Spouse 1</option><option value="p2">Spouse 2</option><option value="joint">Joint</option></select></div>`;

/** A beneficiary question with a "Not sure" tick box that fills the answer in. */
const beneficiary = (label: string) =>
  `<div class="form-group"><label>${label}</label><input type="text" placeholder="Name"><label class="check-option not-sure"><input type="checkbox" data-collect="off" data-not-sure> Not sure</label></div>`;

function entry(title: string, body: string): string {
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div class="subsection-title" style="font-size:14px;margin-bottom:0;">${title}</div><button type="button" data-remove-entry aria-label="Remove ${title}" style="background:none;border:none;color:var(--mid-gray);cursor:pointer;font-size:20px;line-height:1;">&times;</button></div>${body}`;
}

const SHARE_OPTIONS =
  '<option value="">Select</option><option>Yes</option><option>No</option><option>Not sure, want to discuss</option>';

export const ENTRY_BUILDERS = {
  child: (n: number) =>
    entry(
      `Child ${n}`,
      `<div class="form-row cols-3">
        <div class="form-group"><label>First Name</label><input type="text" data-child-first placeholder="First"></div>
        <div class="form-group"><label>Full Middle Name</label><input type="text" placeholder="Middle"></div>
        <div class="form-group"><label>Last Name</label><input type="text" data-child-last placeholder="Last"></div>
      </div>
      <div class="form-row cols-3">
        <div class="form-group"><label>Date of Birth</label><input type="date" data-child-dob></div>
        <div class="form-group"><label>Relationship</label><select><option value="">Select</option><option>Biological child</option><option>Adopted child</option><option>Stepchild</option></select></div>
        <div class="form-group"><label>Minor (from date of birth)</label><input type="text" readonly tabindex="-1" class="computed" data-child-minor placeholder="Enter date of birth"></div>
      </div>
      <div class="form-row" data-show-if="@couple"><div class="form-group"><label>This child is</label><select data-child-parentage><option value="">Select</option><option value="both">A child of both of us</option><option value="p1">Spouse 1's child from a prior relationship</option><option value="p2">Spouse 2's child from a prior relationship</option></select></div></div>
      <div class="form-row cols-2">
        <div class="form-group"><label data-share-label="1">Should this child receive a share under your plan?</label><select data-name="share1" data-child-share="1">${SHARE_OPTIONS}</select><div class="help-text" data-show-if="share1=No">${EXCLUDED_CHILD_NOTE}</div></div>
        <div class="form-group" data-show-if="@couple"><label data-share-label="2">Should this child receive a share under your plan?</label><select data-name="share2" data-child-share="2">${SHARE_OPTIONS}</select><div class="help-text" data-show-if="share2=No">${EXCLUDED_CHILD_NOTE}</div></div>
      </div>`
    ),

  otherBen: (n: number) =>
    entry(
      `Beneficiary ${n}`,
      `<div class="form-row cols-3"><div class="form-group"><label>Name / Organization</label><input type="text" placeholder="Full name or org"></div><div class="form-group"><label>Type</label><select><option>Individual</option><option>Charitable Organization</option><option>Trust</option><option>Estate</option></select></div><div class="form-group"><label>Relationship</label><input type="text" placeholder="e.g., Sibling, Charity"></div></div>`
    ),

  property: (n: number) =>
    entry(
      `Property ${n}`,
      `<div class="form-row"><div class="form-group"><label>Property Address</label><input type="text" placeholder="Full address"></div></div>
      <div class="form-row cols-3"><div class="form-group"><label>Type</label><select><option>Primary Residence</option><option>Secondary Residence</option><option>Investment Property</option><option>Vacant Land</option><option>Commercial</option></select></div><div class="form-group"><label>Approx. Value</label><input type="text" placeholder="$"></div><div class="form-group"><label>Mortgage Balance</label><input type="text" placeholder="$0 if none"></div></div>
      <div class="form-row cols-3"><div class="form-group"><label>How is title held?</label><select><option value="">Select</option><option>My name only</option><option>Both spouses</option><option>With someone else</option><option>In a trust or company</option><option>Not sure</option></select></div><div class="form-group"><label>State where it is located</label><select>${STATE_OPTIONS}</select></div>${OWNER}</div>`
    ),

  financial: () =>
    entry(
      "Account",
      `<div class="form-row cols-3"><div class="form-group"><label>Institution</label><input type="text" placeholder="Bank or brokerage name"></div><div class="form-group"><label>Account Type</label><select data-name="acctType"><option value="checking">Checking</option><option value="savings">Savings</option><option value="brokerage">Brokerage (non-retirement)</option><option value="investment">Investment</option><option value="mm">Money Market</option><option value="cd">CD</option><option value="529">529 education account</option><option value="custodial">Child's savings or custodial account</option><option value="other">Other</option></select></div><div class="form-group"><label>Approx. Balance</label><input type="text" placeholder="$"></div></div>
      <div class="form-row cols-2"><div class="form-group" data-show-if="acctType=529|custodial"><label>Who is the account for?</label><input type="text" placeholder="Child's name"></div>${OWNER}</div>`
    ),

  retirement: () =>
    entry(
      "Retirement Account",
      `<div class="form-row cols-3"><div class="form-group"><label>Institution</label><input type="text" placeholder="e.g., Fidelity, Vanguard, TSP"></div><div class="form-group"><label>Account Type</label><select><option>Traditional IRA</option><option>Roth IRA</option><option>401(k)</option><option>403(b)</option><option>TSP (Thrift Savings Plan)</option><option>457</option><option>Pension</option><option>SEP-IRA</option><option>Other</option></select></div><div class="form-group"><label>Approx. Balance</label><input type="text" placeholder="$"></div></div>
      <div class="form-row cols-3">${beneficiary("Who is the primary beneficiary today?")}${beneficiary("Contingent beneficiary?")}${OWNER}</div>`
    ),

  insurance: () =>
    entry(
      "Insurance Policy",
      `<div class="form-row cols-3"><div class="form-group"><label>Insurer</label><input type="text" placeholder="Insurance company"></div><div class="form-group"><label>Policy Type</label><select><option>Term Life</option><option>Whole Life</option><option>Universal Life</option><option>Variable Life</option><option>Group / Employer</option></select></div><div class="form-group"><label>Death Benefit</label><input type="text" placeholder="$"></div></div>
      <div class="form-row cols-3">${beneficiary("Who is the primary beneficiary today?")}${beneficiary("Contingent beneficiary?")}${OWNER}</div>`
    ),

  business: () =>
    entry(
      "Business Interest",
      `<div class="form-row cols-3"><div class="form-group"><label>Business Name</label><input type="text" placeholder="Entity name"></div><div class="form-group"><label>Entity Type</label><select><option>LLC</option><option>S-Corp</option><option>C-Corp</option><option>Partnership</option><option>Sole Proprietorship</option><option>Other</option></select></div><div class="form-group"><label>State</label><select>${STATE_OPTIONS}</select></div></div>
      <div class="form-row cols-3"><div class="form-group"><label>Your Ownership %</label><input type="text" placeholder="e.g., 50%"></div><div class="form-group"><label>Is a professional license required to own it?</label><select>${YES_NO}</select></div>${OWNER}</div>`
    ),

  otherAsset: () =>
    entry(
      "Asset",
      `<div class="form-row cols-3"><div class="form-group"><label>Description</label><input type="text" placeholder="e.g., 2022 Mercedes, Bitcoin holdings"></div><div class="form-group"><label>Type</label><select><option>Vehicle</option><option>Watercraft / RV</option><option>Jewelry / Art</option><option>Cryptocurrency</option><option>Notes Receivable</option><option>Intellectual Property</option><option>Other</option></select></div><div class="form-group"><label>Approx. Value</label><input type="text" placeholder="$"></div></div>
      <div class="form-row cols-2">${OWNER}</div>`
    ),
} as const;

/** Rows appended inside an existing subsection, so they stay in that subsection's group. */
export const ROW_BUILDERS = {
  bequest: () =>
    `<div class="form-group"><label>Item / Amount</label><input type="text" placeholder="e.g., $10,000 cash; grandmother's ring"></div><div class="form-group"><label>To (Beneficiary)</label><input type="text" placeholder="Name or organization"></div><div class="form-group"><label>Condition (if any)</label><input type="text" placeholder="e.g., if they survive me by 30 days"></div>`,
  lastBen: () =>
    `<div class="form-group"><label>Beneficiary Name</label><input type="text" data-lastben-name placeholder="Full name or organization"></div><div class="form-group"><label>Beneficiary Relationship</label><input type="text" data-lastben-rel placeholder="e.g., Daughter, Nephew, Charity"></div><div class="form-group"><label>Share</label><input type="text" placeholder="e.g., 50%"></div>`,
} as const;

export type EntryKind = keyof typeof ENTRY_BUILDERS;
export type RowKind = keyof typeof ROW_BUILDERS;
