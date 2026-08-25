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

### Email — Resend
Email is now the **only** notification channel. Without it, intake submissions,
contact-form messages and Calendly bookings are still written to the database
but nobody is notified.

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | [Resend](https://resend.com) → API Keys (`re_...`) |
| `EMAIL_FROM` | A verified sender on your Resend-verified domain, e.g. `Satterwhite Law Intake <intake@thesatterwhitelawfirm.com>` |
| `EMAIL_TO` | Where submissions are sent (defaults to `kelly@thesatterwhitelawfirm.com`) |

> Setup: create a Resend account, verify the domain you send from by adding the
> DNS records Resend provides, create an API key, then set the three variables.

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
