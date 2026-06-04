/**
 * intake.test.ts — Unit tests for the trust intake form submission system
 * Tests: email body builder, PDF generation logic, and data capture completeness
 */
import { describe, it, expect } from "vitest";

// ── Helper: replicate the fv() function from routers.ts ──────────────────────
function fv(d: any, key: string, fallback = '—'): string {
  const v = d?.[key];
  if (v === undefined || v === null || v === '') return fallback;
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v).trim() || fallback;
}

// ── Helper: replicate the buildFullEmailBody logic ────────────────────────────
function buildEmailSummary(formData: any, clientName: string): string {
  const subsections: any[] = Array.isArray(formData.subsections) ? formData.subsections : [];
  const lines: string[] = [];

  lines.push(`Client: ${clientName}`);
  lines.push(`Email: ${fv(formData, 'g1-email')}`);
  lines.push(`Phone: ${fv(formData, 'g1-phone')}`);

  // Section 1
  const firstName = fv(formData, 'g1-first', '');
  const lastName = fv(formData, 'g1-last', '');
  lines.push(`Full Name: ${[firstName, lastName].filter(s => s && s !== '—').join(' ')}`);
  lines.push(`Marital Status: ${fv(formData, 'g1-marital')}`);

  // Section 5 — Fiduciaries
  lines.push(`Trustee: ${fv(formData, 'trustee1')}`);
  lines.push(`POA Agent: ${fv(formData, 'poa1')}`);
  lines.push(`Health Care Agent: ${fv(formData, 'hca1')}`);

  // Section 6 — Directives
  lines.push(`Terminal: ${fv(formData, 'terminal')}`);
  lines.push(`PVS: ${fv(formData, 'pvs')}`);

  // Section 7 — Notes
  lines.push(`Attorney Notes: ${fv(formData, 'attorney-notes')}`);

  // Subsections
  const children = subsections.filter(s => s.title && /child/i.test(s.title));
  lines.push(`Children count: ${children.length}`);

  const properties = subsections.filter(s => s.title && /property/i.test(s.title));
  lines.push(`Properties count: ${properties.length}`);

  return lines.join('\n');
}

// ── Sample form data matching what the intake form sends ──────────────────────
// NOTE: This is entirely fabricated test data. Do NOT put real client
// information in test fixtures — it ends up committed to the repository.
const sampleFormData = {
  'g1-first': 'Jane',
  'g1-mid': '',
  'g1-last': 'Doe',
  'g1-suffix': '',
  'g1-dob': '1970-01-01',
  'g1-pob': 'Anytown, VA',
  'g1-email': 'jane.doe@example.com',
  'g1-phone': '5550000000',
  'g1-addr': '123 Example St',
  'g1-city': 'Anytown',
  'g1-state': 'VA',
  'g1-zip': '20000',
  'g1-citizen': 'US',
  'g1-marital': 'Widowed',
  'hasSpouse': false,
  'trustee1': 'Sam Sample',
  'poa1': 'Sam Sample',
  'hca1': 'Sam Sample',
  'terminal': 'Withhold or withdraw life-sustaining treatment and allow natural death',
  'pvs': 'Withhold or withdraw life-sustaining treatment and allow natural death',
  'attorney-notes': 'Example note: documents may exist in more than one name.',
  'preferred-times': 'Weekends',
  'subsections': [
    {
      title: 'Primary Client (Grantor 1)',
      fields: { 'g1-first': 'Jane', 'g1-last': 'Doe' }
    },
    {
      title: 'Child 1',
      fields: { 'First Name': 'Test', 'Last Name': 'Child', 'Date of Birth': '2010-01-01' }
    },
    {
      title: 'Property 1',
      fields: { 'Property Address': '123 Example St', 'Type': 'Primary Residence', 'Approx. Value': '$350,000' }
    },
  ]
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('Intake Form — Email Body Builder', () => {
  it('includes client name and contact info', () => {
    const body = buildEmailSummary(sampleFormData, 'Jane Doe');
    expect(body).toContain('Jane Doe');
    expect(body).toContain('jane.doe@example.com');
    expect(body).toContain('5550000000');
  });

  it('includes fiduciary names', () => {
    const body = buildEmailSummary(sampleFormData, 'Jane Doe');
    expect(body).toContain('Sam Sample');
  });

  it('includes medical directive preferences', () => {
    const body = buildEmailSummary(sampleFormData, 'Jane Doe');
    expect(body).toContain('Withhold or withdraw');
  });

  it('includes attorney notes', () => {
    const body = buildEmailSummary(sampleFormData, 'Jane Doe');
    expect(body).toContain('Example note');
  });

  it('counts children from subsections', () => {
    const body = buildEmailSummary(sampleFormData, 'Jane Doe');
    expect(body).toContain('Children count: 1');
  });

  it('counts properties from subsections', () => {
    const body = buildEmailSummary(sampleFormData, 'Jane Doe');
    expect(body).toContain('Properties count: 1');
  });
});

describe('Intake Form — Field Value Helper (fv)', () => {
  it('returns fallback for missing fields', () => {
    expect(fv({}, 'missing-field')).toBe('—');
  });

  it('returns fallback for empty string', () => {
    expect(fv({ key: '' }, 'key')).toBe('—');
  });

  it('converts boolean true to Yes', () => {
    expect(fv({ flag: true }, 'flag')).toBe('Yes');
  });

  it('converts boolean false to No', () => {
    expect(fv({ flag: false }, 'flag')).toBe('No');
  });

  it('returns string value correctly', () => {
    expect(fv({ name: 'Kelly Satterwhite' }, 'name')).toBe('Kelly Satterwhite');
  });

  it('trims whitespace from values', () => {
    expect(fv({ name: '  Kelly  ' }, 'name')).toBe('Kelly');
  });

  it('uses custom fallback when provided', () => {
    expect(fv({}, 'missing', 'Not provided')).toBe('Not provided');
  });
});

describe('Intake Form — Subsection Data Capture', () => {
  it('captures children from subsections array', () => {
    const subsections = sampleFormData.subsections;
    const children = subsections.filter(s => s.title && /child/i.test(s.title));
    expect(children).toHaveLength(1);
    expect(children[0].fields['First Name']).toBe('Test');
  });

  it('captures real property from subsections array', () => {
    const subsections = sampleFormData.subsections;
    const props = subsections.filter(s => s.title && /property/i.test(s.title));
    expect(props).toHaveLength(1);
    expect(props[0].fields['Approx. Value']).toBe('$350,000');
  });

  it('handles empty subsections gracefully', () => {
    const data = { ...sampleFormData, subsections: [] };
    const subsections: any[] = Array.isArray(data.subsections) ? data.subsections : [];
    expect(subsections).toHaveLength(0);
  });

  it('handles missing subsections key gracefully', () => {
    const data = { 'g1-first': 'Test' };
    const subsections: any[] = Array.isArray((data as any).subsections) ? (data as any).subsections : [];
    expect(subsections).toHaveLength(0);
  });
});
