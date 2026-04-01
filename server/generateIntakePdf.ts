/**
 * generateIntakePdf.ts — Generate a comprehensive PDF from trust intake form data
 * Uses pdfkit (Node.js) for reliable PDF creation.
 * Reads both named fields (by id) and subsection data (dynamically added items).
 */

import { storagePut } from "./storage";
import { randomBytes } from "crypto";
import * as fs from "fs";
import * as path from "path";
import PDFDocument from "pdfkit";

function randomSuffix(): string {
  return randomBytes(4).toString("hex");
}

function fv(formData: any, fieldId: string): string {
  const val = formData[fieldId];
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return String(val).trim();
}

function fvOr(formData: any, fieldId: string, fallback = 'Not provided'): string {
  const v = fv(formData, fieldId);
  return v || fallback;
}

// Draw a section header bar
function sectionHeader(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.4);
  const y = doc.y;
  doc.rect(50, y, doc.page.width - 100, 18).fill('#1a2744');
  doc.fillColor('white').fontSize(10).font('Helvetica-Bold')
    .text(title.toUpperCase(), 56, y + 4, { width: doc.page.width - 112 });
  doc.fillColor('black');
  doc.moveDown(0.8);
}

// Draw a two-column label/value row
function row(doc: PDFKit.PDFDocument, label: string, value: string) {
  const colW = (doc.page.width - 100) / 2;
  const x = 50;
  const y = doc.y;
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#555555').text(label.toUpperCase(), x, y, { width: colW - 8, continued: false });
  const afterLabel = doc.y;
  doc.fontSize(10).font('Helvetica').fillColor('#1a1a1a').text(value || '—', x + colW, y, { width: colW - 8 });
  doc.y = Math.max(afterLabel, doc.y) + 2;
}

// Draw a full-width label/value block (for long text)
function block(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#555555').text(label.toUpperCase(), 50, doc.y, { width: doc.page.width - 100 });
  doc.fontSize(10).font('Helvetica').fillColor('#1a1a1a').text(value || '—', 50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.3);
}

// Render a subsection (dynamically added item like a child, property, account)
function renderSubsection(doc: PDFKit.PDFDocument, sub: any) {
  if (!sub || !sub.fields || Object.keys(sub.fields).length === 0) return;
  const title = sub.title || 'Item';
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text(`  ${title}`, 50, doc.y);
  doc.moveDown(0.2);
  const fields = sub.fields as Record<string, string>;
  const entries = Object.entries(fields).filter(([, v]) => v && String(v).trim() !== '');
  entries.forEach(([k, v]) => {
    const label = k.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#777777').text(`    ${label}:`, 50, doc.y, { continued: true });
    doc.fontSize(9).font('Helvetica').fillColor('#1a1a1a').text(`  ${v}`, { continued: false });
  });
  doc.moveDown(0.3);
}

