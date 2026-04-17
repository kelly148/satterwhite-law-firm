import { COOKIE_NAME } from "@shared/const";
import Stripe from "stripe";
import { SERVICE_PRODUCTS, CUSTOM_MIN_CENTS, CUSTOM_MAX_CENTS } from "./stripeProducts";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { generateIntakePdf } from "./generateIntakePdf";
import { intakeSubmissions, payments } from "../drizzle/schema";
import { desc } from "drizzle-orm";
import { protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { z } from "zod";

// Contact form input schema
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Valid email is required").max(320),
  phone: z.string().max(30).optional(),
  service: z.string().max(100).optional(),
  message: z.string().min(10, "Please provide a brief message").max(5000),
  preferredContact: z.enum(["email", "phone", "either"]).optional(),
});

/** Helper: safely get a string value from parsed form data */
function fv(d: any, key: string, fallback = '—'): string {
  const v = d?.[key];
  if (v === undefined || v === null || v === '') return fallback;
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v).trim() || fallback;
}

/** Build a comprehensive plain-text summary of all 7 sections for the email body */
function buildFullEmailBody(formData: any, clientName: string, submittedAt: string, pdfUrl: string | null): string {
  const subsections: any[] = Array.isArray(formData.subsections) ? formData.subsections : [];

  const line = '━'.repeat(60);
  const thin = '─'.repeat(60);
  const lines: string[] = [];

  lines.push(`📋 NEW TRUST INTAKE FORM SUBMISSION`);
  lines.push(line);
  lines.push(`👤 Client: ${clientName}`);
  lines.push(`📧 Email: ${fv(formData, 'g1-email')}`);
  lines.push(`📞 Phone: ${fv(formData, 'g1-phone')}`);
  lines.push(`🕐 Submitted: ${submittedAt} (ET)`);
  if (pdfUrl) {
    lines.push(`📥 PDF: ${pdfUrl}`);
  } else {
    lines.push(`⚠️  PDF generation failed — all data is in this email`);
  }
  lines.push('');

  // ── SECTION 1: CLIENT INFORMATION ────────────────────────────────────────
  lines.push(line);
  lines.push('SECTION 1 — CLIENT INFORMATION');
  lines.push(thin);
  const firstName = fv(formData, 'g1-first', '');
  const midName = fv(formData, 'g1-mid', '');
  const lastName = fv(formData, 'g1-last', '');
  const suffix = fv(formData, 'g1-suffix', '');
  const fullName = [firstName, midName, lastName, suffix].filter(s => s && s !== '—').join(' ') || '—';
  const address = [fv(formData, 'g1-addr', ''), fv(formData, 'g1-city', ''), fv(formData, 'g1-state', ''), fv(formData, 'g1-zip', '')].filter(s => s && s !== '—').join(', ') || '—';
  lines.push(`Full Name:       ${fullName}`);
  lines.push(`Date of Birth:   ${fv(formData, 'g1-dob')}`);
  lines.push(`Place of Birth:  ${fv(formData, 'g1-pob')}`);
  lines.push(`Email:           ${fv(formData, 'g1-email')}`);
  lines.push(`Phone:           ${fv(formData, 'g1-phone')}`);
  lines.push(`Address:         ${address}`);
  lines.push(`Citizenship:     ${fv(formData, 'g1-citizen')}`);
  lines.push(`Marital Status:  ${fv(formData, 'g1-marital')}`);

  const spouseFirst = fv(formData, 'g2-first', '');
  const spouseLast = fv(formData, 'g2-last', '');
  if (spouseFirst !== '—' || spouseLast !== '—') {
    lines.push('');
    lines.push('Spouse / Partner (Grantor 2):');
    lines.push(`  Name:  ${[spouseFirst, spouseLast].filter(s => s && s !== '—').join(' ') || '—'}`);
    lines.push(`  DOB:   ${fv(formData, 'g2-dob')}`);
    lines.push(`  Email: ${fv(formData, 'g2-email')}`);
  }
  lines.push('');

  // ── SECTION 2: FAMILY & BENEFICIARIES ────────────────────────────────────
  lines.push(line);
  lines.push('SECTION 2 — FAMILY & BENEFICIARIES');
  lines.push(thin);
  const children = subsections.filter(s => s.title && (s.title.toLowerCase().includes('child') || /^child\s*\d+$/i.test(s.title)));
  if (children.length > 0) {
    lines.push(`Children (${children.length}):`);
    children.forEach((c: any) => {
      lines.push(`  ${c.title}:`);
      Object.entries(c.fields || {}).forEach(([k, v]) => {
        if (v && String(v).trim()) lines.push(`    ${k}: ${v}`);
      });
    });
  } else {
    lines.push('Children: None entered');
  }
  const otherBens = subsections.filter(s => s.title && s.title.toLowerCase().includes('beneficiar'));
  if (otherBens.length > 0) {
    lines.push('');
    lines.push(`Other Beneficiaries (${otherBens.length}):`);
    otherBens.forEach((b: any) => {
      lines.push(`  ${b.title}:`);
      Object.entries(b.fields || {}).forEach(([k, v]) => {
        if (v && String(v).trim()) lines.push(`    ${k}: ${v}`);
      });
    });
  }
  lines.push('');

  // ── SECTION 3: ASSETS & PROPERTY ─────────────────────────────────────────
  lines.push(line);
  lines.push('SECTION 3 — ASSETS & PROPERTY');
  lines.push(thin);

  const assetGroups: [string, string][] = [
    ['Real Property', 'property'],
    ['Financial Accounts', 'account'],
    ['Retirement Accounts', 'retirement'],
    ['Life Insurance', 'insurance'],
    ['Business Interests', 'business'],
    ['Other Assets', 'asset'],
  ];

  let hasAssets = false;
  assetGroups.forEach(([label, keyword]) => {
    const items = subsections.filter(s => s.title && s.title.toLowerCase().includes(keyword));
    if (items.length > 0) {
      hasAssets = true;
      lines.push(`${label} (${items.length}):`);
      items.forEach((item: any) => {
        lines.push(`  ${item.title}:`);
        Object.entries(item.fields || {}).forEach(([k, v]) => {
          if (v && String(v).trim()) lines.push(`    ${k}: ${v}`);
        });
      });
      lines.push('');
    }
  });
  if (!hasAssets) lines.push('No assets entered');
  lines.push('');

  // ── SECTION 4: DISTRIBUTION PLAN ─────────────────────────────────────────
  lines.push(line);
  lines.push('SECTION 4 — DISTRIBUTION PLAN');
  lines.push(thin);
  lines.push(`Primary Distribution: ${fv(formData, 'distType')}`);
  const bequests = subsections.filter(s => s.title && (s.title.toLowerCase().includes('bequest') || s.title.toLowerCase().includes('gift')));
  if (bequests.length > 0) {
    lines.push(`Specific Bequests (${bequests.length}):`);
    bequests.forEach((b: any) => {
      Object.entries(b.fields || {}).forEach(([k, v]) => {
        if (v && String(v).trim()) lines.push(`  ${k}: ${v}`);
      });
    });
  }
  lines.push('');

  // ── SECTION 5: FIDUCIARIES ────────────────────────────────────────────────
  lines.push(line);
  lines.push('SECTION 5 — FIDUCIARIES');
  lines.push(thin);
  lines.push(`Successor Trustee (Primary):    ${fv(formData, 'trustee1')}`);
  lines.push(`Alternate Trustee (1st):        ${fv(formData, 'trustee2')}`);
  lines.push(`Personal Representative:        ${fv(formData, 'executor1')}`);
  const guardianNeeded = fv(formData, 'needsGuardian', '');
  if (guardianNeeded === 'true' || guardianNeeded === 'on') {
    lines.push(`Guardian (Primary):             ${fv(formData, 'guardian1')}`);
    lines.push(`Guardian (Alternate):           ${fv(formData, 'guardian2')}`);
  } else {
    lines.push(`Guardian Nomination:            Not applicable`);
  }
  lines.push('');

  // ── SECTION 6: POA & MEDICAL DIRECTIVES ──────────────────────────────────
  lines.push(line);
  lines.push('SECTION 6 — POWERS OF ATTORNEY & MEDICAL DIRECTIVES');
  lines.push(thin);
  lines.push(`Financial POA Agent (Primary):  ${fv(formData, 'poa1')}`);
  lines.push(`Financial POA Agent (Alternate):${fv(formData, 'poa2')}`);
  lines.push(`Health Care Agent (Primary):    ${fv(formData, 'hca1')}`);
  lines.push(`Health Care Agent (Alternate):  ${fv(formData, 'hca2')}`);
  lines.push(`Terminal Condition:             ${fv(formData, 'terminal')}`);
  lines.push(`Persistent Vegetative State:    ${fv(formData, 'pvs')}`);
  const hipaa = subsections.filter(s => s.title && s.title.toLowerCase().includes('hipaa'));
  if (hipaa.length > 0) {
    lines.push('HIPAA Authorized Individuals:');
    hipaa.forEach((h: any) => {
      Object.entries(h.fields || {}).forEach(([k, v]) => {
        if (v && String(v).trim()) lines.push(`  ${k}: ${v}`);
      });
    });
  }
  lines.push('');

  // ── SECTION 7: NOTES & PREFERENCES ───────────────────────────────────────
  lines.push(line);
  lines.push('SECTION 7 — NOTES & PREFERENCES');
  lines.push(thin);
  lines.push(`Attorney Notes:`);
  lines.push(fv(formData, 'attorney-notes', 'None provided'));
  lines.push('');
  lines.push(`Preferred Consultation Times:   ${fv(formData, 'preferred-times')}`);
  lines.push(`Preferred Consultation Method:  ${fv(formData, 'consult')}`);
  lines.push('');
  lines.push(line);
  lines.push(`Reply to: ${fv(formData, 'g1-email')}`);

  return lines.join('\n');
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  intake: router({
    /**
     * Submit trust intake form — generates PDF, stores in DB, sends full notification
     */
    submit: publicProcedure
      .input(z.object({
        clientName: z.string().max(200),
        clientEmail: z.string().max(320),
        clientPhone: z.string().max(50),
        submittedAt: z.string().optional(),
        formDataJson: z.string().max(200000), // Complete form data as JSON
      }))
      .mutation(async ({ input }) => {
        const submittedAt = input.submittedAt || new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
          dateStyle: "full",
          timeStyle: "short",
        });

        // Parse the complete form data
        let formData: any = {};
        try {
          formData = JSON.parse(input.formDataJson);
        } catch (e) {
          console.error("Failed to parse form data JSON", e);
        }

        // Generate PDF from the complete form data
        let pdfUrl: string | null = null;
        try {
          pdfUrl = await generateIntakePdf(formData, input.clientName);
        } catch (e) {
          console.error('[Intake Form] PDF generation failed:', e);
        }

        // Build comprehensive email content with ALL form data
        const content = buildFullEmailBody(formData, input.clientName, submittedAt, pdfUrl);

        // Store the submission in the database
        try {
          const db = await getDb();
          if (db) {
            await db.insert(intakeSubmissions).values({
              clientName: input.clientName,
              clientEmail: input.clientEmail,
              clientPhone: input.clientPhone,
              formDataJson: input.formDataJson,
              pdfUrl: pdfUrl || undefined,
              pdfGenerated: pdfUrl ? new Date() : undefined,
            });
          }
        } catch (e) {
          console.error('[Intake Form] Failed to store submission in database:', e);
        }

        // Send the notification
        const notified = await notifyOwner({
          title: `New Trust Intake Form — ${input.clientName || 'New Client'} — Satterwhite Law`,
          content,
        });

        console.log(`[Intake Form] Submission from ${input.clientName} <${input.clientEmail}> — notified: ${notified}, PDF: ${pdfUrl ? 'generated' : 'failed'}`);

        return { success: true, pdfUrl };
      }),
  }),

  llcIntake: router({
    /**
     * Submit LLC formation intake form — sends a detailed notification to the firm owner
     */
    submit: publicProcedure
      .input(z.object({
        clientFirst: z.string().max(100),
        clientLast: z.string().max(100),
        clientEmail: z.string().max(320),
        clientPhone: z.string().max(50),
        clientAddress: z.string().max(500),
        llcName: z.string().max(300),
        llcType: z.string().max(100),
        llcState: z.string().max(50),
        llcAddress: z.string().max(500),
        memberCount: z.string().max(50),
        managerName: z.string().max(200),
      }))
      .mutation(async ({ input }) => {
        const submittedAt = new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
          dateStyle: "full",
          timeStyle: "short",
        });

        const clientName = [input.clientFirst, input.clientLast].filter(Boolean).join(" ") || "—";

        const content = [
          `🏢 NEW LLC FORMATION INTAKE FORM SUBMISSION`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          ``,
          `👤 Client Name: ${clientName}`,
          `📧 Email: ${input.clientEmail || '—'}`,
          `📞 Phone: ${input.clientPhone || '—'}`,
          `🏠 Client Address: ${input.clientAddress || '—'}`,
          ``,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `🏛️  ENTITY DETAILS`,
          ``,
          `LLC Name: ${input.llcName || '—'}`,
          `Entity Type: ${input.llcType || '—'}`,
          `State of Formation: ${input.llcState || '—'}`,
          `Principal Address: ${input.llcAddress || '—'}`,
          `Number of Members: ${input.memberCount || '—'}`,
          `Primary Manager: ${input.managerName || '—'}`,
          ``,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `🕐 Submitted: ${submittedAt} (ET)`,
          `Reply to: ${input.clientEmail}`,
        ].join("\n");

        const notified = await notifyOwner({
          title: `New LLC Formation Intake — ${clientName} — Satterwhite Law`,
          content,
        });

        console.log(`[LLC Intake Form] Submission from ${clientName} <${input.clientEmail}> — notified: ${notified}`);

        return { success: true };
      }),
  }),

  contact: router({
    /**
     * Submit contact form — sends a notification to the firm owner
     */
    submit: publicProcedure
      .input(contactFormSchema)
      .mutation(async ({ input }) => {
        const { name, email, phone, service, message, preferredContact } = input;

        const submittedAt = new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
          dateStyle: "full",
          timeStyle: "short",
        });

        const notificationContent = [
          `📋 NEW CONTACT FORM SUBMISSION`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          ``,
          `👤 Name: ${name}`,
          `📧 Email: ${email}`,
          phone ? `📞 Phone: ${phone}` : null,
          service ? `⚖️  Service Needed: ${service}` : null,
          preferredContact ? `📬 Preferred Contact: ${preferredContact}` : null,
          ``,
          `💬 Message:`,
          `${message}`,
          ``,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `🕐 Submitted: ${submittedAt} (ET)`,
          ``,
          `Reply directly to: ${email}`,
        ]
          .filter(line => line !== null)
          .join("\n");

        const notified = await notifyOwner({
          title: `New Consultation Request from ${name} — Satterwhite Law Firm`,
          content: notificationContent,
        });

        console.log(`[Contact Form] Submission from ${name} <${email}> — notified: ${notified}`);

        return {
          success: true,
          message: "Your message has been received. Kelly Satterwhite will be in touch within one business day.",
        };
      }),
  }),

  payment: router({
    /**
     * List all available services/products for the payment page
     */
    listServices: publicProcedure.query(() => {
      return SERVICE_PRODUCTS;
    }),

    /**
     * List all completed payments — admin only
     */
    listPayments: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required.");
      }
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(payments)
        .orderBy(desc(payments.paidAt))
        .limit(500);
    }),

    /**
     * Create a Stripe Checkout Session for a selected service or custom amount
     */
    createCheckout: publicProcedure
      .input(
        z.object({
          serviceId: z.string().optional(), // one of SERVICE_PRODUCTS[].id
          customAmountCents: z.number().int().optional(), // for custom amounts
          customerName: z.string().max(200).optional(),
          customerEmail: z.string().email().max(320).optional(),
          origin: z.string().url(), // window.location.origin from frontend
        })
      )
      .mutation(async ({ input }) => {
        const stripe = getStripe();
        if (!stripe) {
          throw new Error("Payment processing is not configured. Please contact the office.");
        }

        let amount: number;
        let productName: string;
        let productDescription: string;

        if (input.serviceId) {
          const product = SERVICE_PRODUCTS.find(p => p.id === input.serviceId);
          if (!product) throw new Error("Unknown service selected.");
          amount = product.amount;
          productName = product.name;
          productDescription = product.description;
        } else if (input.customAmountCents) {
          if (input.customAmountCents < CUSTOM_MIN_CENTS) {
            throw new Error(`Minimum payment is $${CUSTOM_MIN_CENTS / 100}.`);
          }
          if (input.customAmountCents > CUSTOM_MAX_CENTS) {
            throw new Error(`Maximum payment is $${CUSTOM_MAX_CENTS / 100}.`);
          }
          amount = input.customAmountCents;
          productName = "Legal Services Payment";
          productDescription = "Payment to The Satterwhite Law Firm, PLLC";
        } else {
          throw new Error("Please select a service or enter a custom amount.");
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          allow_promotion_codes: true,
          customer_email: input.customerEmail || undefined,
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: amount,
                product_data: {
                  name: productName,
                  description: productDescription,
                  images: [
                    "https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg",
                  ],
                },
              },
              quantity: 1,
            },
          ],
          metadata: {
            customer_name: input.customerName || "",
            customer_email: input.customerEmail || "",
            service_id: input.serviceId || "custom",
            service_name: productName,
          },
          success_url: `${input.origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${input.origin}/pay`,
        });

        return { checkoutUrl: session.url };
      }),
  }),
});

// ── Stripe payment router ─────────────────────────────────────────────────────
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

export { appRouter as default };
export type AppRouter = typeof appRouter;
