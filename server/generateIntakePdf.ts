/**
 * generateIntakePdf.ts — Generate a professional PDF from trust intake form data
 * Uses pdfkit (Node.js) for reliable PDF creation without Python dependencies
 */

import { storagePut } from "./storage";
import { randomBytes } from "crypto";
import * as fs from "fs";
import * as path from "path";
import PDFDocument from "pdfkit";

function randomSuffix(): string {
  return randomBytes(4).toString("hex");
}

function getFieldValue(formData: any, fieldId: string): string {
  const val = formData[fieldId];
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return String(val).trim();
}

export async function generateIntakePdf(formData: any, clientName: string): Promise<string | null> {
  const tempDir = "/tmp";
  const tempPdfPath = path.join(tempDir, `intake-${randomSuffix()}.pdf`);

  try {
    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'Letter',
      margin: 50,
      bufferPages: true,
    });

    // Create write stream
    const stream = fs.createWriteStream(tempPdfPath);
    doc.pipe(stream);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('TRUST & ESTATE PLANNING INTAKE FORM', { align: 'center' });
    doc.fontSize(11).font('Helvetica').text('The Satterwhite Law Firm, PLLC', { align: 'center' });
    doc.fontSize(10).text('1605 Fort Hunt Ct • Alexandria, VA 22307 • (703) 855-7380', { align: 'center' });
    doc.moveDown(0.5);

    // Section 1: Client Information
    doc.fontSize(14).font('Helvetica-Bold').text('SECTION 1: CLIENT INFORMATION');
    doc.fontSize(10).font('Helvetica');
    
    const firstName = getFieldValue(formData, 'g1-first');
    const middleName = getFieldValue(formData, 'g1-mid');
    const lastName = getFieldValue(formData, 'g1-last');
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ') || 'Not provided';
    
    doc.text(`Full Name: ${fullName}`);
    doc.text(`Date of Birth: ${getFieldValue(formData, 'g1-dob') || 'Not provided'}`);
    doc.text(`Email: ${getFieldValue(formData, 'g1-email') || 'Not provided'}`);
    doc.text(`Phone: ${getFieldValue(formData, 'g1-phone') || 'Not provided'}`);
    
    const address = [
      getFieldValue(formData, 'g1-addr'),
      getFieldValue(formData, 'g1-city'),
      getFieldValue(formData, 'g1-state'),
      getFieldValue(formData, 'g1-zip')
    ].filter(Boolean).join(', ') || 'Not provided';
    doc.text(`Address: ${address}`);
    doc.text(`Marital Status: ${getFieldValue(formData, 'g1-marital') || 'Not provided'}`);
    doc.moveDown(0.5);

    // Section 2: Family Information
    doc.fontSize(14).font('Helvetica-Bold').text('SECTION 2: FAMILY INFORMATION');
    doc.fontSize(10).font('Helvetica');
    
    const spouseFirst = getFieldValue(formData, 'g2-first');
    const spouseLast = getFieldValue(formData, 'g2-last');
    const spouseName = [spouseFirst, spouseLast].filter(Boolean).join(' ') || 'Not provided';
    doc.text(`Spouse/Partner: ${spouseName}`);
    
    // Children from subsections
    if (formData.subsections && Array.isArray(formData.subsections)) {
      const children = formData.subsections.filter((s: any) => s.type === 'child');
      if (children.length > 0) {
        doc.text('Children:');
        children.forEach((child: any, idx: number) => {
          doc.text(`  ${idx + 1}. ${child.name || 'Not provided'} (DOB: ${child.dob || 'Not provided'})`);
        });
      }
    }
    doc.moveDown(0.5);

    // Section 3: Assets & Property
    doc.fontSize(14).font('Helvetica-Bold').text('SECTION 3: ASSETS & PROPERTY');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Estimated Total Estate Value: ${getFieldValue(formData, 'estate-value') || 'Not provided'}`);
    doc.moveDown(0.5);

    // Section 4: Distribution Plan
    doc.fontSize(14).font('Helvetica-Bold').text('SECTION 4: DISTRIBUTION PLAN');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Distribution Preference: ${getFieldValue(formData, 'distribution-pref') || 'Not provided'}`);
    doc.moveDown(0.5);

    // Section 5: Fiduciaries
    doc.fontSize(14).font('Helvetica-Bold').text('SECTION 5: FIDUCIARIES');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Successor Trustee: ${getFieldValue(formData, 'trustee1') || 'Not provided'}`);
    doc.text(`Alternate Trustee: ${getFieldValue(formData, 'trustee2') || 'Not provided'}`);
    doc.text(`Financial POA Agent: ${getFieldValue(formData, 'poa1') || 'Not provided'}`);
    doc.text(`Health Care Agent: ${getFieldValue(formData, 'hca1') || 'Not provided'}`);
    doc.moveDown(0.5);

    // Section 6: Powers of Attorney & Medical Directives
    doc.fontSize(14).font('Helvetica-Bold').text('SECTION 6: POWERS OF ATTORNEY & MEDICAL DIRECTIVES');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Life-Sustaining Treatment: ${getFieldValue(formData, 'life-sustaining') || 'Not provided'}`);
    doc.text(`Organ Donation: ${getFieldValue(formData, 'organ-donation') || 'Not provided'}`);
    doc.text(`Burial/Cremation Preference: ${getFieldValue(formData, 'burial-preference') || 'Not provided'}`);
    doc.moveDown(0.5);

    // Section 7: Review & Notes
    doc.fontSize(14).font('Helvetica-Bold').text('SECTION 7: REVIEW & ADDITIONAL NOTES');
    doc.fontSize(10).font('Helvetica');
    const attorneyNotes = getFieldValue(formData, 'attorney-notes');
    doc.text(`Attorney Notes: ${attorneyNotes || 'None provided'}`);
    const preferredTimes = getFieldValue(formData, 'preferred-times');
    doc.text(`Preferred Meeting Times: ${preferredTimes || 'Not specified'}`);
    doc.moveDown(1);

    // Footer
    doc.fontSize(9).text('---', { align: 'center' });
    doc.fontSize(8).text(`Submitted: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text('This form is confidential and protected by attorney-client privilege.', { align: 'center' });

    // Finalize PDF
    doc.end();

    // Wait for stream to finish
    return new Promise((resolve, reject) => {
      stream.on('finish', async () => {
        try {
          // Check if PDF was created
          if (!fs.existsSync(tempPdfPath)) {
            console.error("[generateIntakePdf] PDF file was not created");
            resolve(null);
            return;
          }

          // Read the PDF and upload to S3
          const pdfBuffer = fs.readFileSync(tempPdfPath);
          const fileKey = `intake-forms/${clientName.replace(/\s+/g, "-").toLowerCase()}-${randomSuffix()}.pdf`;
          const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");

          // Clean up temp file
          try { fs.unlinkSync(tempPdfPath); } catch (e) {}

          resolve(url);
        } catch (error) {
          console.error("[generateIntakePdf] Error uploading PDF:", error);
          try { fs.unlinkSync(tempPdfPath); } catch (e) {}
          resolve(null);
        }
      });

      stream.on('error', (error) => {
        console.error("[generateIntakePdf] Stream error:", error);
        try { fs.unlinkSync(tempPdfPath); } catch (e) {}
        resolve(null);
      });
    });
  } catch (error) {
    console.error("[generateIntakePdf] Error generating PDF:", error);
    // Clean up temp file
    try { fs.unlinkSync(tempPdfPath); } catch (e) {}
    return null;
  }
}
