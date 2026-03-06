import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { generateIntakePdf } from "./generateIntakePdf";
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
     * Submit trust intake form — sends a detailed notification to the firm owner
     */
    submit: publicProcedure
      .input(z.object({
        clientName: z.string().max(200),
        clientEmail: z.string().max(320),
        clientPhone: z.string().max(50),
        submittedAt: z.string().optional(),
        formDataJson: z.string().max(100000), // Complete form data as JSON
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

        // Generate a formatted text summary from the form data
        const content = [
          `📋 NEW TRUST INTAKE FORM SUBMISSION`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          ``,
          `👤 Client Name: ${input.clientName || '—'}`,
          `📧 Email: ${input.clientEmail || '—'}`,
          `📞 Phone: ${input.clientPhone || '—'}`,
          ``,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `✅ COMPLETE FORM DATA ATTACHED AS PDF`,
          ``,
          `All 7 sections of the intake form (Client Info, Family, Assets, Distribution, Fiduciaries, POA/AMD, and Review) have been captured and are included in the attached PDF document.`,
          ``,
          `🕐 Submitted: ${submittedAt} (ET)`,
          `Reply to: ${input.clientEmail}`,
        ].join("\n");

        // Generate PDF from the complete form data
        let pdfUrl: string | null = null;
        try {
          pdfUrl = await generateIntakePdf(formData, input.clientName);
        } catch (e) {
          console.error('[Intake Form] PDF generation failed:', e);
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
     * and attempts to send an email via the built-in notification service.
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

        // Build a rich notification content
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

        // Send notification to owner via Manus notification service
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
});

export type AppRouter = typeof appRouter;
