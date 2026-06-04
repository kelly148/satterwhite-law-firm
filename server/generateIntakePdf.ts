/**
 * generateIntakePdf.ts — Generate a comprehensive PDF from trust intake form data
 * Uses pdfkit (Node.js) for reliable PDF creation.
 * Reads both named fields (by id) and subsection data (dynamically added items).
 */

import { storagePut } from "./storage";
import { randomBytes } from "crypto";
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

// Start a new page if there isn't at least `needed` points of vertical room.
function ensureSpace(doc: PDFKit.PDFDocument, needed = 40) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
    doc.y = 50;
  }
}

// Draw a section header bar
function sectionHeader(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.4);
  ensureSpace(doc, 60);
  const y = doc.y;
  doc.rect(50, y, doc.page.width - 100, 18).fill('#1a2744');
  doc.fillColor('white').fontSize(10).font('Helvetica-Bold')
    .text(title.toUpperCase(), 56, y + 4, { width: doc.page.width - 112 });
  doc.fillColor('black');
  doc.moveDown(0.8);
}

// Draw a bold sub-group heading (e.g., "Primary Client", "Child 1", "Property 1")
function groupHeader(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.2);
  ensureSpace(doc, 40);
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a2744').text(title, 50, doc.y, { width: doc.page.width - 100 });
  doc.fillColor('black').moveDown(0.2);
}

// Draw a two-column label/value row
function row(doc: PDFKit.PDFDocument, label: string, value: string) {
  ensureSpace(doc, 30);
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
  ensureSpace(doc, 40);
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#555555').text(label.toUpperCase(), 50, doc.y, { width: doc.page.width - 100 });
  doc.fontSize(10).font('Helvetica').fillColor('#1a1a1a').text(value || '—', 50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.3);
}

// Section/group shape produced by the intake form's collector.
type IntakeField = { label?: string; value?: string };
type IntakeGroup = { title?: string; fields?: IntakeField[] };
type IntakeSection = { title?: string; fields?: IntakeField[]; groups?: IntakeGroup[] };

function getSections(formData: any): IntakeSection[] {
  return Array.isArray(formData?.sections) ? formData.sections : [];
}

/** Render the intake PDF and return its raw bytes (no upload). */
export function renderIntakePdfBuffer(formData: any, clientName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'Letter', margin: 50, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

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

    // ── ALL SECTIONS (rendered generically from the captured structure) ──────
    // Whatever the client entered is printed here — nothing is hardcoded, so no
    // field can be silently dropped.
    const sections = getSections(formData);

    if (sections.length === 0) {
      sectionHeader(doc, 'Submission');
      block(doc, 'Notice', 'No detailed form data was captured for this submission.');
    }

    sections.forEach((sec, idx) => {
      sectionHeader(doc, `Section ${idx + 1} — ${sec.title || 'Details'}`);

      // Sub-groups first (Primary Client, Child 1, Property 1, Trustee, etc.)
      (sec.groups || []).forEach((g) => {
        const fields = (g.fields || []).filter((f) => f && f.value && String(f.value).trim() !== '');
        if (fields.length === 0) return;
        groupHeader(doc, g.title || 'Details');
        fields.forEach((f) => row(doc, f.label || 'Field', String(f.value)));
      });

      // Then any loose section-level fields
      (sec.fields || []).forEach((f) => {
        if (!f || !f.value || String(f.value).trim() === '') return;
        const val = String(f.value);
        // Long answers (notes) read better as a full-width block
        if (val.length > 80) block(doc, f.label || 'Field', val);
        else row(doc, f.label || 'Field', val);
      });
    });

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
  });
}

/**
 * Generate the intake PDF, upload it to storage, and return BOTH the public URL
 * (for the email body / DB record) and the raw bytes (for emailing as an
 * attachment). Either may be null if its step fails — the buffer is still
 * returned even when the upload fails, so the attachment can go out regardless.
 */
export async function generateIntakePdf(
  formData: any,
  clientName: string,
): Promise<{ url: string | null; buffer: Buffer | null }> {
  let buffer: Buffer | null = null;
  try {
    buffer = await renderIntakePdfBuffer(formData, clientName);
  } catch (error) {
    console.error("[generateIntakePdf] Error generating PDF:", error);
    return { url: null, buffer: null };
  }

  let url: string | null = null;
  try {
    const fileKey = `intake-forms/${clientName.replace(/\s+/g, "-").toLowerCase()}-${randomSuffix()}.pdf`;
    const result = await storagePut(fileKey, buffer, "application/pdf");
    url = result.url;
  } catch (error) {
    console.error("[generateIntakePdf] Error uploading PDF:", error);
  }

  return { url, buffer };
}
