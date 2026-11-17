/**
 * Pieces of the intake submission that the form, the PDF, the notification
 * email and the admin view all need to agree on.
 */

/** One heading in the "Attorney flags" box, with the lines listed under it. */
export type AttorneyFlag = { label: string; items: string[] };

/**
 * Read the attorney flags off a stored submission.
 *
 * Returns null for a submission saved before flags existed, so callers can tell
 * "nothing was checked" apart from "checked, and nothing was raised" ([]). The
 * value comes from stored JSON, so its shape is verified rather than trusted.
 */
export function readAttorneyFlags(formData: unknown): AttorneyFlag[] | null {
  const raw = (formData as { attorneyFlags?: unknown } | null | undefined)
    ?.attorneyFlags;
  if (!Array.isArray(raw)) return null;
  const flags: AttorneyFlag[] = [];
  for (const entry of raw) {
    const label = typeof entry?.label === "string" ? entry.label.trim() : "";
    const items = Array.isArray(entry?.items)
      ? entry.items.filter(
          (i: unknown): i is string => typeof i === "string" && i.trim() !== ""
        )
      : [];
    if (label && items.length) flags.push({ label, items });
  }
  return flags;
}

/**
 * Format a US phone number for display: "7035550123" becomes "(703) 555-0123".
 * Anything that is not plainly a 10-digit number (an extension, an email typed
 * into a phone box, an international number) is returned as entered.
 */
export function formatPhone(value: string): string {
  const raw = value.trim();
  if (!raw || /[a-z@]/i.test(raw)) return raw;
  const digits = raw.replace(/\D/g, "");
  const national =
    digits.length === 11 && digits[0] === "1" ? digits.slice(1) : digits;
  if (national.length !== 10) return raw;
  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}
