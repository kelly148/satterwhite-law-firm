# Environment Variables Reference

Set these in Railway → your web service → **Variables** tab.

> **Changed in the platform-decoupling pass:** every `VITE_OAUTH_*`,
> `BUILT_IN_FORGE_*` and `VITE_FRONTEND_FORGE_*` variable is gone. The app no
> longer talks to any external platform for login, notifications, or file
> storage. If you are re-deploying an old environment, delete those variables.

## Required

### Database
| Variable | Value |
|---|---|
| `DATABASE_URL` | MySQL connection string from Railway's MySQL service |

### Sessions
| Variable | How to get it |
|---|---|
| `JWT_SECRET` | `openssl rand -base64 32`. Must be at least 32 characters or the server refuses to start in production. |

### Admin login
| Variable | How to get it |
|---|---|
| `ADMIN_PASSWORD_HASH` | `node scripts/hash-password.mjs '<your password>'` — paste the whole `scrypt:...:...` string. The plaintext password is never stored. |

Sign in at `/admin/login`. Without `ADMIN_PASSWORD_HASH` the admin pages are
unreachable (the server logs a warning at startup).

### Email — Google Workspace SMTP
Email is the **only** notification channel. Without it, intake submissions,
contact-form messages and Calendly bookings are still written to the database
but nobody is notified.

Mail goes out through the firm's existing Google Workspace mailbox over SMTP,
authenticated with a Google **App Password** rather than the account password.
No third-party email vendor is involved, and no new DNS records are needed —
the domain's existing SPF (`include:_spf.google.com`) and DKIM already cover it.

| Variable | Value |
|---|---|
| `SMTP_USER` | The full mailbox address that authenticates, e.g. `kelly@thesatterwhitelawfirm.com` |
| `SMTP_PASS` | A Google App Password. Google shows it as four blocks of four characters; spaces are stripped automatically, so paste it either way. |
| `EMAIL_FROM` | The From header, e.g. `Satterwhite Law Intake <kelly@thesatterwhitelawfirm.com>` |
| `EMAIL_TO` | Where submissions are sent (defaults to `kelly@thesatterwhitelawfirm.com`) |

Optional, only if moving off Google:

| Variable | Default | Notes |
|---|---|---|
| `SMTP_HOST` | `smtp.gmail.com` | Any SMTP server works. |
| `SMTP_PORT` | `465` | 465 uses implicit TLS; 587 negotiates STARTTLS. |

> **Generating the App Password:** 2-Step Verification must be on for the
> account first. Then Google Account → Security → 2-Step Verification → App
> passwords → create one named e.g. "Satterwhite website".
>
> **On the From address:** Gmail rewrites the From header to the authenticating
> account unless the address is a verified "Send mail as" alias. Keep the
> address in `EMAIL_FROM` the same as `SMTP_USER` unless you have set up an
> alias deliberately. A mismatch is logged at send time, not treated as an error.
>
> **Sending limits:** Workspace accounts are capped at roughly 2,000 recipients
> per day, far above what intake notifications will use.

### Stripe
| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → your endpoint → Signing secret |

### Server
| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |

> Do **not** set `PORT` — Railway assigns it.

## Optional

| Variable | Default | Notes |
|---|---|---|
| `OWNER_NAME` | `Kelly Satterwhite` | Display name on the admin session |
| `OWNER_EMAIL` | `kelly@thesatterwhitelawfirm.com` | Stored on the owner record |
| `OWNER_OPEN_ID` | `owner` | Internal id for the single admin account. Changing it after first login creates a second account. |
| `VITE_APP_ID` | `satterwhite-law` | Session token audience claim. Changing it invalidates existing sessions. |
| `CALENDLY_WEBHOOK_SECRET` | — | Calendly → Integrations → Webhooks → signing key |

## After adding variables

1. Railway redeploys automatically.
2. Run the migration: `pnpm db:push`.
3. Sign in once at `/admin/login` to create the owner record.
4. Point the Stripe webhook at `https://<your-domain>/api/stripe/webhook`.
5. Point the Calendly webhook at `https://<your-domain>/api/calendly/webhook`.
6. Test end to end.
