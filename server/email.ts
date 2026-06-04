/**
 * email.ts — Transactional email via Resend (https://resend.com).
 *
 * Used to deliver the completed intake PDF to the firm as a real attachment —
 * something the platform notification channel cannot do.
 *
 * Required environment variables:
 *   RESEND_API_KEY  — from Resend → API Keys
 *   EMAIL_FROM      — a verified sender, e.g. "Satterwhite Law <intake@thesatterwhitelawfirm.com>"
 *   EMAIL_TO        — where submissions go (defaults to kelly@thesatterwhitelawfirm.com)
 *
 * If RESEND_API_KEY is not set, isEmailConfigured() returns false and callers
 * fall back to the existing notification channel.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export type EmailAttachment = {
  filename: string;
  content: Buffer;
};

export async function sendEmail(opts: {
  subject: string;
  text: string;
  to?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = opts.to || process.env.EMAIL_TO || "kelly@thesatterwhitelawfirm.com";

  if (!apiKey || !from) {
    console.warn("[Email] RESEND_API_KEY or EMAIL_FROM not set — skipping email send");
    return false;
  }

  const body: Record<string, unknown> = {
    from,
    to: [to],
    subject: opts.subject,
    text: opts.text,
  };
  if (opts.replyTo) body.reply_to = opts.replyTo;
  if (opts.attachments && opts.attachments.length > 0) {
    body.attachments = opts.attachments.map((a) => ({
      filename: a.filename,
      content: a.content.toString("base64"),
    }));
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[Email] Resend send failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[Email] Error calling Resend:", error);
    return false;
  }
}
