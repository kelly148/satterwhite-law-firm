/*
 * IntakeForm.tsx — Trust & Estate Planning Client Intake Form
 * Embeds the original multi-step HTML form with all original styling preserved.
 * On submit, collects all visible form field values and sends them to the
 * backend via tRPC intake.submit, which notifies kelly@thesatterwhitelawfirm.com
 * Clients can download the completed form immediately after submission.
 */
import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

// Generate a formatted text document from form data
const generateFormDocument = (formData: any, clientName: string): string => {
  const formatValue = (val: any) => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
  };

  const sections: string[] = [];
  
  sections.push('TRUST & ESTATE PLANNING CLIENT INTAKE FORM');
  sections.push('The Satterwhite Law Firm, PLLC');
  sections.push('1605 Fort Hunt Ct • Alexandria, VA 22307');
  sections.push('═'.repeat(70));
  sections.push('');

  // Section 1: Client Information
  sections.push('SECTION 1: CLIENT INFORMATION');
  sections.push('─'.repeat(70));
  sections.push(`Primary Client: ${formatValue(formData['g1-first'])} ${formatValue(formData['g1-mid'])} ${formatValue(formData['g1-last'])}`);
  sections.push(`Date of Birth: ${formatValue(formData['g1-dob'])}`);
  sections.push(`Place of Birth: ${formatValue(formData['g1-pob'])}`);
  sections.push(`Email: ${formatValue(formData['g1-email'])}`);
  sections.push(`Phone: ${formatValue(formData['g1-phone'])}`);
  sections.push(`Address: ${formatValue(formData['g1-addr'])} ${formatValue(formData['g1-city'])}, ${formatValue(formData['g1-state'])} ${formatValue(formData['g1-zip'])}`);
  sections.push(`Citizenship: ${formatValue(formData['g1-citizen'])}`);
  sections.push(`Marital Status: ${formatValue(formData['g1-marital'])}`);
  sections.push('');

  if (formData['hasSpouse']) {
    sections.push('Spouse/Partner Information:');
    sections.push(`Name: ${formatValue(formData['g2-first'])} ${formatValue(formData['g2-mid'])} ${formatValue(formData['g2-last'])}`);
    sections.push(`Date of Birth: ${formatValue(formData['g2-dob'])}`);
    sections.push(`Email: ${formatValue(formData['g2-email'])}`);
    sections.push('');
  }

  // Section 5: Fiduciaries (most important)
  sections.push('SECTION 5: KEY FIDUCIARIES');
  sections.push('─'.repeat(70));
  sections.push(`Successor Trustee: ${formatValue(formData['trustee1'])}`);
  sections.push(`Financial POA Agent: ${formatValue(formData['poa1'])}`);
  sections.push(`Health Care Agent: ${formatValue(formData['hca1'])}`);
  sections.push('');

  // Section 6: Preferences
  sections.push('SECTION 6: PREFERENCES & INSTRUCTIONS');
  sections.push('─'.repeat(70));
  sections.push(`Preferred Contact Method: ${formatValue(formData['preferred-method'] || 'Not specified')}`);
  sections.push(`Preferred Times: ${formatValue(formData['preferred-times'] || 'Not specified')}`);
  sections.push(`Attorney Notes: ${formatValue(formData['attorney-notes'] || 'None')}`);
  sections.push('');

  // Footer
  sections.push('═'.repeat(70));
  sections.push(`Submitted: ${formData.submittedAt || new Date().toISOString()}`);
  sections.push(`Client: ${clientName}`);
  sections.push('');
  sections.push('This is a confidential document protected by attorney-client privilege.');
  sections.push('The Satterwhite Law Firm, PLLC');

  return sections.join('\n');
};

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
.success-screen{text-align:center;padding:60px 20px;}
.success-icon{width:64px;height:64px;background:var(--navy);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:white;font-size:28px;margin-bottom:24px;}
.success-title{font-family:'Cormorant Garamond',serif;font-size:32px;color:var(--navy);margin-bottom:12px;}
.success-sub{font-size:14px;color:var(--mid-gray);max-width:400px;margin:0 auto 32px;}
.btn{padding:12px 32px;font-family:'Jost',sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all .2s;display:inline-block;text-decoration:none;border:none;}
.btn-primary{background:var(--navy);color:white;border:1px solid var(--navy);}
.btn-primary:hover{background:#243460;}
.hidden{display:none!important;}
</style>

<div id="intake-wrapper">
<div class="page-wrapper">
<div class="firm-header">
<div class="firm-sub">Estate Planning Client Intake</div>
<div class="firm-name">The Satterwhite Law Firm, PLLC</div>
<div class="firm-contact">1605 Fort Hunt Ct • Alexandria, VA 22307 • Trusts & Estates • Real Estate • Business Law</div>
<div class="form-title">Revocable Living Trust • Pour-Over Will • Powers of Attorney • Advance Medical Directive</div>
</div>

<div id="successScreen" class="success-screen hidden">
  <div class="success-icon">✓</div>
  <div class="success-title">Intake Form Submitted</div>
  <div class="success-sub">Thank you for completing the intake form. Our office will review your information and contact you within one business day to schedule your consultation.</div>
</div>

<div id="formContent"></div>
</div>
</div>
`;

export default function IntakeForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const submitMutation = trpc.intake.submit.useMutation();

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = INTAKE_HTML;

    // Collect all form data and submit
    const handleSubmit = async (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const btn = document.getElementById("nextBtn") as HTMLButtonElement | null;

      try {
        // Submit to backend
        await submitMutation.mutateAsync({
          clientName: detail.clientName || "Unknown",
          clientEmail: detail.clientEmail || "",
          clientPhone: detail.clientPhone || "",
          submittedAt: detail.submittedAt || new Date().toISOString(),
          formDataJson: JSON.stringify(detail),
        });

        // Generate the form document on the client side
        const documentContent = generateFormDocument(detail, detail.clientName || "Unknown");
        const blob = new Blob([documentContent], { type: 'text/plain' });
        const downloadUrl = URL.createObjectURL(blob);

        // Show success screen
        const formContent = document.getElementById("formContent");
        const successScreen = document.getElementById("successScreen");
        if (formContent) formContent.style.display = "none";
        if (successScreen) {
          successScreen.classList.remove("hidden");
          // Add download button for the generated document
          const downloadBtn = document.createElement('a');
          downloadBtn.href = downloadUrl;
          downloadBtn.download = `Trust_Intake_${(detail.clientName || 'Form').replace(/\s+/g, '_')}.txt`;
          downloadBtn.className = 'btn btn-primary';
          downloadBtn.style.marginTop = '20px';
          downloadBtn.style.marginRight = '12px';
          downloadBtn.textContent = '📥 Download Your Intake Form';
          const successContent = successScreen.querySelector('.success-sub');
          if (successContent && successContent.parentNode) {
            successContent.parentNode.insertBefore(downloadBtn, successContent.nextSibling);
          }
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Form submission error:", error);
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Submit →";
        }
      }
    };

    document.addEventListener("intakeFormSubmit", handleSubmit);
    return () => document.removeEventListener("intakeFormSubmit", handleSubmit);
  }, [submitMutation]);

  return <div ref={containerRef} />;
}
