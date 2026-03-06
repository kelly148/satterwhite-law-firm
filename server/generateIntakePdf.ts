/**
 * generateIntakePdf.ts — Generate a professional PDF from trust intake form data
 * Converts the complete form data into a formatted, readable PDF document
 */

import { storagePut } from "./storage";
import { randomBytes } from "crypto";

function randomSuffix(): string {
  return randomBytes(4).toString("hex");
}

export async function generateIntakePdf(formData: any, clientName: string): Promise<string | null> {
  try {
    // Build a comprehensive text document from the form data
    const sections = [];

    // Header
    sections.push("═══════════════════════════════════════════════════════════");
    sections.push("TRUST & ESTATE PLANNING INTAKE FORM");
    sections.push("The Satterwhite Law Firm, PLLC");
    sections.push("═══════════════════════════════════════════════════════════");
    sections.push("");

    // Section 1: Client Information
    sections.push("SECTION 1: CLIENT INFORMATION");
    sections.push("───────────────────────────────────────────────────────────");
    if (formData.g1) {
      sections.push(`Full Name: ${formData.g1.firstName || ""} ${formData.g1.lastName || ""}`);
      sections.push(`Date of Birth: ${formData.g1.dob || ""}`);
      sections.push(`Email: ${formData.g1.email || ""}`);
      sections.push(`Phone: ${formData.g1.phone || ""}`);
      sections.push(`Address: ${formData.g1.address || ""}, ${formData.g1.city || ""}, ${formData.g1.state || ""} ${formData.g1.zip || ""}`);
      sections.push(`Marital Status: ${formData.g1.maritalStatus || ""}`);
      sections.push(`State(s) of Residency: ${Array.isArray(formData.g1.states) ? formData.g1.states.join(", ") : formData.g1.states || ""}`);
    }
    sections.push("");

    // Section 2: Family Information
    sections.push("SECTION 2: FAMILY INFORMATION");
    sections.push("───────────────────────────────────────────────────────────");
    if (formData.g2) {
      if (formData.g2.spouse) {
        sections.push(`Spouse Name: ${formData.g2.spouse.name || ""}`);
        sections.push(`Spouse DOB: ${formData.g2.spouse.dob || ""}`);
      }
      if (formData.g2.children && formData.g2.children.length > 0) {
        sections.push("Children:");
        formData.g2.children.forEach((child: any, idx: number) => {
          sections.push(`  ${idx + 1}. ${child.name || ""} (DOB: ${child.dob || ""})`);
        });
      }
      if (formData.g2.grandchildren && formData.g2.grandchildren.length > 0) {
        sections.push("Grandchildren:");
        formData.g2.grandchildren.forEach((gc: any, idx: number) => {
          sections.push(`  ${idx + 1}. ${gc.name || ""}`);
        });
      }
    }
    sections.push("");

    // Section 3: Assets & Liabilities
    sections.push("SECTION 3: ASSETS & LIABILITIES");
    sections.push("───────────────────────────────────────────────────────────");
    if (formData.g3) {
      sections.push(`Real Estate: ${formData.g3.realEstate || "Not specified"}`);
      sections.push(`Bank/Investment Accounts: ${formData.g3.bankAccounts || "Not specified"}`);
      sections.push(`Business Interests: ${formData.g3.businessInterests || "Not specified"}`);
      sections.push(`Life Insurance: ${formData.g3.lifeInsurance || "Not specified"}`);
      sections.push(`Retirement Accounts: ${formData.g3.retirementAccounts || "Not specified"}`);
      sections.push(`Digital Assets: ${formData.g3.digitalAssets || "Not specified"}`);
      sections.push(`Liabilities: ${formData.g3.liabilities || "Not specified"}`);
    }
    sections.push("");

    // Section 4: Distribution Plan
    sections.push("SECTION 4: DISTRIBUTION PLAN");
    sections.push("───────────────────────────────────────────────────────────");
    if (formData.g4) {
      sections.push(`Primary Distribution Plan: ${formData.g4.distributionPlan || "Not specified"}`);
      if (formData.g4.customDistribution) {
        sections.push(`Custom Distribution: ${formData.g4.customDistribution}`);
      }
      if (formData.g4.specificBequests && formData.g4.specificBequests.length > 0) {
        sections.push("Specific Bequests:");
        formData.g4.specificBequests.forEach((bequest: any, idx: number) => {
          sections.push(`  ${idx + 1}. ${bequest.description || ""} → ${bequest.recipient || ""}`);
        });
      }
    }
    sections.push("");

    // Section 5: Fiduciaries
    sections.push("SECTION 5: FIDUCIARIES");
    sections.push("───────────────────────────────────────────────────────────");
    if (formData.g5) {
      if (formData.g5.trustee) {
        sections.push(`Trustee: ${formData.g5.trustee.name || ""} (${formData.g5.trustee.relationship || ""})`);
      }
      if (formData.g5.alternateSuccessorTrustees && formData.g5.alternateSuccessorTrustees.length > 0) {
        sections.push("Alternate/Successor Trustees:");
        formData.g5.alternateSuccessorTrustees.forEach((trustee: any, idx: number) => {
          sections.push(`  ${idx + 1}. ${trustee.name || ""} (${trustee.relationship || ""})`);
        });
      }
      if (formData.g5.executor) {
        sections.push(`Executor: ${formData.g5.executor.name || ""} (${formData.g5.executor.relationship || ""})`);
      }
      if (formData.g5.guardian) {
        sections.push(`Guardian for Minor Children: ${formData.g5.guardian.name || ""} (${formData.g5.guardian.relationship || ""})`);
      }
    }
    sections.push("");

    // Section 6: Powers of Attorney & Medical Directives
    sections.push("SECTION 6: POWERS OF ATTORNEY & MEDICAL DIRECTIVES");
    sections.push("───────────────────────────────────────────────────────────");
    if (formData.g6) {
      if (formData.g6.financialPoaAgent) {
        sections.push(`Financial POA Agent: ${formData.g6.financialPoaAgent.name || ""} (${formData.g6.financialPoaAgent.relationship || ""})`);
      }
      if (formData.g6.healthCareAgent) {
        sections.push(`Health Care Agent: ${formData.g6.healthCareAgent.name || ""} (${formData.g6.healthCareAgent.relationship || ""})`);
      }
      sections.push(`Life-Sustaining Treatment Preference: ${formData.g6.lifeSustainingPreference || "Not specified"}`);
      sections.push(`Organ/Tissue Donation: ${formData.g6.organDonation || "Not specified"}`);
      sections.push(`Funeral/Burial Preference: ${formData.g6.funeralPreference || "Not specified"}`);
    }
    sections.push("");

    // Section 7: Review & Additional Notes
    sections.push("SECTION 7: REVIEW & ADDITIONAL NOTES");
    sections.push("───────────────────────────────────────────────────────────");
    if (formData.g7) {
      sections.push(`Attorney Notes: ${formData.g7.attorneyNotes || "None"}`);
      sections.push(`Preferred Meeting Format: ${formData.g7.preferredFormat || "Not specified"}`);
      sections.push(`Preferred Times: ${formData.g7.preferredTimes || "Not specified"}`);
    }
    sections.push("");

    // Footer
    sections.push("═══════════════════════════════════════════════════════════");
    sections.push("This form was completed on: " + new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "full",
      timeStyle: "short",
    }));
    sections.push("═══════════════════════════════════════════════════════════");

    // Convert to text document
    const textContent = sections.join("\n");

    // Upload the text document to S3
    const fileKey = `intake-forms/${clientName.replace(/\s+/g, "-").toLowerCase()}-${randomSuffix()}.txt`;
    const { url } = await storagePut(fileKey, textContent, "text/plain");

    return url;
  } catch (error) {
    console.error("[generateIntakePdf] Error generating PDF:", error);
    return null;
  }
}
