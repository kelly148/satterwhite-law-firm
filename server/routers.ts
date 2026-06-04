import { COOKIE_NAME } from "@shared/const";
import { SERVICE_PRODUCTS, CUSTOM_MIN_CENTS, CUSTOM_MAX_CENTS } from "./stripeProducts";
import { getStripe } from "./stripeClient";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { sendEmail, isEmailConfigured } from "./email";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { generateIntakePdf } from "./generateIntakePdf";
import { intakeSubmissions, payments, consultationBookings } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
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

/**
 * Build a comprehensive plain-text summary of the submission for the email body.
 * Renders generically from the captured `sections` structure so that whatever
 * the client entered is included — no field can be silently omitted.
 */
function buildFullEmailBody(
  formData: any,
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  submittedAt: string,
  pdfUrl: string | null,
): string {
  const line = '━'.repeat(60);
  const thin = '─'.repeat(60);
  const lines: string[] = [];

  lines.push(`📋 NEW TRUST INTAKE FORM SUBMISSION`);
  lines.push(line);
  lines.push(`👤 Client: ${clientName || '—'}`);
  lines.push(`📧 Email: ${clientEmail || '—'}`);
  lines.push(`📞 Phone: ${clientPhone || '—'}`);
  lines.push(`🕐 Submitted: ${submittedAt} (ET)`);
  if (pdfUrl) {
    lines.push(`📥 PDF: ${pdfUrl}`);
  } else {
    lines.push(`⚠️  PDF generation failed — all data is in this email`);
  }
  lines.push('');

  const sections: any[] = Array.isArray(formData?.sections) ? formData.sections : [];
  if (sections.length === 0) {
    lines.push('(No detailed form data was captured for this submission.)');
  }

  sections.forEach((sec: any, idx: number) => {
    lines.push(line);
    lines.push(`SECTION ${idx + 1} — ${String(sec.title || 'Details').toUpperCase()}`);
    lines.push(thin);

    (sec.groups || []).forEach((g: any) => {
      const fields = (g.fields || []).filter((f: any) => f && f.value && String(f.value).trim() !== '');
      if (fields.length === 0) return;
      lines.push('');
      lines.push(`  ${g.title || 'Details'}`);
      fields.forEach((f: any) => lines.push(`    ${f.label || 'Field'}: ${f.value}`));
    });

    (sec.fields || []).forEach((f: any) => {
      if (!f || !f.value || String(f.value).trim() === '') return;
      lines.push(`${f.label || 'Field'}: ${f.value}`);
    });

    lines.push('');
  });

  lines.push(line);
  lines.push(`Reply to: ${clientEmail || '—'}`);

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
     * List all intake submissions — admin only
     */
    listSubmissions: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select({
          id: intakeSubmissions.id,
          clientName: intakeSubmissions.clientName,
          clientEmail: intakeSubmissions.clientEmail,
          clientPhone: intakeSubmissions.clientPhone,
          formType: intakeSubmissions.formType,
          pdfUrl: intakeSubmissions.pdfUrl,
          submittedAt: intakeSubmissions.submittedAt,
        })
        .from(intakeSubmissions)
        .orderBy(desc(intakeSubmissions.submittedAt))
        .limit(500);
    }),

    /**
     * Send the intake PDF to the client via email — admin only
     */
    sendPdfToClient: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable.");
        const rows = await db
          .select()
          .from(intakeSubmissions)
          .where(eq(intakeSubmissions.id, input.id))
          .limit(1);
        const submission = rows[0];
        if (!submission) throw new Error("Submission not found.");
        if (!submission.pdfUrl) throw new Error("No PDF available for this submission.");

        const formType = submission.formType === "llc" ? "LLC Formation" : "Estate Planning Trust";
        const emailBody = [
          `Dear ${submission.clientName},`,
          "",
          `Thank you for completing your ${formType} intake form with The Satterwhite Law Firm, PLLC.`,
          "A copy of your completed intake form is available at the link below:",
          "",
          submission.pdfUrl,
          "",
          "Our office will be in touch within one business day to discuss next steps.",
          "If you have any questions in the meantime, please don't hesitate to reach out:",
          "",
          "  Phone: (703) 855-7380",
          "  Email: kelly@thesatterwhitelawfirm.com",
          "",
          "Warm regards,",
          "Kelly Satterwhite",
          "The Satterwhite Law Firm, PLLC",
          "1605 Fort Hunt Ct, Alexandria, VA 22307",
        ].join("\n");

        // Notify the owner to forward the PDF to the client
        // (Direct client email is not available via built-in APIs; owner forwards manually)
        await notifyOwner({
          title: `Send PDF to Client — ${submission.clientName}`,
          content: [
            `Please forward the intake form PDF to the client:`,
            ``,
            `Client: ${submission.clientName}`,
            `Email: ${submission.clientEmail}`,
            `Phone: ${submission.clientPhone || "N/A"}`,
            `Form Type: ${formType}`,
            ``,
            `PDF Link: ${submission.pdfUrl}`,
            ``,
            emailBody,
          ].join("\n"),
        });
        return { success: true };
      }),

    /**
     * Get a single intake submission with full form data — admin only
     */
    getSubmission: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const rows = await db
          .select()
          .from(intakeSubmissions)
          .where(eq(intakeSubmissions.id, input.id))
          .limit(1);
        return rows[0] ?? null;
      }),

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

        // Parse the complete form data. If this fails the submission is
        // unusable, so reject it rather than silently storing an empty record.
        let formData: any;
        try {
          formData = JSON.parse(input.formDataJson);
        } catch (e) {
          console.error("[Intake Form] Failed to parse form data JSON", e);
          throw new Error("Submitted form data was invalid. Please try again or call the office.");
        }

        // Generate PDF from the complete form data — returns both the uploaded
        // URL (for the DB record / email body) and the raw bytes (to attach).
        let pdfUrl: string | null = null;
        let pdfBuffer: Buffer | null = null;
        try {
          const pdf = await generateIntakePdf(formData, input.clientName);
          pdfUrl = pdf.url;
          pdfBuffer = pdf.buffer;
        } catch (e) {
          console.error('[Intake Form] PDF generation failed:', e);
        }

        // Build comprehensive email content with ALL form data
        const content = buildFullEmailBody(
          formData,
          input.clientName,
          input.clientEmail,
          input.clientPhone,
          submittedAt,
          pdfUrl,
        );

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

        const subject = `New Trust Intake Form — ${input.clientName || 'New Client'} — Satterwhite Law`;

        // Preferred path: email the completed PDF as a real attachment (Resend).
        // Falls back to the platform notification (text + link) if email isn't
        // configured or the send fails.
        let delivered = false;
        if (isEmailConfigured()) {
          const filename = `Trust_Intake_${(input.clientName || 'Form').replace(/\s+/g, '_')}.pdf`;
          delivered = await sendEmail({
            subject,
            text: content,
            replyTo: input.clientEmail || undefined,
            attachments: pdfBuffer ? [{ filename, content: pdfBuffer }] : undefined,
          });
        }
        if (!delivered) {
          delivered = await notifyOwner({ title: subject, content });
        }

        console.log(`[Intake Form] Submission from ${input.clientName} <${input.clientEmail}> — delivered: ${delivered}, PDF: ${pdfBuffer ? 'generated' : 'failed'}`);

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
    listPayments: adminProcedure.query(async () => {
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
          customerPhone: z.string().max(50).optional(), // client phone for follow-up
          memo: z.string().max(200).optional(), // client-supplied note/memo
          matterNumber: z.string().max(50).optional(), // matter/file number for bookkeeping
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
          payment_intent_data: {
            receipt_email: input.customerEmail || undefined,
            description: input.memo
              ? `${productName} — ${input.memo}`
              : productName,
          },
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
            customer_phone: input.customerPhone || "",
            service_id: input.serviceId || "custom",
            service_name: productName,
            memo: input.memo || "",
            matter_number: input.matterNumber || "",
          },
          success_url: `${input.origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${input.origin}/pay`,
        });

        return { checkoutUrl: session.url };
      }),
  }),

  consultations: router({
    /**
     * List all Calendly consultation bookings — admin only
     */
    listBookings: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(consultationBookings)
        .orderBy(desc(consultationBookings.startTime))
        .limit(500);
    }),
  }),
});

export { appRouter as default };
export type AppRouter = typeof appRouter;
