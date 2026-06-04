# Railway Environment Variables Reference

All of these must be added in Railway → your web service → **Variables** tab.

## Required Variables

### Database
| Variable | Value |
|---|---|
| `DATABASE_URL` | Paste the MySQL connection string from Railway's MySQL service (see deployment guide Step 3) |

### Authentication
| Variable | How to Get It |
|---|---|
| `JWT_SECRET` | Run `openssl rand -base64 32` in a terminal and copy the output |

### Manus OAuth (copy from Manus → Settings → Secrets)
| Variable | Notes |
|---|---|
| `VITE_APP_ID` | Your Manus app ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL |
| `OWNER_OPEN_ID` | Your Manus user ID |
| `OWNER_NAME` | Your name (e.g., Kelly Satterwhite) |

### Manus Built-in APIs (copy from Manus → Settings → Secrets)
| Variable | Notes |
|---|---|
| `BUILT_IN_FORGE_API_URL` | Used for email notifications and PDF storage |
| `BUILT_IN_FORGE_API_KEY` | Server-side API key |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend API URL |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend API key |

### App Branding
| Variable | Value |
|---|---|
| `VITE_APP_TITLE` | `The Satterwhite Law Firm, PLLC` |
| `VITE_APP_LOGO` | `https://d2xsxph8kpxj0f.cloudfront.net/310519663391034737/6bmN3gsb6FYxuS2CkK3fi8/FullLogo_1c4a4b4a.jpg` |

### Stripe Payments (from Stripe Dashboard → Developers → API Keys)
| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` (live) or `sk_test_...` (testing) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (live) or `pk_test_...` (testing) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret |

### Calendly (optional)
| Variable | Value |
|---|---|
| `CALENDLY_WEBHOOK_SECRET` | From Calendly → Integrations → Webhooks → your webhook → Signing key |

### Server
| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |

> **Note:** Do NOT set `PORT` — Railway sets this automatically.

---

## After Adding Variables

1. Railway will automatically redeploy your app
2. Run the database migration by connecting to Railway and running: `pnpm db:push`
3. Update your Stripe webhook URL to point to your Railway domain
4. Test the site end-to-end