export async function generateIntakePdf(formData: any, clientName: string): Promise<string | null> {
  const tempDir = "/tmp";
  const tempPdfPath = path.join(tempDir, `intake-${randomSuffix()}.pdf`);

  try {
    const doc = new PDFDocument({ size: 'Letter', margin: 50, bufferPages: true });
    const stream = fs.createWriteStream(tempPdfPath);
    doc.pipe(stream);

    // ── HEADER ──────────────────────────────────────────────────────────────
    doc.rect(50, 50, doc.page.width - 100, 60).fill('#1a2744');
    doc.fillColor('white').fontSize(16).font('Helvetica-Bold')
      .text('TRUST & ESTATE PLANNING INTAKE FORM', 60, 62, { align: 'center', width: doc.page.width - 120 });
    doc.fontSize(10).font('Helvetica')
      .text('The Satterwhite Law Firm, PLLC  ·  1605 Fort Hunt Ct, Alexandria, VA 22307  ·  (703) 855-7380', 60, 84, { align: 'center', width: doc.page.width - 120 });
    doc.fillColor('black');
    doc.y = 125;
    doc.fontSize(9).font('Helvetica').fillColor('#555555')
      .text(`Submitted: ${fvOr(formData, 'submittedAt', new Date().toLocaleString())}   |   Client: ${clientName}`, { align: 'right' });
    doc.fillColor('black');
    doc.moveDown(0.5);

    // ── SECTION 1: CLIENT INFORMATION ───────────────────────────────────────
    sectionHeader(doc, 'Section 1 — Client Information');

    const firstName = fv(formData, 'g1-first');
    const midName = fv(formData, 'g1-mid');
    const lastName = fv(formData, 'g1-last');
    const suffix = fv(formData, 'g1-suffix');
    const fullName = [firstName, midName, lastName, suffix].filter(Boolean).join(' ') || 'Not provided';
    const address = [fv(formData, 'g1-addr'), fv(formData, 'g1-city'), fv(formData, 'g1-state'), fv(formData, 'g1-zip')].filter(Boolean).join(', ') || 'Not provided';

    row(doc, 'Full Name', fullName);
    row(doc, 'Date of Birth', fvOr(formData, 'g1-dob'));
    row(doc, 'Place of Birth', fvOr(formData, 'g1-pob'));
    row(doc, 'Email', fvOr(formData, 'g1-email'));
    row(doc, 'Phone', fvOr(formData, 'g1-phone'));
    row(doc, 'Address', address);
    row(doc, 'Citizenship', fvOr(formData, 'g1-citizen'));
    row(doc, 'Marital Status', fvOr(formData, 'g1-marital'));

    // Spouse
    const spouseFirst = fv(formData, 'g2-first');
    const spouseLast = fv(formData, 'g2-last');
    if (spouseFirst || spouseLast || fv(formData, 'hasSpouse') === 'true') {
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text('Spouse / Partner (Grantor 2)', 50, doc.y);
      doc.fillColor('black').moveDown(0.2);
      const spouseName = [spouseFirst, spouseLast].filter(Boolean).join(' ') || 'Not provided';
      row(doc, 'Name', spouseName);
      row(doc, 'Date of Birth', fvOr(formData, 'g2-dob'));
      row(doc, 'Email', fvOr(formData, 'g2-email'));
    }

    // ── SECTION 2: FAMILY & BENEFICIARIES ───────────────────────────────────
    sectionHeader(doc, 'Section 2 — Family & Beneficiaries');

    // Children from subsections
    const subsections: any[] = Array.isArray(formData.subsections) ? formData.subsections : [];
    const children = subsections.filter((s: any) =>
      s.title && (s.title.toLowerCase().includes('child') || s.title.match(/^child\s*\d+$/i))
    );
    if (children.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text('Children', 50, doc.y);
      doc.fillColor('black').moveDown(0.2);
      children.forEach((c: any) => renderSubsection(doc, c));
    } else {
      block(doc, 'Children', 'None entered');
    }

    // Other beneficiaries
    const otherBens = subsections.filter((s: any) =>
      s.title && s.title.toLowerCase().includes('beneficiar')
    );
    if (otherBens.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text('Other Beneficiaries', 50, doc.y);
      doc.fillColor('black').moveDown(0.2);
      otherBens.forEach((b: any) => renderSubsection(doc, b));
    }

    // ── SECTION 3: ASSETS & PROPERTY ────────────────────────────────────────
    sectionHeader(doc, 'Section 3 — Assets & Property');

    const realProps = subsections.filter((s: any) =>
      s.title && (s.title.toLowerCase().includes('property') || s.title.match(/^property\s*\d+$/i))
    );
    if (realProps.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text('Real Property', 50, doc.y);
      doc.fillColor('black').moveDown(0.2);
      realProps.forEach((p: any) => renderSubsection(doc, p));
    }

    const financialAccts = subsections.filter((s: any) =>
      s.title && s.title.toLowerCase() === 'account'
    );
    if (financialAccts.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text('Financial Accounts', 50, doc.y);
      doc.fillColor('black').moveDown(0.2);
      financialAccts.forEach((a: any) => renderSubsection(doc, a));
    }

    const retirementAccts = subsections.filter((s: any) =>
      s.title && s.title.toLowerCase().includes('retirement')
    );
    if (retirementAccts.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text('Retirement Accounts', 50, doc.y);
      doc.fillColor('black').moveDown(0.2);
      retirementAccts.forEach((a: any) => renderSubsection(doc, a));
    }

    const insurance = subsections.filter((s: any) =>
      s.title && s.title.toLowerCase().includes('insurance')
    );
    if (insurance.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text('Life Insurance Policies', 50, doc.y);
      doc.fillColor('black').moveDown(0.2);
      insurance.forEach((p: any) => renderSubsection(doc, p));
    }

    const business = subsections.filter((s: any) =>
      s.title && s.title.toLowerCase().includes('business')
    );
    if (business.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text('Business Interests', 50, doc.y);
      doc.fillColor('black').moveDown(0.2);
      business.forEach((b: any) => renderSubsection(doc, b));
    }

    const otherAssets = subsections.filter((s: any) =>
      s.title && s.title.toLowerCase() === 'asset'
    );
    if (otherAssets.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text('Other Assets', 50, doc.y);
      doc.fillColor('black').moveDown(0.2);
      otherAssets.forEach((a: any) => renderSubsection(doc, a));
    }

    // ── SECTION 4: DISTRIBUTION PLAN ────────────────────────────────────────
    sectionHeader(doc, 'Section 4 — Distribution Plan');

    // Distribution type from radio (captured as formData.distType)
    const distType = fv(formData, 'distType');
    row(doc, 'Primary Distribution', distType || 'Not specified');

    // Bequests
    const bequests = subsections.filter((s: any) =>
      s.title && (s.title.toLowerCase().includes('bequest') || s.title.toLowerCase().includes('gift'))
    );
    if (bequests.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text('Specific Bequests & Charitable Gifts', 50, doc.y);
      doc.fillColor('black').moveDown(0.2);
      bequests.forEach((b: any) => renderSubsection(doc, b));
    }

    // ── SECTION 5: FIDUCIARIES ───────────────────────────────────────────────
    sectionHeader(doc, 'Section 5 — Fiduciaries');

    row(doc, 'Successor Trustee (Primary)', fvOr(formData, 'trustee1'));
    row(doc, 'Alternate Trustee (1st)', fvOr(formData, 'trustee2'));
    row(doc, 'Personal Representative (Executor)', fvOr(formData, 'executor1'));

    const guardianNeeded = fv(formData, 'needsGuardian');
    if (guardianNeeded === 'true' || guardianNeeded === 'on') {
      row(doc, 'Guardian (Primary)', fvOr(formData, 'guardian1'));
      row(doc, 'Guardian (Alternate)', fvOr(formData, 'guardian2'));
    } else {
      row(doc, 'Guardian Nomination', 'Not applicable');
    }

    // ── SECTION 6: POWERS OF ATTORNEY & MEDICAL DIRECTIVES ──────────────────
    sectionHeader(doc, 'Section 6 — Powers of Attorney & Medical Directives');

    row(doc, 'Financial POA Agent (Primary)', fvOr(formData, 'poa1'));
    row(doc, 'Financial POA Agent (Alternate)', fvOr(formData, 'poa2'));
    row(doc, 'Health Care Agent (Primary)', fvOr(formData, 'hca1'));
    row(doc, 'Health Care Agent (Alternate)', fvOr(formData, 'hca2'));

    // Life-sustaining treatment preferences (radio buttons captured as formData.terminal / formData.pvs)
    const terminal = fv(formData, 'terminal');
    const pvs = fv(formData, 'pvs');
    row(doc, 'Terminal Condition Directive', terminal || 'Not specified');
    row(doc, 'Persistent Vegetative State Directive', pvs || 'Not specified');

    // HIPAA
    const hipaa = subsections.filter((s: any) =>
      s.title && s.title.toLowerCase().includes('hipaa')
    );
    if (hipaa.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text('HIPAA Authorized Individuals', 50, doc.y);
      doc.fillColor('black').moveDown(0.2);
      hipaa.forEach((h: any) => renderSubsection(doc, h));
    }

    // ── SECTION 7: NOTES & PREFERENCES ──────────────────────────────────────
    sectionHeader(doc, 'Section 7 — Notes & Preferences');

    const attorneyNotes = fv(formData, 'attorney-notes');
    block(doc, 'Notes for the Attorney', attorneyNotes || 'None provided');

    const preferredTimes = fv(formData, 'preferred-times');
    row(doc, 'Preferred Consultation Times', preferredTimes || 'Not specified');

    const consultMethod = fv(formData, 'consult');
    row(doc, 'Preferred Consultation Method', consultMethod || 'Not specified');

    // ── FOOTER ───────────────────────────────────────────────────────────────
    doc.moveDown(1);
    const footerY = doc.y;
    doc.rect(50, footerY, doc.page.width - 100, 1).fill('#b8913f');
    doc.moveDown(0.4);
    doc.fontSize(8).font('Helvetica').fillColor('#777777')
      .text('This form is confidential and protected by attorney-client privilege. Submission does not create an attorney-client relationship.', 50, doc.y, { align: 'center', width: doc.page.width - 100 });
    doc.text('The Satterwhite Law Firm, PLLC  ·  1605 Fort Hunt Ct, Alexandria, VA 22307  ·  (703) 855-7380  ·  kelly@thesatterwhitelawfirm.com', { align: 'center', width: doc.page.width - 100 });

    // Finalize PDF
    doc.end();

    return new Promise((resolve) => {
      stream.on('finish', async () => {
        try {
          if (!fs.existsSync(tempPdfPath)) {
            console.error("[generateIntakePdf] PDF file was not created");
            resolve(null);
            return;
          }
          const pdfBuffer = fs.readFileSync(tempPdfPath);
          const fileKey = `intake-forms/${clientName.replace(/\s+/g, "-").toLowerCase()}-${randomSuffix()}.pdf`;
          const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
          try { fs.unlinkSync(tempPdfPath); } catch (_) {}
          resolve(url);
        } catch (error) {
          console.error("[generateIntakePdf] Error uploading PDF:", error);
          try { fs.unlinkSync(tempPdfPath); } catch (_) {}
          resolve(null);
        }
      });
      stream.on('error', (error) => {
        console.error("[generateIntakePdf] Stream error:", error);
        try { fs.unlinkSync(tempPdfPath); } catch (_) {}
        resolve(null);
      });
    });
  } catch (error) {
    console.error("[generateIntakePdf] Error generating PDF:", error);
    try { fs.unlinkSync(tempPdfPath); } catch (_) {}
    return null;
  }
}
