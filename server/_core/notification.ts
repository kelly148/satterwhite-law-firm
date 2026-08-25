/**
 * notification.ts — owner notifications.
 *
 * Historically these were dispatched through the Manus "Forge" notification
 * service. That platform is no longer in use, so notifications now go out as
 * plain transactional email via Resend (see server/email.ts).
 *
 * The exported signature is unchanged so every existing call site keeps working:
 * `true` means the message was handed off to Resend, `false` means no email
 * channel is configured or the send failed. Callers already treat `false` as
 * "not delivered" and log accordingly. Validation problems still throw, so a
 * malformed payload surfaces as a TRPC error rather than a silent drop.
 */

import { TRPCError } from "@trpc/server";
import { isEmailConfigured, sendEmail } from "../email";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
};

/**
 * Send a notification to the firm owner. Returns true when Resend accepted the
 * message.
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  if (!isEmailConfigured()) {
    console.warn(
      "[Notification] No email channel configured — set RESEND_API_KEY and EMAIL_FROM " +
        `so owner notifications are delivered. Dropped notification: "${title}"`
    );
    return false;
  }

  return sendEmail({ subject: title, text: content });
}
