import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function LLCIntakeForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = trpc.llcIntake.submit.useMutation({
    onSuccess: () => {
      setSubmitting(false);
      setSubmitted(true);
    },
    onError: (err) => {
      setSubmitting(false);
      setError(err.message || "Submission failed. Please call us at (703) 855-7380.");
    },
  });

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Inject the form's JavaScript logic after the component mounts
    const script = document.createElement("script");
    script.id = "llc-form-script";
    script.textContent = `
      // LLC Intake Form JS
      window.__llcFormCur = 0;
      const llcTot = 7;

      window.llcNavigate = function(d) {
        if (d === 1 && window.__llcFormCur === llcTot - 1) {
          window.llcSubmitForm();
          return;
        }
        const ss = document.querySelectorAll('#llc-form-container .section');
        const ps = document.querySelectorAll('#llc-form-container .progress-step');
        ss[window.__llcFormCur].classList.remove('active');
        ps[window.__llcFormCur].classList.remove('active');
        if (d === 1) ps[window.__llcFormCur].classList.add('completed');
        window.__llcFormCur += d;
        if (window.__llcFormCur < 0) window.__llcFormCur = 0;
        if (d === -1) ps[window.__llcFormCur].classList.remove('completed');
        ss[window.__llcFormCur].classList.add('active');
        ps[window.__llcFormCur].classList.add('active');
        document.getElementById('llc-prevBtn').style.visibility = window.__llcFormCur === 0 ? 'hidden' : 'visible';
        document.getElementById('llc-nextBtn').textContent = window.__llcFormCur === llcTot - 1 ? 'Submit →' : 'Continue →';
        document.getElementById('llc-pageIndicator').textContent = 'Page ' + (window.__llcFormCur + 1) + ' of ' + llcTot;
        if (window.__llcFormCur === llcTot - 1) window.llcUpdateReview();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      window.llcUpdateReview = function() {
        const g = id => (document.getElementById(id) || {}).value || '—';
        const rv = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        rv('rv-client', [g('cl-first'), g('cl-last')].filter(x => x && x !== '—').join(' ') || '—');
        rv('rv-email', g('cl-email'));
        rv('rv-phone', g('cl-phone'));
        rv('rv-llcname', g('llc-name'));
        rv('rv-llctype', g('llc-type'));
        rv('rv-state', g('llc-state'));
        const addr = [g('llc-addr'), g('llc-city'), g('llc-addrstate')].filter(x => x && x !== '—').join(', ') || '—';
        rv('rv-addr', addr);
        rv('rv-members', g('memberCount'));
        rv('rv-manager', g('mgr1-name'));
      };

      window.llcSubmitForm = function() {
        const g = id => (document.getElementById(id) || {}).value || '';
        const formData = {
          clientFirst: g('cl-first'),
          clientLast: g('cl-last'),
          clientEmail: g('cl-email'),
          clientPhone: g('cl-phone'),
          clientAddress: g('cl-addr'),
          llcName: g('llc-name'),
          llcType: g('llc-type'),
          llcState: g('llc-state'),
          llcAddress: [g('llc-addr'), g('llc-city'), g('llc-addrstate')].filter(Boolean).join(', '),
          memberCount: g('memberCount'),
          managerName: g('mgr1-name'),
        };
        if (window.__llcFormSubmitCallback) {
          window.__llcFormSubmitCallback(formData);
        }
      };

      window.llcTogglePLLC = function() {
        const v = document.getElementById('llc-type') ? document.getElementById('llc-type').value : '';
        const el = document.getElementById('pllcSection');
        if (el) el.classList.toggle('hidden', v !== 'PLLC');
      };

      const dbaToggle = document.getElementById('hasDBA');
      if (dbaToggle) {
        dbaToggle.onchange = function() {
          const el = document.getElementById('dbaSection');
          if (el) el.classList.toggle('hidden', !this.checked);
        };
      }

      window.llcToggleRAgent = function() {
        const v = document.getElementById('ragentType') ? document.getElementById('ragentType').value : '';
        const custom = document.getElementById('ragentCustom');
        const addr = document.getElementById('ragent-addr');
        if (custom) custom.classList.toggle('hidden', v === 'firm' || v === 'member');
        if (addr) {
          if (v === 'firm') addr.value = '1605 Fort Hunt Ct, Alexandria, VA 22307';
          else addr.value = '';
        }
      };

      window.llcToggleTag = function(el) { el.classList.toggle('selected'); };

      window.llcToggleEntityMembers = function() {
        const note = document.getElementById('entityMemberNote');
        const cb = document.getElementById('hasEntityMembers');
        if (note && cb) note.classList.toggle('hidden', !cb.checked);
      };

      window.llcToggleOfficers = function() {
        const sec = document.getElementById('officerSection');
        const cb = document.getElementById('hasOfficers');
        if (sec && cb) sec.classList.toggle('hidden', !cb.checked);
      };

      window.llcToggleBuySell = function() {
        const sec = document.getElementById('buySellSection');
        const cb = document.getElementById('hasBuySell');
        if (sec && cb) sec.classList.toggle('hidden', !cb.checked);
      };

      // Members dynamic
      window.__llcMemberCount = 1;
      window.llcBuildMember = function(n) {
        const div = document.createElement('div');
        div.className = 'member-card';
        div.id = 'member-card-' + n;
        div.innerHTML = '<div class="member-card-header"><div class="member-card-title">Member ' + n + '</div>' +
          (n > 1 ? '<button class="remove-btn" onclick="llcRemoveMember(' + n + ')">&times;</button>' : '') +
          '</div><div class="form-row cols-3"><div class="form-group"><label>Full Legal Name <span class="req">*</span></label><input type="text" id="m' + n + '-name" placeholder="Full legal name"></div>' +
          '<div class="form-group"><label>Member Type</label><select><option>Individual</option><option>Entity (LLC, Corp, Trust)</option></select></div>' +
          '<div class="form-group"><label>Title / Role</label><input type="text" placeholder="e.g., Managing Member, Member"></div></div>' +
          '<div class="form-row cols-2"><div class="form-group"><label>Address</label><input type="text" placeholder="Street, City, State ZIP"></div>' +
          '<div class="form-group"><label>Email / Phone</label><input type="text" placeholder="Contact info"></div></div>' +
          '<div class="form-row cols-3"><div class="form-group"><label>Ownership % <span class="req">*</span></label><input type="number" class="pct-input" id="m' + n + '-pct" min="0" max="100" placeholder="e.g., 50" oninput="llcCalcPct()"></div>' +
          '<div class="form-group"><label>Capital Contribution ($)</label><input type="text" placeholder="$"></div>' +
          '<div class="form-group"><label>SSN / EIN (last 4 only)</label><input type="text" placeholder="XXXX" maxlength="4"></div></div>' +
          '<div class="form-row cols-2"><div class="form-group"><label>Date of Birth (Individual)</label><input type="date"></div>' +
          '<div class="form-group"><label>U.S. Citizen / Resident?</label><select><option>Yes — U.S. Citizen</option><option>Yes — Permanent Resident</option><option>No — Foreign Person (FIRPTA may apply)</option></select></div></div>';
        return div;
      };

      window.llcUpdateMemberCount = function() {
        const n = parseInt((document.getElementById('memberCount') || {}).value) || 1;
        const list = document.getElementById('membersList');
        if (!list) return;
        while (list.children.length < n) {
          window.__llcMemberCount++;
          list.appendChild(window.llcBuildMember(window.__llcMemberCount));
        }
        while (list.children.length > n) {
          list.removeChild(list.lastChild);
        }
      };

      window.llcRemoveMember = function(n) {
        const el = document.getElementById('member-card-' + n);
        if (el) el.remove();
        window.llcCalcPct();
      };

      window.llcCalcPct = function() {
        const inputs = document.querySelectorAll('#llc-form-container .pct-input');
        let total = 0;
        inputs.forEach(i => { total += parseFloat(i.value) || 0; });
        const el = document.getElementById('pctTotal');
        if (el) {
          el.textContent = 'Total: ' + total.toFixed(1) + '%' + (total === 100 ? ' ✓' : total > 100 ? ' — over 100%' : '');
          el.className = 'pct-total' + (total > 100 ? ' over' : total === 100 ? ' perfect' : '');
        }
      };

      // Initialize first member
      const membersList = document.getElementById('membersList');
      if (membersList && membersList.children.length === 0) {
        membersList.appendChild(window.llcBuildMember(1));
      }
    `;
    document.body.appendChild(script);

    // Set the submit callback
    (window as any).__llcFormSubmitCallback = (formData: Record<string, string>) => {
      setSubmitting(true);
      setError(null);
      submitMutation.mutate({
        clientFirst: formData.clientFirst ?? '',
        clientLast: formData.clientLast ?? '',
        clientEmail: formData.clientEmail ?? '',
        clientPhone: formData.clientPhone ?? '',
        clientAddress: formData.clientAddress ?? '',
        llcName: formData.llcName ?? '',
        llcType: formData.llcType ?? '',
        llcState: formData.llcState ?? '',
        llcAddress: formData.llcAddress ?? '',
        memberCount: formData.memberCount ?? '',
        managerName: formData.managerName ?? '',
      });
    };

    return () => {
      const s = document.getElementById("llc-form-script");
      if (s) s.remove();
      delete (window as any).__llcFormSubmitCallback;
      delete (window as any).llcNavigate;
      delete (window as any).llcSubmitForm;
      delete (window as any).__llcFormCur;
    };
  }, []);

  if (submitted) {
    return (
      <div style={{ fontFamily: "'Jost', sans-serif", background: "#faf8f4", minHeight: "100vh" }}>
        {/* Nav back link */}
        <div style={{ background: "#1a2744", padding: "12px 24px" }}>
          <Link href="/" style={{ color: "#b8913f", textDecoration: "none", fontSize: "12px", letterSpacing: ".12em", textTransform: "uppercase" }}>
            ← Back to Satterwhite Law Firm
          </Link>
        </div>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, background: "#1a2744", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 28, marginBottom: 24 }}>✓</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#1a2744", marginBottom: 12 }}>LLC Intake Form Submitted</div>
          <div style={{ fontSize: 14, color: "#8a8680", maxWidth: 480, margin: "0 auto 32px" }}>
            Thank you. Our office will review your submission and contact you within one business day to schedule your consultation and confirm engagement terms.
          </div>
          <div style={{ fontSize: 12, color: "#8a8680", marginBottom: 32 }}>
            The Satterwhite Law Firm, PLLC &nbsp;|&nbsp; 1605 Fort Hunt Ct &nbsp;|&nbsp; Alexandria, VA 22307
          </div>
          <Link href="/" style={{ display: "inline-block", padding: "12px 32px", background: "transparent", color: "#1a2744", border: "1px solid #1a2744", fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: ".15em", textTransform: "uppercase", textDecoration: "none", borderRadius: 2 }}>
            Return to Website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Jost', sans-serif", background: "#faf8f4", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* Nav back link */}
      <div style={{ background: "#1a2744", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ color: "#b8913f", textDecoration: "none", fontSize: "12px", letterSpacing: ".12em", textTransform: "uppercase" }}>
          ← Back to Satterwhite Law Firm
        </Link>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", letterSpacing: ".1em" }}>CONFIDENTIAL — ATTORNEY-CLIENT PRIVILEGE</span>
      </div>

      {/* Submitting overlay */}
      {submitting && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,39,68,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
          <div style={{ width: 48, height: 48, border: "3px solid rgba(184,145,63,0.3)", borderTopColor: "#b8913f", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ color: "white", fontSize: 14, letterSpacing: ".1em" }}>Submitting your intake form…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{ background: "#fdf0f0", borderBottom: "1px solid #e8a0a0", padding: "12px 24px", textAlign: "center", color: "#c0392b", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div id="llc-form-container" ref={containerRef} dangerouslySetInnerHTML={{ __html: LLC_FORM_HTML }} />
    </div>
  );
}

