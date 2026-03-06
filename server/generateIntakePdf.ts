/**
 * generateIntakePdf.ts — Generate a professional PDF from trust intake form data
 * Uses markdown generation + manus-md-to-pdf for reliable PDF creation
 */

import { storagePut } from "./storage";
import { randomBytes } from "crypto";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

function randomSuffix(): string {
  return randomBytes(4).toString("hex");
}

function getFieldValue(formData: any, fieldId: string): string {
  const val = formData[fieldId];
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return String(val).trim();
}

function generateMarkdownFromFormData(formData: any, clientName: string): string {
  const lines: string[] = [];
  
  lines.push("# TRUST & ESTATE PLANNING INTAKE FORM");
  lines.push("");
  lines.push("**The Satterwhite Law Firm, PLLC**");
  lines.push("");
  lines.push("1605 Fort Hunt Ct • Alexandria, VA 22307 • (703) 855-7380");
  lines.push("");
  lines.push("---");
  lines.push("");
  
  // Section 1: Client Information
  lines.push("## SECTION 1: CLIENT INFORMATION");
  lines.push("");
  const firstName = getFieldValue(formData, 'g1-first');
  const middleName = getFieldValue(formData, 'g1-mid');
  const lastName = getFieldValue(formData, 'g1-last');
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ') || 'Not provided';
  
  lines.push(`**Full Name:** ${fullName}`);
  lines.push(`**Date of Birth:** ${getFieldValue(formData, 'g1-dob') || 'Not provided'}`);
  lines.push(`**Email:** ${getFieldValue(formData, 'g1-email') || 'Not provided'}`);
  lines.push(`**Phone:** ${getFieldValue(formData, 'g1-phone') || 'Not provided'}`);
  
  const address = [
    getFieldValue(formData, 'g1-addr'),
    getFieldValue(formData, 'g1-city'),
    getFieldValue(formData, 'g1-state'),
    getFieldValue(formData, 'g1-zip')
  ].filter(Boolean).join(', ') || 'Not provided';
  lines.push(`**Address:** ${address}`);
  
  lines.push(`**Marital Status:** ${getFieldValue(formData, 'g1-marital') || 'Not provided'}`);
  lines.push("");
  
  // Section 2: Family Information
  lines.push("## SECTION 2: FAMILY INFORMATION");
  lines.push("");
  const spouseFirst = getFieldValue(formData, 'spouse-first');
  const spouseLast = getFieldValue(formData, 'spouse-last');
  const spouseName = [spouseFirst, spouseLast].filter(Boolean).join(' ') || 'Not provided';
  lines.push(`**Spouse/Partner:** ${spouseName}`);
  lines.push("");
  
  // Section 3: Assets
  lines.push("## SECTION 3: ASSETS & PROPERTY");
  lines.push("");
  lines.push(`**Estimated Total Estate Value:** ${getFieldValue(formData, 'estate-value') || 'Not provided'}`);
  lines.push(`**Prior Estate Planning:** ${getFieldValue(formData, 'prior-planning') || 'Not provided'}`);
  lines.push("");
  
  // Section 4: Distribution
  lines.push("## SECTION 4: DISTRIBUTION PLAN");
  lines.push("");
  lines.push(`**Trustee Distribution Standard:** ${getFieldValue(formData, 'lifetime-standard') || 'Not provided'}`);
  lines.push(`**Spouse Receives:** ${getFieldValue(formData, 'spouse-receives') || 'Not provided'}`);
  lines.push(`**Children Distribution:** ${getFieldValue(formData, 'children-distribution') || 'Not provided'}`);
  lines.push("");
  
  // Section 5: Fiduciaries
  lines.push("## SECTION 5: FIDUCIARIES");
  lines.push("");
  lines.push(`**Successor Trustee:** ${getFieldValue(formData, 'trustee1') || 'Not provided'}`);
  lines.push(`**Alternate Trustee:** ${getFieldValue(formData, 'trustee2') || 'Not provided'}`);
  lines.push(`**Financial POA Agent:** ${getFieldValue(formData, 'poa1') || 'Not provided'}`);
  lines.push(`**Health Care Agent:** ${getFieldValue(formData, 'hca1') || 'Not provided'}`);
  lines.push("");
  
  // Section 6: Powers of Attorney & Medical Directives
  lines.push("## SECTION 6: POWERS OF ATTORNEY & MEDICAL DIRECTIVES");
  lines.push("");
  lines.push(`**Financial POA Effective Date:** ${getFieldValue(formData, 'poa-effective') || 'Not provided'}`);
  lines.push(`**Life-Sustaining Treatment:** ${getFieldValue(formData, 'life-sustaining') || 'Not provided'}`);
  lines.push(`**Organ Donation:** ${getFieldValue(formData, 'organ-donation') || 'Not provided'}`);
  lines.push(`**Burial/Cremation Preference:** ${getFieldValue(formData, 'burial-preference') || 'Not provided'}`);
  lines.push("");
  
  // Section 7: Review & Notes
  lines.push("## SECTION 7: REVIEW & ADDITIONAL NOTES");
  lines.push("");
  const attorneyNotes = getFieldValue(formData, 'attorney-notes');
  lines.push(`**Attorney Notes:** ${attorneyNotes || 'None provided'}`);
  lines.push("");
  const preferredTimes = getFieldValue(formData, 'preferred-times');
  lines.push(`**Preferred Meeting Times:** ${preferredTimes || 'Not specified'}`);
  lines.push("");
  
  // Footer
  lines.push("---");
  lines.push("");
  lines.push(`**Client Name:** ${clientName}`);
  lines.push(`**Submitted:** ${new Date().toLocaleString()}`);
  lines.push("");
  lines.push("*This form is confidential and protected by attorney-client privilege.*");
  
  return lines.join("\n");
}

export async function generateIntakePdf(formData: any, clientName: string): Promise<string | null> {
  const tempDir = "/tmp";
  const tempMarkdownPath = path.join(tempDir, `intake-${randomSuffix()}.md`);
  const tempPdfPath = path.join(tempDir, `intake-${randomSuffix()}.pdf`);

  try {
    // Generate markdown content
    const markdownContent = generateMarkdownFromFormData(formData, clientName);
    
    // Write markdown to temp file
    fs.writeFileSync(tempMarkdownPath, markdownContent, "utf-8");

    // Convert markdown to PDF using manus-md-to-pdf
    try {
      execSync(`manus-md-to-pdf "${tempMarkdownPath}" "${tempPdfPath}"`, {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (e) {
      console.error("[generateIntakePdf] PDF conversion failed:", e);
      try { fs.unlinkSync(tempMarkdownPath); } catch (err) {}
      return null;
    }

    // Check if PDF was created
    if (!fs.existsSync(tempPdfPath)) {
      console.error("[generateIntakePdf] PDF file was not created");
      try { fs.unlinkSync(tempMarkdownPath); } catch (err) {}
      return null;
    }

    // Read the PDF and upload to S3
    const pdfBuffer = fs.readFileSync(tempPdfPath);
    const fileKey = `intake-forms/${clientName.replace(/\s+/g, "-").toLowerCase()}-${randomSuffix()}.pdf`;
    const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");

    // Clean up temp files
    try { fs.unlinkSync(tempMarkdownPath); } catch (e) {}
    try { fs.unlinkSync(tempPdfPath); } catch (e) {}

    return url;
  } catch (error) {
    console.error("[generateIntakePdf] Error generating PDF:", error);
    // Clean up temp files
    try { fs.unlinkSync(tempMarkdownPath); } catch (e) {}
    try { fs.unlinkSync(tempPdfPath); } catch (e) {}
    return null;
  }
}
