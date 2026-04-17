/*
 * IntakeForm.tsx — Trust & Estate Planning Client Intake Form
 * Embeds the original multi-step HTML form with all original styling preserved.
 * On submit, collects all visible form field values and sends them to the
 * backend via tRPC intake.submit, which notifies kelly@thesatterwhitelawfirm.com
 */
import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

// The full intake form HTML content (inlined for reliability)
const INTAKE_HTML = `
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root{--navy:#1a2744;--gold:#b8913f;--cream:#faf8f4;--warm-gray:#f0ede8;--mid-gray:#8a8680;--dark:#1e1c19;--border:#ddd9d2;}
*{box-sizing:border-box;margin:0;padding:0;}
#intake-wrapper{font-family:'Jost',sans-serif;background:var(--cream);color:var(--dark);font-size:14px;font-weight:300;line-height:1.7;}
.page-wrapper{max-width:860px;margin:0 auto;padding:40px 20px 80px;}
.firm-header{text-align:center;padding-bottom:32px;border-bottom:1px solid var(--gold);margin-bottom:40px;}
.firm-name{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:500;color:var(--navy);letter-spacing:.04em;margin-bottom:4px;}
.firm-sub{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:8px;}
.firm-contact{font-size:12px;color:var(--mid-gray);}
.form-title{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:400;font-style:italic;color:var(--navy);margin-top:14px;}
.progress-bar{display:flex;align-items:center;margin-bottom:40px;}
.progress-step{flex:1;text-align:center;position:relative;}
.progress-step::after{content:'';position:absolute;top:14px;left:50%;width:100%;height:1px;background:var(--border);z-index:0;}
.progress-step:last-child::after{display:none;}
.step-dot{width:28px;height:28px;border-radius:50%;background:var(--warm-gray);border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;color:var(--mid-gray);position:relative;z-index:1;transition:all .3s;}
.progress-step.active .step-dot{background:var(--navy);border-color:var(--navy);color:white;}
.progress-step.completed .step-dot{background:var(--gold);border-color:var(--gold);color:white;}
.step-label{display:block;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--mid-gray);margin-top:6px;}
.progress-step.active .step-label{color:var(--navy);font-weight:500;}
.section{display:none;animation:fadeIn .4s ease;}
.section.active{display:block;}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.section-header{margin-bottom:28px;padding-bottom:16px;border-bottom:1px solid var(--border);}
.section-number{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:4px;}
.section-title{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:500;color:var(--navy);}
.section-desc{font-size:13px;color:var(--mid-gray);margin-top:6px;}
.form-row{display:grid;gap:16px;margin-bottom:16px;}
.form-row.cols-2{grid-template-columns:1fr 1fr;}
.form-row.cols-3{grid-template-columns:1fr 1fr 1fr;}
.form-row.cols-4{grid-template-columns:1fr 1fr 1fr 1fr;}
.form-group{display:flex;flex-direction:column;}
label{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--mid-gray);margin-bottom:6px;font-weight:400;}
label .req{color:var(--gold);margin-left:2px;}
input[type="text"],input[type="email"],input[type="tel"],input[type="date"],select,textarea{background:white;border:1px solid var(--border);border-radius:2px;padding:10px 12px;font-family:'Jost',sans-serif;font-size:14px;font-weight:300;color:var(--dark);transition:border-color .2s;outline:none;width:100%;}
input:focus,select:focus,textarea:focus{border-color:var(--navy);}
textarea{resize:vertical;min-height:90px;}
select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238a8680' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;}
.toggle-group{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
.toggle-label{font-size:13px;font-weight:400;color:var(--dark);}
.toggle{position:relative;width:44px;height:24px;flex-shrink:0;}
.toggle input{display:none;}
.toggle-track{position:absolute;inset:0;background:var(--border);border-radius:12px;cursor:pointer;transition:background .3s;}
.toggle input:checked+.toggle-track{background:var(--navy);}
.toggle-thumb{position:absolute;top:3px;left:3px;width:18px;height:18px;background:white;border-radius:50%;transition:transform .3s;pointer-events:none;}
.toggle input:checked~.toggle-thumb{transform:translateX(20px);}
.radio-group,.check-group{display:flex;flex-wrap:wrap;gap:10px;margin-top:4px;}
.radio-option,.check-option{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:400;}
.radio-option input,.check-option input{width:16px;height:16px;accent-color:var(--navy);cursor:pointer;flex-shrink:0;}
.subsection{background:var(--warm-gray);border-left:3px solid var(--gold);padding:20px 24px;margin:20px 0;border-radius:0 2px 2px 0;}
.subsection-title{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:500;color:var(--navy);margin-bottom:16px;}
.collapsible-trigger{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:white;border:1px solid var(--border);border-radius:2px;cursor:pointer;margin-bottom:2px;font-size:13px;font-weight:400;color:var(--dark);user-select:none;}
.collapsible-trigger:hover{border-color:var(--navy);}
.collapsible-trigger.open{border-color:var(--navy);border-bottom-color:transparent;border-radius:2px 2px 0 0;}
.collapsible-content{display:none;background:white;border:1px solid var(--navy);border-top:none;border-radius:0 0 2px 2px;padding:20px;margin-bottom:12px;}
.collapsible-content.open{display:block;}
.chevron{transition:transform .3s;font-size:12px;color:var(--mid-gray);}
.collapsible-trigger.open .chevron{transform:rotate(180deg);}
.add-btn{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px dashed var(--gold);background:transparent;color:var(--gold);font-family:'Jost',sans-serif;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all .2s;margin-top:8px;}
.add-btn:hover{background:var(--gold);color:white;}
.notice{background:#eef1f7;border:1px solid #c8d0e4;border-radius:2px;padding:14px 18px;font-size:12px;color:var(--navy);margin:16px 0;line-height:1.6;}
.nav-bar{display:flex;justify-content:space-between;align-items:center;margin-top:40px;padding-top:24px;border-top:1px solid var(--border);}
.btn{padding:12px 32px;font-family:'Jost',sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all .2s;}
.btn-primary{background:var(--navy);color:white;border:1px solid var(--navy);}
.btn-primary:hover{background:#243460;}
.btn-secondary{background:transparent;color:var(--navy);border:1px solid var(--navy);}
.btn-secondary:hover{background:var(--navy);color:white;}
.btn-ghost{background:transparent;color:var(--mid-gray);border:1px solid transparent;}
.btn-ghost:hover{color:var(--dark);}
.btn-primary:disabled{opacity:0.6;cursor:not-allowed;}
.review-block{background:white;border:1px solid var(--border);border-radius:2px;margin-bottom:12px;overflow:hidden;}
.review-block-header{background:var(--navy);color:white;padding:10px 16px;font-size:11px;letter-spacing:.15em;text-transform:uppercase;}
.review-grid{display:grid;grid-template-columns:1fr 1fr;}
.review-field{padding:10px 16px;border-bottom:1px solid var(--warm-gray);}
.review-field-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--mid-gray);}
.review-field-value{font-size:13px;color:var(--dark);margin-top:2px;}
.success-screen{text-align:center;padding:60px 20px;}
.success-icon{width:64px;height:64px;background:var(--navy);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:white;font-size:28px;margin-bottom:24px;}
.success-title{font-family:'Cormorant Garamond',serif;font-size:32px;color:var(--navy);margin-bottom:12px;}
.success-sub{font-size:14px;color:var(--mid-gray);max-width:400px;margin:0 auto 32px;}
.hidden{display:none!important;}
.divider{border:none;border-top:1px solid var(--border);margin:24px 0;}
.submit-status{text-align:center;padding:12px;font-size:13px;color:var(--mid-gray);font-family:'Jost',sans-serif;}
.submit-error{background:#fef2f2;border:1px solid #fecaca;border-radius:2px;padding:12px 16px;font-size:13px;color:#dc2626;margin-top:12px;}
@media(max-width:600px){.form-row.cols-2,.form-row.cols-3,.form-row.cols-4{grid-template-columns:1fr;}.review-grid{grid-template-columns:1fr;}}
</style>

<div id="intake-wrapper">
<div class="page-wrapper">

<div class="firm-header">
  <div class="firm-sub">Estate Planning Client Intake</div>
  <div class="firm-name">The Satterwhite Law Firm, PLLC</div>
  <div class="firm-contact">1605 Fort Hunt Ct &nbsp;&bull;&nbsp; Alexandria, VA 22307 &nbsp;&bull;&nbsp; Trusts &amp; Estates &nbsp;&bull;&nbsp; Real Estate &nbsp;&bull;&nbsp; Business Law</div>
  <div class="form-title">Revocable Living Trust &nbsp;&bull;&nbsp; Pour-Over Will &nbsp;&bull;&nbsp; Powers of Attorney &nbsp;&bull;&nbsp; Advance Medical Directive</div>
</div>

<div class="progress-bar" id="progressBar">
  <div class="progress-step active" data-step="0"><span class="step-dot">1</span><span class="step-label">Client Info</span></div>
  <div class="progress-step" data-step="1"><span class="step-dot">2</span><span class="step-label">Family</span></div>
  <div class="progress-step" data-step="2"><span class="step-dot">3</span><span class="step-label">Assets</span></div>
  <div class="progress-step" data-step="3"><span class="step-dot">4</span><span class="step-label">Distribution</span></div>
  <div class="progress-step" data-step="4"><span class="step-dot">5</span><span class="step-label">Fiduciaries</span></div>
  <div class="progress-step" data-step="5"><span class="step-dot">6</span><span class="step-label">POA / AMD</span></div>
  <div class="progress-step" data-step="6"><span class="step-dot">7</span><span class="step-label">Review</span></div>
</div>

<!-- SECTION 1 -->
<div class="section active" id="section-0">
  <div class="section-header">
    <div class="section-number">Section 01</div>
    <div class="section-title">Client Information</div>
    <div class="section-desc">Provide information for the primary client and spouse/partner if applicable.</div>
  </div>
  <div class="notice">This intake form is confidential and protected by attorney-client privilege. It does not create an attorney-client relationship until a formal engagement letter is signed.</div>
  <div class="subsection">
    <div class="subsection-title">Primary Client (Grantor 1)</div>
    <div class="form-row cols-3">
      <div class="form-group"><label>First Name <span class="req">*</span></label><input type="text" id="g1-first" placeholder="First"></div>
      <div class="form-group"><label>Middle Name</label><input type="text" id="g1-mid" placeholder="Middle"></div>
      <div class="form-group"><label>Last Name <span class="req">*</span></label><input type="text" id="g1-last" placeholder="Last"></div>
    </div>
    <div class="form-row cols-3">
      <div class="form-group"><label>Suffix</label><select id="g1-suffix"><option value="">None</option><option>Jr.</option><option>Sr.</option><option>II</option><option>III</option><option>IV</option></select></div>
      <div class="form-group"><label>Date of Birth <span class="req">*</span></label><input type="date" id="g1-dob"></div>
      <div class="form-group"><label>Place of Birth</label><input type="text" id="g1-pob" placeholder="City, State"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Email <span class="req">*</span></label><input type="email" id="g1-email" placeholder="email@example.com"></div>
      <div class="form-group"><label>Phone <span class="req">*</span></label><input type="tel" id="g1-phone" placeholder="(555) 555-5555"></div>
    </div>
    <div class="form-row"><div class="form-group"><label>Street Address <span class="req">*</span></label><input type="text" id="g1-addr" placeholder="Street Address"></div></div>
    <div class="form-row cols-3">
      <div class="form-group"><label>City</label><input type="text" id="g1-city" placeholder="City"></div>
      <div class="form-group"><label>State</label><select id="g1-state"><option value="">Select</option><option>VA</option><option>MD</option><option>DC</option><option>AL</option><option>AK</option><option>AZ</option><option>AR</option><option>CA</option><option>CO</option><option>CT</option><option>DE</option><option>FL</option><option>GA</option><option>HI</option><option>ID</option><option>IL</option><option>IN</option><option>IA</option><option>KS</option><option>KY</option><option>LA</option><option>ME</option><option>MA</option><option>MI</option><option>MN</option><option>MS</option><option>MO</option><option>MT</option><option>NE</option><option>NV</option><option>NH</option><option>NJ</option><option>NM</option><option>NY</option><option>NC</option><option>ND</option><option>OH</option><option>OK</option><option>OR</option><option>PA</option><option>RI</option><option>SC</option><option>SD</option><option>TN</option><option>TX</option><option>UT</option><option>VT</option><option>WA</option><option>WV</option><option>WI</option><option>WY</option></select></div>
      <div class="form-group"><label>ZIP</label><input type="text" id="g1-zip" placeholder="00000"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Citizenship</label><select id="g1-citizen"><option value="US">U.S. Citizen</option><option value="PR">Permanent Resident</option><option value="Other">Other</option></select></div>
      <div class="form-group"><label>Marital Status</label><select id="g1-marital"><option value="">Select</option><option>Single</option><option>Married</option><option>Domestic Partner</option><option>Divorced</option><option>Widowed</option><option>Separated</option></select></div>
    </div>
  </div>
  <div class="toggle-group">
    <label class="toggle"><input type="checkbox" id="hasSpouse" onchange="intakeToggleSpouse()"><div class="toggle-track"></div><div class="toggle-thumb"></div></label>
    <span class="toggle-label">This is a joint trust — add spouse or partner (Grantor 2)</span>
  </div>
  <div id="spouseSection" class="subsection hidden">
    <div class="subsection-title">Spouse / Partner (Grantor 2)</div>
    <div class="form-row cols-3">
      <div class="form-group"><label>First Name</label><input type="text" id="g2-first" placeholder="First"></div>
      <div class="form-group"><label>Middle Name</label><input type="text" placeholder="Middle"></div>
      <div class="form-group"><label>Last Name</label><input type="text" id="g2-last" placeholder="Last"></div>
    </div>
    <div class="form-row cols-3">
      <div class="form-group"><label>Suffix</label><select><option value="">None</option><option>Jr.</option><option>Sr.</option><option>II</option><option>III</option></select></div>
      <div class="form-group"><label>Date of Birth</label><input type="date" id="g2-dob"></div>
      <div class="form-group"><label>Place of Birth</label><input type="text" placeholder="City, State"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Email</label><input type="email" id="g2-email" placeholder="email@example.com"></div>
      <div class="form-group"><label>Phone</label><input type="tel" placeholder="(555) 555-5555"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Citizenship</label><select><option value="US">U.S. Citizen</option><option value="PR">Permanent Resident</option><option value="Other">Other</option></select></div>
      <div class="form-group"><label>Same Address as Grantor 1?</label><select><option value="yes">Yes</option><option value="no">No — enter separately</option></select></div>
    </div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>How Did You Hear About Us?</label><select><option value="">Select</option><option>Referral — existing client</option><option>Referral — attorney or professional</option><option>Title company referral</option><option>Google / web search</option><option>Social media</option><option>Prior client (returning)</option><option>Other</option></select></div>
  </div>
  <div class="form-row"><div class="form-group"><label>Notes / Special Circumstances</label><textarea placeholder="Prior trusts or wills, blended family, foreign assets, special needs beneficiaries, business interests, prior estate plan to review, etc."></textarea></div></div>
</div>

<!-- SECTION 2 -->
<div class="section" id="section-1">
  <div class="section-header">
    <div class="section-number">Section 02</div>
    <div class="section-title">Family &amp; Beneficiaries</div>
    <div class="section-desc">Information about your family helps us structure trust distributions and guardianship provisions.</div>
  </div>
  <div style="font-family:'Cormorant Garamond',serif;font-size:18px;color:var(--navy);margin-bottom:16px;">Children</div>
  <div id="childrenList"></div>
  <button class="add-btn" onclick="intakeAddChild()">+ Add Child</button>
  <hr class="divider">
  <div class="toggle-group">
    <label class="toggle"><input type="checkbox" id="hasMinors" onchange="intakeToggleMinors()"><div class="toggle-track"></div><div class="toggle-thumb"></div></label>
    <span class="toggle-label">One or more children / beneficiaries are minors (under 18)</span>
  </div>
  <div id="minorSection" class="hidden">
    <div class="subsection">
      <div class="subsection-title">Minor Beneficiary Provisions</div>
      <div class="form-row cols-2">
        <div class="form-group"><label>Age for Outright Distribution</label><select><option>18</option><option>21</option><option selected>25</option><option>30</option><option>35</option><option>Custom (describe below)</option></select></div>
        <div class="form-group"><label>Distribution Structure</label><select><option>Full distribution at specified age</option><option>Staggered (1/3 at 25, 1/2 at 30, balance at 35)</option><option>Trustee discretion until specified age</option><option>HEMS standard (Health, Education, Maintenance, Support)</option></select></div>
      </div>
      <div class="form-row"><div class="form-group"><label>Additional Instructions for Minor Provisions</label><textarea placeholder="e.g., trustee may advance funds for college expenses..."></textarea></div></div>
    </div>
  </div>
  <hr class="divider">
  <div style="font-family:'Cormorant Garamond',serif;font-size:18px;color:var(--navy);margin-bottom:8px;">Other Beneficiaries</div>
  <div class="section-desc" style="margin-bottom:16px;">Any other individuals or organizations you intend to include (beyond children).</div>
  <div id="otherBenList"></div>
  <button class="add-btn" onclick="intakeAddOtherBen()">+ Add Beneficiary / Organization</button>
  <hr class="divider">
  <div class="subsection">
    <div class="subsection-title">Special Considerations</div>
    <div class="toggle-group"><label class="toggle"><input type="checkbox"><div class="toggle-track"></div><div class="toggle-thumb"></div></label><span class="toggle-label">A beneficiary has special needs that may affect government benefits eligibility</span></div>
    <div class="toggle-group"><label class="toggle"><input type="checkbox"><div class="toggle-track"></div><div class="toggle-thumb"></div></label><span class="toggle-label">A beneficiary has substance abuse or financial management concerns</span></div>
    <div class="toggle-group"><label class="toggle"><input type="checkbox"><div class="toggle-track"></div><div class="toggle-thumb"></div></label><span class="toggle-label">This is a blended family (children from prior relationships)</span></div>
    <div class="form-row" style="margin-top:12px;"><div class="form-group"><label>Additional Family / Beneficiary Notes</label><textarea placeholder="Prior marriages, estranged family, charitable intentions, pet provisions, specific exclusions, etc."></textarea></div></div>
  </div>
</div>

<!-- SECTION 3 -->
<div class="section" id="section-2">
  <div class="section-header">
    <div class="section-number">Section 03</div>
    <div class="section-title">Assets &amp; Property</div>
    <div class="section-desc">An overview of your assets. Estimates are sufficient — exact values are not required at this stage.</div>
  </div>
  <div class="notice">Assets must be titled in the name of your trust (or have the trust named as beneficiary) for the trust to govern their disposition. We will advise on retitling during our planning process.</div>
  <div class="collapsible-trigger open" onclick="intakeToggleCollapse(this)">Real Property <span class="chevron">&#9660;</span></div>
  <div class="collapsible-content open"><div id="realPropertyList"></div><button class="add-btn" onclick="intakeAddRealProperty()">+ Add Property</button></div>
  <div class="collapsible-trigger" onclick="intakeToggleCollapse(this)">Financial Accounts (Bank, Brokerage, Investment) <span class="chevron">&#9660;</span></div>
  <div class="collapsible-content"><div id="financialList"></div><button class="add-btn" onclick="intakeAddFinancial()">+ Add Account</button></div>
  <div class="collapsible-trigger" onclick="intakeToggleCollapse(this)">Retirement Accounts (IRA, 401k, 403b, Pension) <span class="chevron">&#9660;</span></div>
  <div class="collapsible-content">
    <div class="notice" style="margin-top:0;">Retirement accounts generally should <strong>not</strong> be titled in trust but may designate the trust or specific individuals as beneficiaries.</div>
    <div id="retirementList"></div><button class="add-btn" onclick="intakeAddRetirement()">+ Add Account</button>
  </div>
  <div class="collapsible-trigger" onclick="intakeToggleCollapse(this)">Life Insurance <span class="chevron">&#9660;</span></div>
  <div class="collapsible-content"><div id="insuranceList"></div><button class="add-btn" onclick="intakeAddInsurance()">+ Add Policy</button></div>
  <div class="collapsible-trigger" onclick="intakeToggleCollapse(this)">Business Interests <span class="chevron">&#9660;</span></div>
  <div class="collapsible-content"><div id="businessList"></div><button class="add-btn" onclick="intakeAddBusiness()">+ Add Business Interest</button></div>
  <div class="collapsible-trigger" onclick="intakeToggleCollapse(this)">Other Assets (Vehicles, Art, Crypto, Receivables, etc.) <span class="chevron">&#9660;</span></div>
  <div class="collapsible-content"><div id="otherAssetList"></div><button class="add-btn" onclick="intakeAddOtherAsset()">+ Add Asset</button></div>
  <div class="subsection" style="margin-top:24px;">
    <div class="subsection-title">Estimated Estate Value</div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Approximate Total Estate Value</label><select><option>Under $500,000</option><option>$500,000 – $1 million</option><option>$1 million – $2.5 million</option><option>$2.5 million – $5 million</option><option>$5 million – $10 million</option><option>Over $10 million</option><option>Prefer not to say</option></select></div>
      <div class="form-group"><label>Prior Estate Planning?</label><select><option>No prior planning</option><option>Will only</option><option>Existing trust (needs update)</option><option>Existing trust (needs pour-over will / POA)</option><option>Full prior plan — reviewing / updating</option></select></div>
    </div>
  </div>
</div>

<!-- SECTION 4 -->
<div class="section" id="section-3">
  <div class="section-header">
    <div class="section-number">Section 04</div>
    <div class="section-title">Distribution Plan</div>
    <div class="section-desc">Describe how you wish your trust assets to be distributed.</div>
  </div>
  <div class="subsection">
    <div class="subsection-title">During Grantor's Lifetime</div>
    <div class="form-row"><div class="form-group"><label>Trustee Distribution Standard During Lifetime</label><select><option>Grantor serves as sole Trustee — no standard required</option><option>HEMS (Health, Education, Maintenance, Support)</option><option>Trustee's absolute discretion</option><option>Other (describe in notes below)</option></select></div></div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Upon Death of First Grantor (Joint Trust Only)</div>
    <div class="form-row"><div class="form-group"><label>Surviving Spouse / Partner Receives</label><select><option>All assets outright and free of trust</option><option>All assets in continuing trust for spouse's benefit (QTIP / marital trust)</option><option>Specified share outright; remainder in trust</option><option>N/A — Single Grantor Trust</option></select></div></div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Upon Death of Last (or Sole) Grantor</div>
    <div class="form-row"><div class="form-group"><label>Primary Beneficiaries Receive</label>
      <div class="radio-group" style="flex-direction:column;gap:8px;margin-top:8px;">
        <label class="radio-option"><input type="radio" name="distType"> Equal shares to all surviving children</label>
        <label class="radio-option"><input type="radio" name="distType"> Per stirpes — deceased child's share passes to their descendants</label>
        <label class="radio-option"><input type="radio" name="distType"> Specific percentage allocations (describe below)</label>
        <label class="radio-option"><input type="radio" name="distType"> Other / Custom (describe below)</label>
      </div>
    </div></div>
    <div class="form-row"><div class="form-group"><label>Describe Distribution Plan</label><textarea rows="5" placeholder="e.g., 40% to daughter Jane, 40% to son Michael, 20% to First Community Church..."></textarea></div></div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Specific Bequests &amp; Charitable Gifts</div>
    <div id="bequestList"></div>
    <button class="add-btn" onclick="intakeAddBequest()">+ Add Specific Bequest or Charitable Gift</button>
  </div>
  <div class="subsection">
    <div class="subsection-title">Residuary / Ultimate Disposition</div>
    <div class="form-row cols-2">
      <div class="form-group"><label>If All Named Beneficiaries Predecease — Assets Go To</label><input type="text" placeholder="e.g., American Red Cross; or heirs at law"></div>
      <div class="form-group"><label>Alternate / Contingent Beneficiary</label><input type="text" placeholder="Name or organization"></div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Personal Property &amp; Tangible Assets</div>
    <div class="form-row"><div class="form-group"><label>Distribution of Tangible Personal Property</label><select><option>Per a written personal property memorandum prepared separately</option><option>Trustee distributes equitably among children</option><option>Specific bequests listed above</option><option>All to surviving spouse; then equally to children</option></select></div></div>
    <div class="form-row"><div class="form-group"><label>Notes on Personal Property</label><textarea placeholder="Describe any specific items and intended recipients"></textarea></div></div>
  </div>
</div>

<!-- SECTION 5 -->
<div class="section" id="section-4">
  <div class="section-header">
    <div class="section-number">Section 05</div>
    <div class="section-title">Fiduciaries</div>
    <div class="section-desc">Identify the individuals who will serve as Trustee, Executor, and Guardian.</div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Trustee</div>
    <div class="notice" style="margin-top:0;">While you are living and competent, you will serve as your own Trustee. The following individuals succeed you upon incapacity or death.</div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Successor Trustee — Primary <span class="req">*</span></label><input type="text" id="trustee1" placeholder="Full legal name"></div>
      <div class="form-group"><label>Relationship to You</label><input type="text" placeholder="e.g., Daughter, Son, Spouse, Friend"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>City, State</label><input type="text" placeholder="City, State"></div>
      <div class="form-group"><label>Phone / Email</label><input type="text" placeholder="Contact info"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Alternate Successor Trustee (1st)</label><input type="text" placeholder="Full legal name"></div>
      <div class="form-group"><label>Relationship</label><input type="text" placeholder="Relationship"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Alternate Successor Trustee (2nd)</label><input type="text" placeholder="Full legal name"></div>
      <div class="form-group"><label>Relationship</label><input type="text" placeholder="Relationship"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Co-Trustees?</label><select><option>No — single trustee at all times</option><option>Yes — co-trustees must act unanimously</option><option>Yes — co-trustees may act independently</option></select></div>
      <div class="form-group"><label>Trustee Compensation</label><select><option>No compensation (family member)</option><option>Reasonable compensation per Virginia law</option><option>Specified amount (describe in notes)</option></select></div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Personal Representative (Executor) — Pour-Over Will</div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Personal Representative — Primary</label><input type="text" placeholder="Full legal name (may be same as Trustee)"></div>
      <div class="form-group"><label>Relationship</label><input type="text" placeholder="Relationship"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Personal Representative — Alternate</label><input type="text" placeholder="Full legal name"></div>
      <div class="form-group"><label>Relationship</label><input type="text" placeholder="Relationship"></div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Guardian (Minor Children)</div>
    <div class="toggle-group"><label class="toggle"><input type="checkbox" id="needsGuardian" onchange="intakeToggleGuardian()"><div class="toggle-track"></div><div class="toggle-thumb"></div></label><span class="toggle-label">Nominate a Guardian for minor children</span></div>
    <div id="guardianFields" class="hidden">
      <div class="form-row cols-2" style="margin-top:12px;">
        <div class="form-group"><label>Guardian — Primary</label><input type="text" placeholder="Full legal name"></div>
        <div class="form-group"><label>Relationship</label><input type="text" placeholder="Relationship"></div>
      </div>
      <div class="form-row cols-2">
        <div class="form-group"><label>Guardian — Alternate</label><input type="text" placeholder="Full legal name"></div>
        <div class="form-group"><label>Relationship</label><input type="text" placeholder="Relationship"></div>
      </div>
    </div>
  </div>
</div>

<!-- SECTION 6 -->
<div class="section" id="section-5">
  <div class="section-header">
    <div class="section-number">Section 06</div>
    <div class="section-title">Powers of Attorney &amp; Advance Medical Directive</div>
    <div class="section-desc">These documents authorize individuals to act on your behalf during your lifetime if you become incapacitated.</div>
  </div>
  <div class="notice"><strong>Virginia:</strong> Durable General Power of Attorney (Va. Code § 64.2-1600 et seq.); Health Care Decisions Act (Va. Code § 54.1-2981 et seq.). <strong>Maryland</strong> documents are governed by separate statutes.</div>
  <div class="subsection">
    <div class="subsection-title">Durable General Power of Attorney (Financial)</div>
    <div class="form-row cols-2">
      <div class="form-group"><label>State(s) Needed</label><div class="check-group"><label class="check-option"><input type="checkbox" checked> Virginia</label><label class="check-option"><input type="checkbox"> Maryland</label><label class="check-option"><input type="checkbox"> Other</label></div></div>
      <div class="form-group"><label>Effective Date</label><select><option>Immediately upon execution (recommended in VA)</option><option>Springing — effective upon incapacity only</option></select></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Agent (Attorney-in-Fact) — Primary <span class="req">*</span></label><input type="text" id="poa1" placeholder="Full legal name"></div>
      <div class="form-group"><label>Relationship</label><input type="text" placeholder="Relationship"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Alternate Agent (1st)</label><input type="text" placeholder="Full legal name"></div>
      <div class="form-group"><label>Relationship</label><input type="text" placeholder="Relationship"></div>
    </div>
    <div class="form-row"><div class="form-group"><label>Notes on POA Powers or Limitations</label><textarea placeholder="e.g., agent may make gifts up to annual exclusion amount..."></textarea></div></div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Health Care Power of Attorney &amp; Advance Medical Directive</div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Health Care Agent — Primary <span class="req">*</span></label><input type="text" id="hca1" placeholder="Full legal name"></div>
      <div class="form-group"><label>Relationship</label><input type="text" placeholder="Relationship"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Alternate Health Care Agent</label><input type="text" placeholder="Full legal name"></div>
      <div class="form-group"><label>Relationship</label><input type="text" placeholder="Relationship"></div>
    </div>
    <hr class="divider">
    <div style="font-family:'Cormorant Garamond',serif;font-size:15px;color:var(--navy);margin-bottom:12px;">Life-Sustaining Treatment Preferences</div>
    <div class="form-row"><div class="form-group"><label>Terminal Condition</label>
      <div class="radio-group" style="flex-direction:column;gap:8px;margin-top:8px;">
        <label class="radio-option"><input type="radio" name="terminal"> Withhold or withdraw life-sustaining treatment and allow natural death</label>
        <label class="radio-option"><input type="radio" name="terminal"> Continue all life-sustaining treatment</label>
        <label class="radio-option"><input type="radio" name="terminal"> Leave decision to my Health Care Agent</label>
      </div>
    </div></div>
    <div class="form-row"><div class="form-group"><label>Persistent Vegetative State</label>
      <div class="radio-group" style="flex-direction:column;gap:8px;margin-top:8px;">
        <label class="radio-option"><input type="radio" name="pvs"> Withhold or withdraw life-sustaining treatment and allow natural death</label>
        <label class="radio-option"><input type="radio" name="pvs"> Continue all life-sustaining treatment</label>
        <label class="radio-option"><input type="radio" name="pvs"> Leave decision to my Health Care Agent</label>
      </div>
    </div></div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Organ &amp; Tissue Donation</label><select><option>No donation</option><option>Yes — any organs and tissue</option><option>Yes — specific organs only (describe in notes)</option><option>As determined by my Health Care Agent</option></select></div>
      <div class="form-group"><label>Funeral / Burial Preferences</label><select><option>No preference — as determined by family</option><option>Burial</option><option>Cremation</option><option>Pre-arranged (describe in notes)</option></select></div>
    </div>
    <div class="form-row"><div class="form-group"><label>Additional Medical Directive Instructions</label><textarea rows="3" placeholder="Religious beliefs affecting medical care, specific instructions, etc."></textarea></div></div>
  </div>
  <div class="subsection">
    <div class="subsection-title">HIPAA Authorization</div>
    <div id="hipaaList">
      <div class="form-row cols-2" style="margin-bottom:8px;">
        <div class="form-group"><label>Authorized Individual</label><input type="text" placeholder="Full legal name (typically same as Health Care Agent)"></div>
        <div class="form-group"><label>Relationship</label><input type="text" placeholder="Relationship"></div>
      </div>
    </div>
    <button class="add-btn" onclick="intakeAddHipaa()">+ Add HIPAA Authorized Individual</button>
  </div>
</div>

<!-- SECTION 7: REVIEW -->
<div class="section" id="section-6">
  <div class="section-header">
    <div class="section-number">Section 07</div>
    <div class="section-title">Review &amp; Submit</div>
    <div class="section-desc">Review your information before submitting. Use the Back button to correct any section.</div>
  </div>
  <div class="review-block">
    <div class="review-block-header">Primary Client</div>
    <div class="review-grid">
      <div class="review-field"><div class="review-field-label">Full Name</div><div class="review-field-value" id="rv-name">—</div></div>
      <div class="review-field"><div class="review-field-label">Date of Birth</div><div class="review-field-value" id="rv-dob">—</div></div>
      <div class="review-field"><div class="review-field-label">Email</div><div class="review-field-value" id="rv-email">—</div></div>
      <div class="review-field"><div class="review-field-label">Phone</div><div class="review-field-value" id="rv-phone">—</div></div>
      <div class="review-field"><div class="review-field-label">Address</div><div class="review-field-value" id="rv-addr">—</div></div>
      <div class="review-field"><div class="review-field-label">Marital Status</div><div class="review-field-value" id="rv-marital">—</div></div>
    </div>
  </div>
  <div class="review-block">
    <div class="review-block-header">Key Fiduciaries</div>
    <div class="review-grid">
      <div class="review-field"><div class="review-field-label">Successor Trustee</div><div class="review-field-value" id="rv-trustee">—</div></div>
      <div class="review-field"><div class="review-field-label">Financial POA Agent</div><div class="review-field-value" id="rv-poa">—</div></div>
      <div class="review-field"><div class="review-field-label">Health Care Agent</div><div class="review-field-value" id="rv-hca">—</div></div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Notes for the Attorney</div>
    <div class="form-row"><div class="form-group"><label>Anything else we should know before your consultation?</label><textarea id="attorney-notes" rows="5" placeholder="Questions, concerns, specific requests, documents to review, circumstances not addressed above..."></textarea></div></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Preferred Consultation Method</label><div class="radio-group"><label class="radio-option"><input type="radio" name="consult"> In-person</label><label class="radio-option"><input type="radio" name="consult"> Video call</label><label class="radio-option"><input type="radio" name="consult"> Phone</label></div></div>
    <div class="form-group"><label>Preferred Days / Times</label><input type="text" id="preferred-times" placeholder="e.g., weekday mornings, Tues/Thurs afternoons"></div>
  </div>
  <div class="notice" style="margin-top:16px;"><strong>Acknowledgment:</strong> By submitting this intake form, you confirm that the information provided is accurate to the best of your knowledge. This form does not create an attorney-client relationship. Our office will contact you to schedule a consultation and discuss engagement terms.</div>
  <div id="submit-error-msg" class="submit-error hidden"></div>
</div>

<!-- NAV -->
<div class="nav-bar" id="navBar">
  <button class="btn btn-ghost" id="prevBtn" onclick="intakeNavigate(-1)">&#8592; Back</button>
  <span style="font-size:11px;color:var(--mid-gray);letter-spacing:.1em;" id="pageIndicator">Page 1 of 7</span>
  <button class="btn btn-primary" id="nextBtn" onclick="intakeNavigate(1)">Continue &#8594;</button>
</div>

<!-- SUCCESS -->
<div id="successScreen" class="success-screen hidden">
  <div class="success-icon">&#10003;</div>
  <div class="success-title">Intake Form Submitted</div>
  <div class="success-sub">Thank you for completing the intake form. A copy has been saved for your records.</div>
  <div id="downloadConfirmation" style="display:none;margin:24px 0;padding:16px;background:#f0f9ff;border:1px solid #bfdbfe;border-radius:2px;">
    <div style="font-size:13px;color:#1e40af;margin-bottom:8px;">✓ Your intake form has been downloaded</div>
    <div style="font-size:12px;color:#3b82f6;">A formatted copy is ready for your records. Our office will also review your information and contact you within one business day.</div>
  </div>
  <div style="margin:28px 0;">
    <div style="font-size:12px;color:var(--mid-gray);margin-bottom:16px;">Next step: Schedule your free consultation</div>
    <a href="https://calendly.com/kelly-thesatterwhitelawfirm/30min" target="_blank" class="btn btn-primary" style="display:inline-block;text-decoration:none;margin-right:12px;">📅 Book Consultation</a>
    <a href="tel:+17038557380" class="btn btn-secondary" style="display:inline-block;text-decoration:none;">📞 Call Us</a>
  </div>
  <div style="margin-top:28px;border-top:1px solid var(--border);padding-top:20px;">
    <div style="font-size:12px;color:var(--mid-gray);margin-bottom:12px;">Or save a copy for your records:</div>
    <button class="btn btn-secondary" onclick="window.print()">🖨️ Print / Save PDF</button>
  </div>
  <div style="font-size:12px;color:var(--mid-gray);margin-top:28px;">The Satterwhite Law Firm, PLLC &nbsp;|&nbsp; 1605 Fort Hunt Ct &nbsp;|&nbsp; Alexandria, VA 22307</div>
</div>

</div>
</div>
`;