const LLC_FORM_HTML = `
<style>
:root{--navy:#1a2744;--gold:#b8913f;--cream:#faf8f4;--warm-gray:#f0ede8;--mid-gray:#8a8680;--dark:#1e1c19;--border:#ddd9d2;--green:#2d6a4f;--green-light:#e8f4ee;}
*{box-sizing:border-box;}
#llc-form-container{font-family:'Jost',sans-serif;background:var(--cream);color:var(--dark);font-size:14px;font-weight:300;line-height:1.7;}
.page-wrapper{max-width:880px;margin:0 auto;padding:40px 20px 80px;}
.firm-header{text-align:center;padding-bottom:32px;border-bottom:1px solid var(--gold);margin-bottom:40px;}
.firm-name{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:500;color:var(--navy);letter-spacing:.04em;margin-bottom:4px;}
.firm-sub{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:8px;}
.firm-contact{font-size:12px;color:var(--mid-gray);}
.form-title{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:400;font-style:italic;color:var(--navy);margin-top:14px;}
.progress-bar{display:flex;align-items:flex-start;margin-bottom:40px;}
.progress-step{flex:1;text-align:center;position:relative;}
.progress-step::after{content:'';position:absolute;top:14px;left:50%;width:100%;height:1px;background:var(--border);z-index:0;}
.progress-step:last-child::after{display:none;}
.step-dot{width:28px;height:28px;border-radius:50%;background:var(--warm-gray);border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;color:var(--mid-gray);position:relative;z-index:1;transition:all .3s;}
.progress-step.active .step-dot{background:var(--navy);border-color:var(--navy);color:white;}
.progress-step.completed .step-dot{background:var(--gold);border-color:var(--gold);color:white;}
.step-label{display:block;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--mid-gray);margin-top:5px;}
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
input[type="text"],input[type="email"],input[type="tel"],input[type="date"],input[type="number"],select,textarea{background:white;border:1px solid var(--border);border-radius:2px;padding:10px 12px;font-family:'Jost',sans-serif;font-size:14px;font-weight:300;color:var(--dark);transition:border-color .2s;outline:none;width:100%;}
input:focus,select:focus,textarea:focus{border-color:var(--navy);}
textarea{resize:vertical;min-height:80px;}
select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238a8680' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;}
.toggle-group{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
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
.subsection-title{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:500;color:var(--navy);margin-bottom:14px;}
.member-card{background:white;border:1px solid var(--border);border-radius:3px;padding:20px;margin-bottom:12px;position:relative;}
.member-card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border);}
.member-card-title{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:500;color:var(--navy);}
.remove-btn{background:none;border:none;color:var(--mid-gray);cursor:pointer;font-size:20px;line-height:1;padding:0;}
.remove-btn:hover{color:#c0392b;}
.add-btn{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border:1px dashed var(--gold);background:transparent;color:var(--gold);font-family:'Jost',sans-serif;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all .2s;margin-top:8px;}
.add-btn:hover{background:var(--gold);color:white;}
.notice{background:#eef1f7;border:1px solid #c8d0e4;border-radius:2px;padding:14px 18px;font-size:12px;color:var(--navy);margin:14px 0;line-height:1.6;}
.notice.green{background:var(--green-light);border-color:#a8d5b8;color:var(--green);}
.notice.amber{background:#fdf6e3;border-color:#e8d5a3;color:#7d5a00;}
.tag-group{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}
.tag{padding:6px 14px;border:1px solid var(--border);border-radius:20px;font-size:12px;cursor:pointer;background:white;transition:all .2s;font-family:'Jost',sans-serif;color:var(--dark);}
.tag.selected{background:var(--navy);border-color:var(--navy);color:white;}
.nav-bar{display:flex;justify-content:space-between;align-items:center;margin-top:40px;padding-top:24px;border-top:1px solid var(--border);}
.btn{padding:12px 32px;font-family:'Jost',sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all .2s;}
.btn-primary{background:var(--navy);color:white;border:1px solid var(--navy);}
.btn-primary:hover{background:#243460;}
.btn-secondary{background:transparent;color:var(--navy);border:1px solid var(--navy);}
.btn-secondary:hover{background:var(--navy);color:white;}
.btn-ghost{background:transparent;color:var(--mid-gray);border:1px solid transparent;}
.btn-ghost:hover{color:var(--dark);}
.divider{border:none;border-top:1px solid var(--border);margin:20px 0;}
.review-block{background:white;border:1px solid var(--border);border-radius:2px;margin-bottom:12px;overflow:hidden;}
.review-block-header{background:var(--navy);color:white;padding:10px 16px;font-size:11px;letter-spacing:.15em;text-transform:uppercase;}
.review-grid{display:grid;grid-template-columns:1fr 1fr;}
.review-field{padding:10px 16px;border-bottom:1px solid var(--warm-gray);}
.review-field-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--mid-gray);}
.review-field-value{font-size:13px;color:var(--dark);margin-top:2px;}
.hidden{display:none!important;}
.pct-total{font-size:11px;color:var(--mid-gray);margin-top:4px;}
.pct-total.over{color:#c0392b;font-weight:500;}
.pct-total.perfect{color:var(--green);font-weight:500;}
@media(max-width:600px){.form-row.cols-2,.form-row.cols-3,.form-row.cols-4{grid-template-columns:1fr;}.review-grid{grid-template-columns:1fr;}}
</style>

<div class="page-wrapper">
<div class="firm-header">
  <div class="firm-sub">Business Entity Formation Intake</div>
  <div class="firm-name">The Satterwhite Law Firm, PLLC</div>
  <div class="firm-contact">1605 Fort Hunt Ct &nbsp;&bull;&nbsp; Alexandria, VA 22307 &nbsp;&bull;&nbsp; (703) 855-7380 &nbsp;&bull;&nbsp; kelly@thesatterwhitelawfirm.com</div>
  <div class="form-title">Limited Liability Company Formation &nbsp;&bull;&nbsp; Articles of Organization &nbsp;&bull;&nbsp; Operating Agreement</div>
</div>

<div class="progress-bar" id="progressBar">
  <div class="progress-step active"><span class="step-dot">1</span><span class="step-label">Client</span></div>
  <div class="progress-step"><span class="step-dot">2</span><span class="step-label">Entity</span></div>
  <div class="progress-step"><span class="step-dot">3</span><span class="step-label">Members</span></div>
  <div class="progress-step"><span class="step-dot">4</span><span class="step-label">Management</span></div>
  <div class="progress-step"><span class="step-dot">5</span><span class="step-label">Finance</span></div>
  <div class="progress-step"><span class="step-dot">6</span><span class="step-label">Operations</span></div>
  <div class="progress-step"><span class="step-dot">7</span><span class="step-label">Review</span></div>
</div>

<!-- SECTION 1: CLIENT INFO -->
<div class="section active" id="section-0">
  <div class="section-header">
    <div class="section-number">Section 01</div>
    <div class="section-title">Client Information</div>
    <div class="section-desc">Tell us about the individual(s) engaging us for this formation. This is the person(s) we will communicate with, not necessarily the LLC members (though often the same).</div>
  </div>
  <div class="notice">This intake is confidential and protected by attorney-client privilege. It does not create an attorney-client relationship until a formal engagement letter is signed.</div>
  <div class="form-row cols-3">
    <div class="form-group"><label>First Name <span class="req">*</span></label><input type="text" id="cl-first" placeholder="First"></div>
    <div class="form-group"><label>Middle Name</label><input type="text" placeholder="Middle"></div>
    <div class="form-group"><label>Last Name <span class="req">*</span></label><input type="text" id="cl-last" placeholder="Last"></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Email <span class="req">*</span></label><input type="email" id="cl-email" placeholder="email@example.com"></div>
    <div class="form-group"><label>Phone <span class="req">*</span></label><input type="tel" id="cl-phone" placeholder="(555) 555-5555"></div>
  </div>
  <div class="form-row"><div class="form-group"><label>Mailing / Home Address</label><input type="text" id="cl-addr" placeholder="Street Address, City, State ZIP"></div></div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Preferred Contact Method</label><select><option>Email</option><option>Phone</option><option>Text</option></select></div>
    <div class="form-group"><label>How Did You Hear About Us?</label><select><option value="">Select</option><option>Referral — existing client</option><option>Referral — attorney/professional</option><option>Google / web search</option><option>Social media</option><option>Prior client (returning)</option><option>Other</option></select></div>
  </div>
  <div class="form-row"><div class="form-group"><label>Are You Also a Member of the LLC Being Formed?</label>
    <div class="radio-group" style="margin-top:8px;">
      <label class="radio-option"><input type="radio" name="clientIsMember" value="yes" checked> Yes — I am a member</label>
      <label class="radio-option"><input type="radio" name="clientIsMember" value="no"> No — forming on behalf of others</label>
      <label class="radio-option"><input type="radio" name="clientIsMember" value="partial"> Yes — one of several members</label>
    </div>
  </div></div>
  <div class="form-row"><div class="form-group"><label>Notes / Background (optional)</label><textarea placeholder="Any context helpful for our initial review — existing businesses, related entities, prior formation attempts, urgency, etc."></textarea></div></div>
</div>

<!-- SECTION 2: ENTITY BASICS -->
<div class="section" id="section-1">
  <div class="section-header">
    <div class="section-number">Section 02</div>
    <div class="section-title">Entity Basics</div>
    <div class="section-desc">Core information about the LLC itself — what we file with the state.</div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Entity Name &amp; Type</div>
    <div class="form-row"><div class="form-group"><label>Proposed LLC Name <span class="req">*</span></label><input type="text" id="llc-name" placeholder="e.g., Acme Holdings, LLC"></div></div>
    <div class="notice amber">Virginia requires the name to include "Limited Liability Company," "LLC," or "L.L.C." The name must be distinguishable from all existing entities on record with the SCC. We will run a name availability check before filing.</div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Alternate Name #1</label><input type="text" placeholder="Alternate name"></div>
      <div class="form-group"><label>Alternate Name #2</label><input type="text" placeholder="Alternate name"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Entity Type <span class="req">*</span></label>
        <select id="llc-type" onchange="llcTogglePLLC()">
          <option value="LLC">Standard LLC</option>
          <option value="PLLC">Professional LLC (PLLC) — Licensed profession</option>
          <option value="Series">Series LLC</option>
          <option value="Foreign">Foreign LLC (already formed in another state)</option>
        </select>
      </div>
      <div class="form-group"><label>State of Organization <span class="req">*</span></label>
        <select id="llc-state">
          <option value="VA" selected>Virginia</option>
          <option value="MD">Maryland</option>
          <option value="DC">Washington, DC</option>
          <option value="DE">Delaware</option>
          <option value="WY">Wyoming</option>
          <option value="NV">Nevada</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
    <div id="pllcSection" class="hidden">
      <div class="notice amber">A Professional LLC (PLLC) is required for licensed professions in Virginia. All members must hold the required professional license.</div>
      <div class="form-row cols-2">
        <div class="form-group"><label>Licensed Profession</label><input type="text" placeholder="e.g., Medicine, Law, Engineering, Accounting"></div>
        <div class="form-group"><label>Licensing Board / Authority</label><input type="text" placeholder="e.g., Virginia Board of Medicine, Virginia State Bar"></div>
      </div>
    </div>
    <div class="toggle-group" style="margin-top:8px;">
      <label class="toggle"><input type="checkbox" id="hasDBA"><div class="toggle-track"></div><div class="toggle-thumb"></div></label>
      <span class="toggle-label">The LLC will operate under a trade name / DBA (doing business as)</span>
    </div>
    <div id="dbaSection" class="hidden form-row">
      <div class="form-group"><label>Trade Name / DBA</label><input type="text" placeholder="Trade name"></div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Principal Office &amp; Business Address</div>
    <div class="notice" style="margin-top:0;">Virginia requires a physical principal office address — no P.O. boxes. This address will appear on public record.</div>
    <div class="form-row"><div class="form-group"><label>Principal Office Street Address <span class="req">*</span></label><input type="text" id="llc-addr" placeholder="Street Address (no P.O. Box)"></div></div>
    <div class="form-row cols-3">
      <div class="form-group"><label>City</label><input type="text" id="llc-city" placeholder="City"></div>
      <div class="form-group"><label>State</label><select id="llc-addrstate"><option>VA</option><option>MD</option><option>DC</option><option>Other</option></select></div>
      <div class="form-group"><label>ZIP</label><input type="text" placeholder="00000"></div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Registered Agent</div>
    <div class="notice" style="margin-top:0;">Every Virginia LLC must designate a Registered Agent with a physical Virginia address to accept legal process and official notices during business hours.</div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Registered Agent</label>
        <select id="ragentType" onchange="llcToggleRAgent()">
          <option value="firm">The Satterwhite Law Firm, PLLC (our firm)</option>
          <option value="member">A member of the LLC</option>
          <option value="third">Third-party registered agent service</option>
          <option value="other">Other individual</option>
        </select>
      </div>
      <div class="form-group"><label>Registered Agent — Virginia Address</label><input type="text" id="ragent-addr" placeholder="Physical VA address (auto-filled if using our firm)"></div>
    </div>
    <div id="ragentCustom" class="hidden form-row cols-2">
      <div class="form-group"><label>Registered Agent Name</label><input type="text" placeholder="Full legal name or entity name"></div>
      <div class="form-group"><label>Registered Agent Phone / Email</label><input type="text" placeholder="Contact info"></div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Business Purpose</div>
    <div class="form-row">
      <div class="form-group"><label>Primary Business Activity <span class="req">*</span></label>
        <div class="tag-group" id="purposeTags">
          <span class="tag" onclick="llcToggleTag(this)">Real Estate — Rental/Investment</span>
          <span class="tag" onclick="llcToggleTag(this)">Real Estate — Development/Flipping</span>
          <span class="tag" onclick="llcToggleTag(this)">Real Estate — Short-Term Rental (STR)</span>
          <span class="tag" onclick="llcToggleTag(this)">Professional Services</span>
          <span class="tag" onclick="llcToggleTag(this)">Retail / E-Commerce</span>
          <span class="tag" onclick="llcToggleTag(this)">Restaurant / Food &amp; Beverage</span>
          <span class="tag" onclick="llcToggleTag(this)">Technology / Software</span>
          <span class="tag" onclick="llcToggleTag(this)">Construction / Contracting</span>
          <span class="tag" onclick="llcToggleTag(this)">Healthcare / Medical</span>
          <span class="tag" onclick="llcToggleTag(this)">Consulting</span>
          <span class="tag" onclick="llcToggleTag(this)">Transportation / Logistics</span>
          <span class="tag" onclick="llcToggleTag(this)">Holding Company / Asset Protection</span>
          <span class="tag" onclick="llcToggleTag(this)">Other</span>
        </div>
      </div>
    </div>
    <div class="form-row"><div class="form-group"><label>Describe the Business in Detail <span class="req">*</span></label><textarea rows="3" placeholder="Describe what the LLC will do, what products or services it will offer, who its customers will be, and where it will operate."></textarea></div></div>
    <div class="form-row cols-2">
      <div class="form-group"><label>States Where Business Will Be Conducted</label><input type="text" placeholder="e.g., Virginia, Maryland, DC"></div>
      <div class="form-group"><label>Expected Start Date of Operations</label><input type="date"></div>
    </div>
  </div>
</div>

<!-- SECTION 3: MEMBERS -->
<div class="section" id="section-2">
  <div class="section-header">
    <div class="section-number">Section 03</div>
    <div class="section-title">Members &amp; Ownership</div>
    <div class="section-desc">List all members of the LLC and their ownership interests. Ownership percentages must total 100%.</div>
  </div>
  <div class="notice">Virginia does not require member names in the Articles of Organization (they remain private from the public record). Member information IS required for the Operating Agreement.</div>
  <div class="form-row cols-2" style="margin-bottom:20px;">
    <div class="form-group"><label>Number of Members <span class="req">*</span></label>
      <select id="memberCount" onchange="llcUpdateMemberCount()">
        <option value="1">1 — Single Member LLC</option>
        <option value="2">2 Members</option>
        <option value="3">3 Members</option>
        <option value="4">4 Members</option>
        <option value="5">5+ Members</option>
      </select>
    </div>
    <div class="form-group"><label>Ownership Allocation Method</label>
      <select>
        <option>Pro-rata (proportional to capital contribution)</option>
        <option>Equal split among all members</option>
        <option>Custom (specify in member cards below)</option>
      </select>
    </div>
  </div>
  <div id="membersList"></div>
  <div id="pctTotal" class="pct-total"></div>
  <div class="toggle-group" style="margin-top:16px;">
    <label class="toggle"><input type="checkbox" id="hasEntityMembers" onchange="llcToggleEntityMembers()"><div class="toggle-track"></div><div class="toggle-thumb"></div></label>
    <span class="toggle-label">One or more members is an entity (LLC, corporation, trust, etc.) rather than an individual</span>
  </div>
  <div id="entityMemberNote" class="notice hidden">Please provide the entity's full legal name, state of formation, and EIN in the member card above. We may need a copy of the entity's formation documents.</div>
</div>

<!-- SECTION 4: MANAGEMENT -->
<div class="section" id="section-3">
  <div class="section-header">
    <div class="section-number">Section 04</div>
    <div class="section-title">Management Structure</div>
    <div class="section-desc">How will the LLC be managed day-to-day? Virginia law allows two structures.</div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Management Type</div>
    <div class="form-row"><div class="form-group">
      <div class="radio-group" style="flex-direction:column;gap:12px;margin-top:4px;">
        <label class="radio-option"><input type="radio" name="mgmtType" value="member" checked> <div><strong>Member-Managed</strong> — All members participate in management. Best for small LLCs where all owners are active in the business.</div></label>
        <label class="radio-option"><input type="radio" name="mgmtType" value="manager"> <div><strong>Manager-Managed</strong> — One or more designated managers run the LLC. Members are passive investors. Best for LLCs with silent investors or outside management.</div></label>
      </div>
    </div></div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Primary Manager / Managing Member</div>
    <div class="form-row cols-3">
      <div class="form-group"><label>Full Name <span class="req">*</span></label><input type="text" id="mgr1-name" placeholder="Full legal name"></div>
      <div class="form-group"><label>Title</label><input type="text" placeholder="e.g., Managing Member, Manager, CEO"></div>
      <div class="form-group"><label>Email</label><input type="email" placeholder="email@example.com"></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Authority Level</label>
        <select>
          <option>Full authority — can bind LLC without member approval</option>
          <option>Limited authority — major decisions require member vote</option>
          <option>To be specified in Operating Agreement</option>
        </select>
      </div>
      <div class="form-group"><label>Term of Management</label>
        <select>
          <option>Indefinite (until resignation or removal)</option>
          <option>1 year (renewable)</option>
          <option>2 years (renewable)</option>
          <option>Other (specify in notes)</option>
        </select>
      </div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Voting &amp; Decision-Making</div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Routine Business Decisions Require</label>
        <select>
          <option>Majority vote (by ownership %)</option>
          <option>Majority vote (one vote per member)</option>
          <option>Manager decision (no member vote)</option>
        </select>
      </div>
      <div class="form-group"><label>Major Decisions (sale, merger, new debt) Require</label>
        <select>
          <option>Unanimous consent of all members</option>
          <option>Super-majority (2/3 or 75%)</option>
          <option>Simple majority</option>
        </select>
      </div>
    </div>
    <div class="toggle-group">
      <label class="toggle"><input type="checkbox" id="hasOfficers" onchange="llcToggleOfficers()"><div class="toggle-track"></div><div class="toggle-thumb"></div></label>
      <span class="toggle-label">The LLC will have officers (President, Secretary, Treasurer, etc.) in addition to managers/members</span>
    </div>
    <div id="officerSection" class="hidden">
      <div class="form-row cols-3">
        <div class="form-group"><label>President / CEO</label><input type="text" placeholder="Name"></div>
        <div class="form-group"><label>Secretary</label><input type="text" placeholder="Name"></div>
        <div class="form-group"><label>Treasurer / CFO</label><input type="text" placeholder="Name"></div>
      </div>
    </div>
  </div>
</div>

<!-- SECTION 5: FINANCE & TAX -->
<div class="section" id="section-4">
  <div class="section-header">
    <div class="section-number">Section 05</div>
    <div class="section-title">Finance &amp; Tax</div>
    <div class="section-desc">Financial structure, capital contributions, and tax elections for the LLC.</div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Initial Capital &amp; Banking</div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Total Initial Capital Contributions</label><input type="text" placeholder="e.g., $10,000"></div>
      <div class="form-group"><label>Fiscal Year End</label>
        <select><option>December 31 (calendar year)</option><option>March 31</option><option>June 30</option><option>September 30</option><option>Other</option></select>
      </div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Will the LLC Have a Dedicated Business Bank Account?</label>
        <select><option>Yes — will open immediately after formation</option><option>Yes — already have one</option><option>Not sure yet</option></select>
      </div>
      <div class="form-group"><label>Preferred Bank (if known)</label><input type="text" placeholder="e.g., Bank of America, Chase, local credit union"></div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Tax Classification</div>
    <div class="notice amber">Tax elections have significant long-term implications. We strongly recommend consulting with a CPA before making a final election. We can provide referrals.</div>
    <div class="form-row"><div class="form-group"><label>Desired Federal Tax Treatment</label>
      <div class="radio-group" style="flex-direction:column;gap:10px;margin-top:8px;">
        <label class="radio-option"><input type="radio" name="taxElect" value="default" checked> Default LLC treatment (disregarded entity for SMLLC; partnership for multi-member)</label>
        <label class="radio-option"><input type="radio" name="taxElect" value="scorps"> S-Corporation election (Form 2553) — potential payroll tax savings</label>
        <label class="radio-option"><input type="radio" name="taxElect" value="ccorp"> C-Corporation election (Form 8832) — less common, specific use cases</label>
        <label class="radio-option"><input type="radio" name="taxElect" value="unsure"> Not sure — need guidance from CPA</label>
      </div>
    </div></div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Does the LLC Need an EIN?</label>
        <select><option>Yes — will need EIN (most LLCs do)</option><option>Already have one</option><option>Not sure</option></select>
      </div>
      <div class="form-group"><label>Will the LLC Have Employees?</label>
        <select><option>No employees initially</option><option>Yes — immediately</option><option>Yes — within 12 months</option><option>Possibly — not sure yet</option></select>
      </div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Distributions &amp; Profit Sharing</div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Distribution Frequency</label>
        <select><option>As determined by manager/members (discretionary)</option><option>Quarterly</option><option>Annually</option><option>Monthly</option></select>
      </div>
      <div class="form-group"><label>Distribution Method</label>
        <select><option>Pro-rata by ownership percentage</option><option>Equal split regardless of ownership</option><option>Preferred returns to certain members first</option><option>Custom (describe in notes)</option></select>
      </div>
    </div>
  </div>
</div>

<!-- SECTION 6: OPERATIONS -->
<div class="section" id="section-5">
  <div class="section-header">
    <div class="section-number">Section 06</div>
    <div class="section-title">Operations, Transfers &amp; Agreements</div>
    <div class="section-desc">Transfer restrictions, buy-sell provisions, non-compete clauses, and additional services needed.</div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Transfer Restrictions</div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Can Members Transfer Their Interest?</label>
        <select><option>Only with unanimous consent of all members</option><option>Only with majority consent</option><option>Freely transferable</option><option>Not transferable during member's lifetime</option></select>
      </div>
      <div class="form-group"><label>Right of First Refusal</label>
        <select><option>Yes — LLC and/or members have right of first refusal</option><option>No right of first refusal</option><option>To be discussed</option></select>
      </div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Buy-Sell Agreement</div>
    <div class="toggle-group">
      <label class="toggle"><input type="checkbox" id="hasBuySell" onchange="llcToggleBuySell()"><div class="toggle-track"></div><div class="toggle-thumb"></div></label>
      <span class="toggle-label">Include a buy-sell agreement / buyout provisions in the Operating Agreement</span>
    </div>
    <div id="buySellSection" class="hidden">
      <div class="form-row cols-2" style="margin-top:12px;">
        <div class="form-group"><label>Triggering Events for Buyout</label>
          <div class="check-group" style="flex-direction:column;gap:6px;margin-top:6px;">
            <label class="check-option"><input type="checkbox" checked> Death of a member</label>
            <label class="check-option"><input type="checkbox" checked> Permanent disability / incapacity</label>
            <label class="check-option"><input type="checkbox" checked> Voluntary withdrawal</label>
            <label class="check-option"><input type="checkbox" checked> Divorce (transfer to non-member spouse)</label>
            <label class="check-option"><input type="checkbox" checked> Bankruptcy of a member</label>
            <label class="check-option"><input type="checkbox"> Termination of employment (if member is also employee)</label>
            <label class="check-option"><input type="checkbox"> Felony conviction</label>
          </div>
        </div>
        <div class="form-group"><label>Buyout Price Determined By</label>
          <select>
            <option>Agreed value (set annually by members)</option>
            <option>Third-party appraisal</option>
            <option>Formula (multiple of revenue or earnings)</option>
            <option>Book value</option>
            <option>To be negotiated at time of event</option>
          </select>
        </div>
      </div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Non-Compete &amp; Confidentiality</div>
    <div class="toggle-group">
      <label class="toggle"><input type="checkbox"><div class="toggle-track"></div><div class="toggle-thumb"></div></label>
      <span class="toggle-label">Include non-compete provisions restricting members from competing during membership</span>
    </div>
    <div class="toggle-group">
      <label class="toggle"><input type="checkbox" checked><div class="toggle-track"></div><div class="toggle-thumb"></div></label>
      <span class="toggle-label">Include confidentiality / non-disclosure provisions for proprietary business information</span>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Additional Services Needed</div>
    <div class="check-group" style="flex-direction:column;gap:8px;">
      <label class="check-option"><input type="checkbox"> EIN application assistance</label>
      <label class="check-option"><input type="checkbox"> Virginia business license / local license guidance</label>
      <label class="check-option"><input type="checkbox"> Foreign LLC registration (register in MD, DC, or other state)</label>
      <label class="check-option"><input type="checkbox"> Annual SCC registration compliance / reminders</label>
      <label class="check-option"><input type="checkbox"> Initial resolutions / organizational minutes</label>
      <label class="check-option"><input type="checkbox"> Membership interest certificates</label>
      <label class="check-option"><input type="checkbox"> Referral to CPA for tax election / planning advice</label>
      <label class="check-option"><input type="checkbox"> Transfer of existing assets into LLC (deeds, assignment agreements)</label>
    </div>
  </div>
</div>

<!-- SECTION 7: REVIEW -->
<div class="section" id="section-6">
  <div class="section-header">
    <div class="section-number">Section 07</div>
    <div class="section-title">Review &amp; Submit</div>
    <div class="section-desc">Review your key information before submitting. Use the Back button to correct any section.</div>
  </div>
  <div class="review-block">
    <div class="review-block-header">Client</div>
    <div class="review-grid">
      <div class="review-field"><div class="review-field-label">Name</div><div class="review-field-value" id="rv-client">—</div></div>
      <div class="review-field"><div class="review-field-label">Email</div><div class="review-field-value" id="rv-email">—</div></div>
      <div class="review-field"><div class="review-field-label">Phone</div><div class="review-field-value" id="rv-phone">—</div></div>
    </div>
  </div>
  <div class="review-block">
    <div class="review-block-header">Entity</div>
    <div class="review-grid">
      <div class="review-field"><div class="review-field-label">LLC Name</div><div class="review-field-value" id="rv-llcname">—</div></div>
      <div class="review-field"><div class="review-field-label">Entity Type</div><div class="review-field-value" id="rv-llctype">—</div></div>
      <div class="review-field"><div class="review-field-label">State of Formation</div><div class="review-field-value" id="rv-state">—</div></div>
      <div class="review-field"><div class="review-field-label">Principal Address</div><div class="review-field-value" id="rv-addr">—</div></div>
    </div>
  </div>
  <div class="review-block">
    <div class="review-block-header">Key Structure</div>
    <div class="review-grid">
      <div class="review-field"><div class="review-field-label">Number of Members</div><div class="review-field-value" id="rv-members">—</div></div>
      <div class="review-field"><div class="review-field-label">Primary Manager</div><div class="review-field-value" id="rv-manager">—</div></div>
    </div>
  </div>
  <div class="subsection">
    <div class="subsection-title">Notes for the Attorney</div>
    <div class="form-row"><div class="form-group"><label>Anything else we should know before your consultation?</label><textarea rows="4" placeholder="Questions, special concerns, timeline requirements, related transactions, existing agreements, prior entity history, etc."></textarea></div></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Preferred Consultation Method</label>
      <div class="radio-group">
        <label class="radio-option"><input type="radio" name="consult"> In-person</label>
        <label class="radio-option"><input type="radio" name="consult"> Video call</label>
        <label class="radio-option"><input type="radio" name="consult"> Phone</label>
      </div>
    </div>
    <div class="form-group"><label>Preferred Days / Times</label><input type="text" placeholder="e.g., weekday mornings, Tues/Thurs afternoons"></div>
  </div>
  <div class="notice" style="margin-top:16px;"><strong>Acknowledgment:</strong> By submitting this intake form, you confirm that the information provided is accurate to the best of your knowledge. This form does not create an attorney-client relationship. Our office will contact you to confirm receipt, schedule a consultation, and provide an engagement letter.</div>
</div>

<!-- NAV -->
<div class="nav-bar" id="navBar">
  <button class="btn btn-ghost" id="llc-prevBtn" onclick="llcNavigate(-1)" style="visibility:hidden;">&#8592; Back</button>
  <span style="font-size:11px;color:var(--mid-gray);letter-spacing:.1em;" id="llc-pageIndicator">Page 1 of 7</span>
  <button class="btn btn-primary" id="llc-nextBtn" onclick="llcNavigate(1)">Continue &#8594;</button>
</div>

</div>
`;
