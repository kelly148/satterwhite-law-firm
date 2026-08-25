# Platform decoupling — what changed and why

The site was built on a hosted AI app platform and inherited four dependencies
on it: login, owner notifications, PDF storage, and image hosting. That account
no longer exists, so each one was replaced with something this repo owns
outright. Nothing about the public-facing design or copy changed.

## 1. Login

**Was:** OAuth round-trip to the platform's identity portal.
**Now:** `POST /api/admin/login` with a password, at `/admin/login`.

The session layer itself is untouched — same HS256 JWT, same cookie, same
`protectedProcedure` / `adminProcedure` guards. Only the issuing step changed.

- The password is stored as a scrypt digest in `ADMIN_PASSWORD_HASH`, never in
  plaintext. Generate it with `node scripts/hash-password.mjs '<password>'`.
- Comparison is constant-time; failed attempts are rate limited to 10 per IP per
  15 minutes.
- Login fails with a clear 503 if the database is unreachable, rather than
  handing back a cookie that silently fails on every admin page.
- Sessions last 14 days (down from a year).

Deleted: `server/_core/oauth.ts`, `server/_core/types/manusTypes.ts`,
`client/src/components/ManusDialog.tsx`, and the remote user-sync fallback in
`sdk.authenticateRequest` — a signed session whose openId has no matching row is
now rejected instead of provisioning an account on the fly.

## 2. Notifications

**Was:** the platform's "Forge" notification service.
**Now:** transactional email over SMTP through the firm's existing Google
Workspace mailbox, authenticated with a Google App Password. No third-party
email vendor, and no new DNS records: the domain's existing SPF and DKIM
already authorize Google to send for it.

`notifyOwner()` keeps its exact signature, so every call site is unchanged. It
returns `false` and logs a warning when no email channel is configured, instead
of throwing.

## 3. Intake PDFs

**Was:** rendered, uploaded to platform object storage, and linked by public URL.
**Now:** never uploaded anywhere.

- The complete submission is already persisted as JSON, so the PDF is
  regenerated on demand at `GET /api/intake/:id/pdf` (admin only). There is no
  stored file to go stale or leak.
- On submit, the bytes go out as an email attachment to the firm, and are
  returned to the submitting browser so the client can save their own copy from
  a local blob URL.
- "Send to client" now regenerates the PDF and emails it to the client directly
  as an attachment, instead of asking the attorney to forward a link by hand.

The `intakeSubmissions.pdfUrl` column is left in place for historical rows but
is no longer written.

## 4. Images

**Was:** all six images served from the platform's CDN.
**Now:** served from `client/public/assets/`.

The CDN bucket returns 403, so the original photographs could not be recovered.

- `logo.png` is the real firm logo, restored from a local copy.
- `hero.jpg`, `consultation.jpg`, `family.jpg`, `virginia.jpg` and
  `documents.jpg` are **plain brand-coloured placeholder panels**. They need to
  be replaced with real photography. Drop replacements into
  `client/public/assets/` under the same filenames; nothing else needs editing.

All image paths live in one module, `client/src/assets.ts`.

## 5. Domain

Canonical URL moved from the platform-registered domain to
`www.thesatterwhitelawfirm.com`. If you change it again, update these four
places:

- `client/src/pages/Home.tsx` → `CANONICAL_URL`
- `client/index.html` → canonical link, `og:url`, `og:image`, `twitter:image`
- `client/public/sitemap.xml` → every `<loc>`
- `client/public/robots.txt` → the `Sitemap:` line

`/admin/` is now disallowed in robots.txt.

## Verified

- `pnpm check` — clean
- `pnpm build` — clean
- `pnpm test` — 48 passing (7 new, covering password hashing and verification)
- Full login loop exercised against a live MySQL: anonymous requests denied,
  wrong password rejected, correct password issues a working admin session,
  owner row created with the admin role, logout revokes access.