export default function IntakeForm() {
  useEffect(() => {
    document.title = "Trust & Estate Planning Intake Form | The Satterwhite Law Firm, PLLC";
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link") as HTMLLinkElement;
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", "https://www.satterwhitelawfirmpllc.com/intake");
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content",
        "Complete the trust and estate planning intake form for The Satterwhite Law Firm, PLLC. Serving clients in Virginia and Maryland."
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const submitMutation = trpc.intake.submit.useMutation();

  useEffect(() => {
    if (!containerRef.current) return;

    // Inject the HTML
    containerRef.current.innerHTML = INTAKE_HTML;

    // Inject the JavaScript logic into the page scope
    const script = document.createElement("script");
    script.textContent = `
      (function() {
        var cur = 0;
        var tot = 7;

        function intakeNavigate(d) {
          if (d === 1 && cur === tot - 1) {
            intakeSubmitForm();
            return;
          }
          var ss = document.querySelectorAll('#intake-wrapper .section');
          var ps = document.querySelectorAll('#intake-wrapper .progress-step');
          ss[cur].classList.remove('active');
          ps[cur].classList.remove('active');
          if (d === 1) ps[cur].classList.add('completed');
          cur += d;
          if (cur < 0) cur = 0;
          if (d === -1) ps[cur].classList.remove('completed');
          ss[cur].classList.add('active');
          ps[cur].classList.add('active');
          document.getElementById('prevBtn').style.visibility = cur === 0 ? 'hidden' : 'visible';
          document.getElementById('nextBtn').textContent = cur === tot - 1 ? 'Submit →' : 'Continue →';
          document.getElementById('pageIndicator').textContent = 'Page ' + (cur + 1) + ' of ' + tot;
          if (cur === tot - 1) intakeUpdateReview();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function intakeUpdateReview() {
          var g = function(id) { var el = document.getElementById(id); return el ? el.value || '—' : '—'; };
          var name = [g('g1-first'), g('g1-mid'), g('g1-last')].filter(function(x) { return x && x !== '—'; }).join(' ') || '—';
          document.getElementById('rv-name').textContent = name;
          document.getElementById('rv-dob').textContent = g('g1-dob');
          document.getElementById('rv-email').textContent = g('g1-email');
          document.getElementById('rv-phone').textContent = g('g1-phone');
          var addr = [g('g1-addr'), g('g1-city'), g('g1-state'), g('g1-zip')].filter(function(x) { return x && x !== '—'; }).join(', ') || '—';
          document.getElementById('rv-addr').textContent = addr;
          document.getElementById('rv-marital').textContent = g('g1-marital');
          document.getElementById('rv-trustee').textContent = g('trustee1');
          document.getElementById('rv-poa').textContent = g('poa1');
          document.getElementById('rv-hca').textContent = g('hca1');
        }

        function intakeCollectData() {
          // Collect ALL form data from all sections
          var formData = {};
          var inputs = document.querySelectorAll('#intake-wrapper input, #intake-wrapper select, #intake-wrapper textarea');
          inputs.forEach(function(el) {
            if (el.id) {
              if (el.type === 'checkbox') {
                formData[el.id] = el.checked;
              } else if (el.type === 'radio') {
                if (el.checked) formData[el.name] = el.value || el.textContent;
              } else {
                formData[el.id] = el.value || '';
              }
            }
          });
          // Also capture subsection data (dynamically added children, assets, etc.)
          var subsections = document.querySelectorAll('#intake-wrapper .subsection');
          var subsectionData = [];
          subsections.forEach(function(sub) {
            var title = sub.querySelector('.subsection-title');
            var fields = {};
            var inputs = sub.querySelectorAll('input, select, textarea');
            inputs.forEach(function(el) {
              if (el.id) fields[el.id] = el.value || '';
              else if (el.name) fields[el.name] = el.value || '';
            });
            if (Object.keys(fields).length > 0) {
              subsectionData.push({
                title: title ? title.textContent : 'Section',
                fields: fields
              });
            }
          });
          formData.subsections = subsectionData;
          return formData;
        }

        function intakeSubmitForm() {
          var btn = document.getElementById('nextBtn');
          var errEl = document.getElementById('submit-error-msg');
          btn.disabled = true;
          btn.textContent = 'Submitting…';
          if (errEl) errEl.classList.add('hidden');

          var data = intakeCollectData();
          // Get client name for the PDF filename
          var getVal = function(id) { var el = document.getElementById(id); return el ? el.value : ''; };
          var clientName = [getVal('g1-first'), getVal('g1-mid'), getVal('g1-last')].filter(Boolean).join(' ') || 'Client';
          data.clientName = clientName;
          data.clientEmail = getVal('g1-email');
          data.clientPhone = getVal('g1-phone');
          data.submittedAt = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' });

          // Dispatch custom event so React can intercept
          var event = new CustomEvent('intakeFormSubmit', { detail: data, bubbles: true });
          document.dispatchEvent(event);
        }

        function intakeToggleSpouse() {
          var el = document.getElementById('spouseSection');
          var cb = document.getElementById('hasSpouse');
          if (el && cb) el.classList.toggle('hidden', !cb.checked);
        }
        function intakeToggleMinors() {
          var el = document.getElementById('minorSection');
          var cb = document.getElementById('hasMinors');
          if (el && cb) el.classList.toggle('hidden', !cb.checked);
        }
        function intakeToggleGuardian() {
          var el = document.getElementById('guardianFields');
          var cb = document.getElementById('needsGuardian');
          if (el && cb) el.classList.toggle('hidden', !cb.checked);
        }
        function intakeToggleCollapse(t) {
          t.classList.toggle('open');
          t.nextElementSibling.classList.toggle('open');
        }

        function mkSubsection(title, content) {
          var d = document.createElement('div');
          d.className = 'subsection';
          d.style.marginBottom = '12px';
          d.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div class="subsection-title" style="font-size:14px;margin-bottom:0;">' + title + '</div><button onclick="this.closest(\\'.subsection\\').remove()" style="background:none;border:none;color:var(--mid-gray);cursor:pointer;font-size:20px;line-height:1;">&times;</button></div>' + content;
          return d;
        }

        var cc = 0;
        function intakeAddChild() {
          cc++;
          document.getElementById('childrenList').appendChild(mkSubsection('Child ' + cc, '<div class="form-row cols-3"><div class="form-group"><label>First Name</label><input type="text" placeholder="First"></div><div class="form-group"><label>Middle</label><input type="text" placeholder="Middle"></div><div class="form-group"><label>Last Name</label><input type="text" placeholder="Last"></div></div><div class="form-row cols-3"><div class="form-group"><label>Date of Birth</label><input type="date"></div><div class="form-group"><label>Relationship</label><select><option>Biological child</option><option>Adopted child</option><option>Stepchild</option></select></div><div class="form-group"><label>Currently a Minor?</label><select><option>No</option><option>Yes</option></select></div></div>'));
        }
        var obc = 0;
        function intakeAddOtherBen() {
          obc++;
          document.getElementById('otherBenList').appendChild(mkSubsection('Beneficiary ' + obc, '<div class="form-row cols-3"><div class="form-group"><label>Name / Organization</label><input type="text" placeholder="Full name or org"></div><div class="form-group"><label>Type</label><select><option>Individual</option><option>Charitable Organization</option><option>Trust</option><option>Estate</option></select></div><div class="form-group"><label>Relationship</label><input type="text" placeholder="e.g., Sibling, Charity"></div></div>'));
        }
        var pc = 0;
        function intakeAddRealProperty() {
          pc++;
          document.getElementById('realPropertyList').appendChild(mkSubsection('Property ' + pc, '<div class="form-row"><div class="form-group"><label>Property Address</label><input type="text" placeholder="Full address"></div></div><div class="form-row cols-3"><div class="form-group"><label>Type</label><select><option>Primary Residence</option><option>Secondary Residence</option><option>Investment Property</option><option>Vacant Land</option><option>Commercial</option></select></div><div class="form-group"><label>Approx. Value</label><input type="text" placeholder="$"></div><div class="form-group"><label>Mortgage Balance</label><input type="text" placeholder="$0 if none"></div></div>'));
        }
        function intakeAddFinancial() { document.getElementById('financialList').appendChild(mkSubsection('Account', '<div class="form-row cols-3"><div class="form-group"><label>Institution</label><input type="text" placeholder="Bank or brokerage name"></div><div class="form-group"><label>Account Type</label><select><option>Checking</option><option>Savings</option><option>Brokerage</option><option>Investment</option><option>Money Market</option><option>CD</option><option>Other</option></select></div><div class="form-group"><label>Approx. Balance</label><input type="text" placeholder="$"></div></div>')); }
        function intakeAddRetirement() { document.getElementById('retirementList').appendChild(mkSubsection('Retirement Account', '<div class="form-row cols-3"><div class="form-group"><label>Institution</label><input type="text" placeholder="e.g., Fidelity, Vanguard"></div><div class="form-group"><label>Account Type</label><select><option>Traditional IRA</option><option>Roth IRA</option><option>401(k)</option><option>403(b)</option><option>457</option><option>Pension</option><option>SEP-IRA</option><option>Other</option></select></div><div class="form-group"><label>Approx. Balance</label><input type="text" placeholder="$"></div></div>')); }
        function intakeAddInsurance() { document.getElementById('insuranceList').appendChild(mkSubsection('Insurance Policy', '<div class="form-row cols-3"><div class="form-group"><label>Insurer</label><input type="text" placeholder="Insurance company"></div><div class="form-group"><label>Policy Type</label><select><option>Term Life</option><option>Whole Life</option><option>Universal Life</option><option>Variable Life</option><option>Group / Employer</option></select></div><div class="form-group"><label>Death Benefit</label><input type="text" placeholder="$"></div></div>')); }
        function intakeAddBusiness() { document.getElementById('businessList').appendChild(mkSubsection('Business Interest', '<div class="form-row cols-3"><div class="form-group"><label>Business Name</label><input type="text" placeholder="Entity name"></div><div class="form-group"><label>Entity Type</label><select><option>LLC</option><option>S-Corp</option><option>C-Corp</option><option>Partnership</option><option>Sole Proprietorship</option><option>Other</option></select></div><div class="form-group"><label>Your Ownership %</label><input type="text" placeholder="e.g., 50%"></div></div>')); }
        function intakeAddOtherAsset() { document.getElementById('otherAssetList').appendChild(mkSubsection('Asset', '<div class="form-row cols-3"><div class="form-group"><label>Description</label><input type="text" placeholder="e.g., 2022 Mercedes, Bitcoin holdings"></div><div class="form-group"><label>Type</label><select><option>Vehicle</option><option>Watercraft / RV</option><option>Jewelry / Art</option><option>Cryptocurrency</option><option>Notes Receivable</option><option>Intellectual Property</option><option>Other</option></select></div><div class="form-group"><label>Approx. Value</label><input type="text" placeholder="$"></div></div>')); }
        var bc = 0;
        function intakeAddBequest() {
          bc++;
          var d = document.createElement('div');
          d.className = 'form-row cols-3';
          d.style.marginBottom = '10px';
          d.innerHTML = '<div class="form-group"><label>Item / Amount</label><input type="text" placeholder="e.g., $10,000 cash; grandmother\\'s ring"></div><div class="form-group"><label>To (Beneficiary)</label><input type="text" placeholder="Name or organization"></div><div class="form-group"><label>Condition (if any)</label><input type="text" placeholder="e.g., if they survive me by 30 days"></div>';
          document.getElementById('bequestList').appendChild(d);
        }
        var hc = 1;
        function intakeAddHipaa() {
          hc++;
          var d = document.createElement('div');
          d.className = 'form-row cols-2';
          d.style.marginBottom = '8px';
          d.innerHTML = '<div class="form-group"><label>Authorized Individual ' + hc + '</label><input type="text" placeholder="Full legal name"></div><div class="form-group"><label>Relationship</label><input type="text" placeholder="Relationship"></div>';
          document.getElementById('hipaaList').appendChild(d);
        }

        // Expose functions globally
        window.intakeNavigate = intakeNavigate;
        window.intakeToggleSpouse = intakeToggleSpouse;
        window.intakeToggleMinors = intakeToggleMinors;
        window.intakeToggleGuardian = intakeToggleGuardian;
        window.intakeToggleCollapse = intakeToggleCollapse;
        window.intakeAddChild = intakeAddChild;
        window.intakeAddOtherBen = intakeAddOtherBen;
        window.intakeAddRealProperty = intakeAddRealProperty;
        window.intakeAddFinancial = intakeAddFinancial;
        window.intakeAddRetirement = intakeAddRetirement;
        window.intakeAddInsurance = intakeAddInsurance;
        window.intakeAddBusiness = intakeAddBusiness;
        window.intakeAddOtherAsset = intakeAddOtherAsset;
        window.intakeAddBequest = intakeAddBequest;
        window.intakeAddHipaa = intakeAddHipaa;

        // Init
        document.getElementById('prevBtn').style.visibility = 'hidden';
        intakeAddChild();
        intakeAddRealProperty();
      })();
    `;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Listen for the custom submit event from the injected JS
  useEffect(() => {
    const handleSubmit = async (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const btn = document.getElementById("nextBtn") as HTMLButtonElement | null;
      const errEl = document.getElementById("submit-error-msg");

      try {
        const result = await submitMutation.mutateAsync({
          clientName: detail.clientName || "Unknown",
          clientEmail: detail.clientEmail || "",
          clientPhone: detail.clientPhone || "",
          submittedAt: detail.submittedAt || new Date().toISOString(),
          formDataJson: JSON.stringify(detail),
        });

        // Use the server-generated PDF URL if available
        const pdfUrl: string | null = result?.pdfUrl || null;

        // Show success screen
        const progressBar = document.getElementById("progressBar");
        const activeSection = document.querySelector("#intake-wrapper .section.active") as HTMLElement | null;
        const navBar = document.getElementById("navBar");
        const successScreen = document.getElementById("successScreen");
        if (progressBar) progressBar.style.display = "none";
        if (activeSection) activeSection.style.display = "none";
        if (navBar) navBar.style.display = "none";
        if (successScreen) {
          successScreen.classList.remove("hidden");
          // Add PDF download button if we have a URL from the server
          if (pdfUrl) {
            const downloadBtn = document.createElement('a');
            downloadBtn.href = pdfUrl;
            downloadBtn.target = '_blank';
            downloadBtn.rel = 'noopener noreferrer';
            downloadBtn.download = `Trust_Intake_${(detail.clientName || 'Form').replace(/\s+/g, '_')}.pdf`;
            downloadBtn.className = 'btn btn-primary';
            downloadBtn.style.display = 'inline-block';
            downloadBtn.style.marginTop = '20px';
            downloadBtn.style.marginRight = '12px';
            downloadBtn.style.textDecoration = 'none';
            downloadBtn.textContent = '📥 Download Your Intake Form (PDF)';
            const successContent = successScreen.querySelector('.success-sub');
            if (successContent && successContent.parentNode) {
              successContent.parentNode.insertBefore(downloadBtn, successContent.nextSibling);
            }
          }
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Submit →";
        }
        if (errEl) {
          errEl.textContent = "There was an error submitting your form. Please try again or call us at (703) 855-7380.";
          errEl.classList.remove("hidden");
        }
      }
    };

    document.addEventListener("intakeFormSubmit", handleSubmit);
    return () => document.removeEventListener("intakeFormSubmit", handleSubmit);
  }, [submitMutation]);

  return (
    <div
      ref={containerRef}
      style={{ minHeight: "100vh", background: "#faf8f4" }}
    />
  );
}
