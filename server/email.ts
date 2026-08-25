/**
 * email.ts — Transactional email over SMTP.
 *
 * Sends through Google Workspace (smtp.gmail.com) by default, authenticating
 * with an App Password rather than the account password. Any other SMTP
 * provider works by pointing SMTP_HOST / SMTP_PORT elsewhere.
 *
 * Used to deliver the completed intake PDF to the firm as a real attachment,
 * and to notify the owner of contact messages and consultation bookings.
 *
 * Required environment variables:
 *   SMTP_USER   — the mailbox that authenticates, e.g. kelly@thesatterwhitelawfirm.com
 *   SMTP_PASS   — a Google App Password. Google displays it as four blocks of
 *                 four characters; the spaces are cosmetic and are stripped here,
 *                 so either form works.
 *   EMAIL_FROM  — the From header, e.g. "Satterwhite Law <kelly@thesatterwhitelawfirm.com>"
 *
 * Optional:
 *   SMTP_HOST   — defaults to smtp.gmail.com
 *   SMTP_PORT   — defaults to 465 (implicit TLS). Use 587 for STARTTLS.
 *   EMAIL_TO    — where submissions go (defaults to kelly@thesatterwhitelawfirm.com)
 *
 * Note on the From header: Gmail rewrites it to the authenticating account
 * unless the address is a verified "Send mail as" alias on that account. So
 * EMAIL_FROM should normally carry the same address as SMTP_USER. A mismatch is
 * logged once rather than rejected, because aliases are a legitimate setup.
 *
 * If SMTP is not configured, isEmailConfigured() returns false and callers
 * degrade gracefully — submissions are still stored, they just aren't announced.
 */

import nodemailer, { type Transporter } from "nodemailer";

const DEFAULT_HOST = "smtp.gmail.com";
const DEFAULT_PORT = 465;
const DEFAULT_TO = "kelly@thesatterwhitelawfirm.com";

export type EmailAttachment = {
  filename: string;
  content: Buffer;
};

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

/**
 * Google prints App Passwords in four space-separated blocks. The spaces are
 * display only and must not reach the SMTP AUTH exchange.
 */
export function normalizeAppPassword(value: string): string {
  return value.replace(/\s+/g, "");
}

/** Pull the bare address out of either "a@b.com" or "Name <a@b.com>". */
export function extractAddress(value: string): string {
  const angled = value.match(/<([^>]+)>/);
  return (angled ? angled[1] : value).trim().toLowerCase();
}

/**
 * Read SMTP settings from the environment. Returns null when the mandatory
 * three are not all present, which is what isEmailConfigured() reports on.
 */
export function resolveSmtpConfig(
  env: NodeJS.ProcessEnv = process.env
): SmtpConfig | null {
  const user = (env.SMTP_USER ?? "").trim();
  const pass = normalizeAppPassword(env.SMTP_PASS ?? "");
  const from = (env.EMAIL_FROM ?? "").trim();

  if (!user || !pass || !from) return null;

  const parsedPort = Number.parseInt((env.SMTP_PORT ?? "").trim(), 10);
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : DEFAULT_PORT;

  return {
    host: (env.SMTP_HOST ?? "").trim() || DEFAULT_HOST,
    port,
    // 465 is implicit TLS; everything else (587) negotiates STARTTLS.
    secure: port === 465,
    user,
    pass,
    from,
  };
}

export function isEmailConfigured(): boolean {
  return resolveSmtpConfig() !== null;
}

// ── Transport ─────────────────────────────────────────────────────────────────
// Created lazily and reused, so importing this module never opens a connection
// and local tooling runs without SMTP credentials present.

let _transporter: Transporter | null = null;
let _transporterKey = "";

function getTransporter(config: SmtpConfig): Transporter {
  const key = `${config.host}:${config.port}:${config.user}`;
  if (!_transporter || _transporterKey !== key) {
    _transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
    _transporterKey = key;
  }
  return _transporter;
}

let _warnedAboutFrom = false;

function warnOnFromMismatch(config: SmtpConfig): void {
  if (_warnedAboutFrom) return;
  if (extractAddress(config.from) !== extractAddress(config.user)) {
    _warnedAboutFrom = true;
    console.warn(
      `[Email] EMAIL_FROM (${extractAddress(config.from)}) differs from SMTP_USER ` +
        `(${extractAddress(config.user)}). Gmail will rewrite the From header unless ` +
        "that address is a verified \"Send mail as\" alias on the account."
    );
  }
}

export async function sendEmail(opts: {
  subject: string;
  text: string;
  to?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}): Promise<boolean> {
  const config = resolveSmtpConfig();
  if (!config) {
    console.warn(
      "[Email] SMTP_USER, SMTP_PASS or EMAIL_FROM not set — skipping email send"
    );
    return false;
  }

  warnOnFromMismatch(config);

  const to = opts.to || process.env.EMAIL_TO || DEFAULT_TO;

  try {
    await getTransporter(config).sendMail({
      from: config.from,
      to,
      subject: opts.subject,
      text: opts.text,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
      ...(opts.attachments && opts.attachments.length > 0
        ? {
            attachments: opts.attachments.map((a) => ({
              filename: a.filename,
              content: a.content,
            })),
          }
        : {}),
    });
    return true;
  } catch (error) {
    console.error(
      "[Email] SMTP send failed:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}
