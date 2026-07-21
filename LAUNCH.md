# Launch guide — 13 Design Studio site

Everything in the **repo** is ready: production build passes, both forms have
spam protection (honeypot), Netlify SPA config is in place, and the email
notification function is written. What's left needs *your* accounts — this doc
walks through each step in order.

Target stack: **Netlify** (hosting) + **Supabase** (database + email function)
+ **Resend** (email delivery).

Prerequisites (one-time installs):

```bash
npm install -g supabase   # Supabase CLI, for migrations + edge function
```

---

## Step 1 — Supabase project + database

1. Create a project at <https://supabase.com> (free tier is fine). Pick a region
   close to your users. Save the **database password** it gives you.
2. From the project dashboard, grab two values (Project Settings → API):
   - **Project URL** → `https://<ref>.supabase.co`
   - **anon / public** key (the long `eyJ...` one — safe to expose in a frontend)
3. Apply the database tables. From the repo root:

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

   This runs the 4 files in `supabase/migrations/` and creates the
   `contact_inquiries` and `founder_inquiries` tables with row-level security
   already configured (public can submit, only you can read via the dashboard).

   *Alternative (no CLI):* open each file in `supabase/migrations/` in filename
   order, copy the SQL into the dashboard's SQL Editor, and run it.

---

## Step 2 — Push the repo changes to GitHub

The launch prep added files (honeypot, `netlify.toml`, edge function, this doc).
Commit and push them so Netlify can build from GitHub:

```bash
git add -A
git commit -m "Launch prep: spam protection, email function, deploy config"
git push origin main
```

---

## Step 3 — Deploy to Netlify

1. Go to <https://app.netlify.com> → **Add new site → Import an existing project**
   → connect GitHub → pick `13Design/Website`.
2. Build settings are auto-detected from `netlify.toml` (build = `npm run build`,
   publish = `dist`). Leave them as-is.
3. Before the first successful deploy, add the two environment variables:
   **Site configuration → Environment variables → Add**:
   - `VITE_SUPABASE_URL` = your Project URL from Step 1
   - `VITE_SUPABASE_ANON_KEY` = your anon key from Step 1
4. Trigger a deploy (**Deploys → Trigger deploy → Deploy site**). You'll get a
   live `*.netlify.app` URL. The SPA redirect is already handled, so deep links
   like `/contact` work on refresh.

> Local dev: copy `.env.example` to `.env.local` with the same two values, then
> `npm run dev`.

---

## Step 4 — Email notifications (Resend + edge function)

Without this, submissions silently pile up in the Supabase tables. This makes
every new inquiry email you.

**Status: built and verified (2026-07-14).** The function is deployed, the
secrets are set, and the database triggers are wired. A live insert produced a
real email (Resend HTTP 200). Currently running in Resend **test mode**.

How it's wired (for reference — already done):
- Secrets set on the function: `RESEND_API_KEY`, `NOTIFY_FROM`, `NOTIFY_TO`,
  `WEBHOOK_SECRET`.
- Deployed with `supabase functions deploy notify-inquiry --no-verify-jwt`.
- Instead of the dashboard "Database Webhooks" UI (which was hard to find and
  needs the secret pasted by hand), the insert→function call is done with a SQL
  trigger using `pg_net`:
  - `public.notify_inquiry_webhook()` — SECURITY DEFINER trigger function that
    calls `net.http_post(...)` to the function URL with the `x-webhook-secret`
    header.
  - Triggers `notify_contact_insert` and `notify_founder_insert` (AFTER INSERT)
    on the two tables.

### Going from test mode to production email

Right now `NOTIFY_FROM=onboarding@resend.dev` and `NOTIFY_TO` is the Resend
account owner address — in test mode Resend **only** delivers there. To send
from your own domain to any address (e.g. `hello@13design.org`):

1. In Resend → **Domains**, add `13design.org` and add the DNS records it
   shows at your DNS provider. Wait for it to verify.
2. Update the two secrets and redeploy:

   ```bash
   supabase secrets set \
     NOTIFY_FROM="13 Design <notify@13design.org>" \
     NOTIFY_TO="hello@13design.org"
   supabase functions deploy notify-inquiry --no-verify-jwt
   ```

Every submission then emails `NOTIFY_TO` a formatted summary with a "Reply to
sender" button.

---

## Step 5 — Spam protection (done + optional upgrade)

Both forms already include a **honeypot** field — invisible to humans, but bots
that auto-fill it get silently rejected before anything hits the database. No
setup needed.

If you later get spam from more sophisticated bots, the stronger fix is
Cloudflare Turnstile (a privacy-friendly, invisible CAPTCHA) verified inside an
edge function. That's a follow-up, not a launch blocker — ask and I'll wire it.

---

## Step 6 — Test before announcing

1. On the live `*.netlify.app` site, submit the **Contact** form and the
   **Founding clients** form with real-looking data.
2. Confirm each row appears: Supabase dashboard → **Table Editor** →
   `contact_inquiries` / `founder_inquiries`.
3. Confirm you received an **email** for each (check spam on first sends).
4. Refresh the page on `/contact` and `/founding-clients` directly to confirm
   the SPA redirect works (no 404).

---

## Step 7 — Attach your domain

1. Netlify → **Domain management → Add a domain** → enter `13design.org`.
2. Follow Netlify's DNS instructions — either point your registrar's
   nameservers at Netlify, or add the CNAME/A records they show.
3. Netlify auto-provisions the HTTPS certificate once DNS resolves (minutes to
   a couple hours).
4. If you verified your email domain in Resend at a different DNS provider, make
   sure those records still exist after any nameserver change.

---

## Step 8 — Subscriptions: Paddle + automated onboarding

The site sells the Lite and Standard tiers through **Paddle Billing** (overlay
checkout on the pricing page — Paddle is merchant of record, so it computes and
remits VAT/sales tax and emails receipts/invoices; there is no Stripe Tax-style
dashboard setup to get wrong). When a subscription activates, the
`paddle-webhook` function automatically:

1. records the subscription in the `subscriptions` table,
2. creates a **private Trello board** for the client (lists: 📥 Design requests
   → 🎨 In progress → 👀 In review → ✅ Done, plus a "Start here" card) and
   invites them by email,
3. sends the client a **welcome email** (Resend) with the Trello + Slack links,
4. pings your **Slack** and emails the studio.

Onboarding runs exactly once per subscription (`onboarded_at` guard); if a step
fails, the studio email lists what needs manual follow-up instead of retrying
into duplicate boards.

### 8a — Paddle account & catalog

1. Create an account at <https://paddle.com> (start in **sandbox**:
   <https://sandbox-vendors.paddle.com>). Live checkout requires Paddle's
   website verification of `13design.org` — start that early, it can take days.
2. **Catalog → Products**: create one product, e.g. "Design subscription", with
   two recurring monthly prices: **$800** (Lite) and **$2,500** (Standard).
   Copy both `pri_…` ids.
3. **Developer tools → Authentication**: create an **API key** (server secret)
   and a **client-side token** (`test_…`/`live_…`, public).
4. **Developer tools → Notifications**: add a destination pointing at
   `https://<ref>.supabase.co/functions/v1/paddle-webhook` with events
   `subscription.created`, `subscription.activated`, `subscription.updated`,
   `subscription.canceled`, `transaction.completed`,
   `transaction.payment_failed`. Copy the endpoint's **secret key** —
   ⚠️ recreating the endpoint later mints a NEW secret; update the Supabase
   secret when you do, or every event fails signature verification.
5. **Checkout → Website approval**: add your domain(s) — required for the
   overlay to open outside sandbox.

### 8b — Trello

1. From the studio's Trello account, create (or pick) a workspace for client
   boards, e.g. "13 Design Clients". Get its id from the workspace URL or
   `https://api.trello.com/1/organizations/<name>?key=…&token=…`.
2. Get an API key + token at <https://trello.com/power-ups/admin> (create a
   Power-Up, then generate a token authorized as you). The token acts as *you*:
   boards are created under your account and clients are invited from it.
3. Slack integration for requests: install the **Trello app for Slack**
   (<https://trello.com/platforms/slack>) in your workspace and link the client
   boards to your channel — card activity then flows into Slack. (This is a
   per-workspace, one-time manual setup; the API can't do it.)

### 8c — Slack

1. Studio alerts: create an **incoming webhook** at
   <https://api.slack.com/apps> (Incoming Webhooks → pick your channel) —
   that's `SLACK_WEBHOOK_URL`.
2. Client invites: create a standing **invite link** (Slack → workspace name →
   Invite people → copy invite link; set it to not expire) — that's
   `SLACK_INVITE_URL`. It goes into the welcome email. Skip it and the email
   simply omits the Slack step.

### 8d — Wire it up

```bash
# Database (adds paddle/onboarding columns to subscriptions)
supabase db push

# Function secrets
supabase secrets set \
  PADDLE_API_KEY="pdl_…" \
  PADDLE_WEBHOOK_SECRET="pdl_ntfset_…" \
  PADDLE_ENV="sandbox" \
  TRELLO_KEY="…" TRELLO_TOKEN="…" TRELLO_WORKSPACE_ID="…" \
  SLACK_WEBHOOK_URL="https://hooks.slack.com/services/…" \
  SLACK_INVITE_URL="https://join.slack.com/t/…"

# Deploy both functions (Paddle signs requests; no Supabase JWT)
supabase functions deploy paddle-webhook --no-verify-jwt
supabase functions deploy paddle-portal-session --no-verify-jwt
```

Frontend env (Netlify → Environment variables, and `.env.local` for dev —
all four are public client-side values):

- `VITE_PADDLE_ENV` = `sandbox` (→ `production` at go-live)
- `VITE_PADDLE_CLIENT_TOKEN` = `test_…` / `live_…`
- `VITE_PADDLE_PRICE_LITE` = `pri_…`
- `VITE_PADDLE_PRICE_STANDARD` = `pri_…`

> ⚠️ The welcome email only reaches real customers once Resend is out of test
> mode (Step 4). Until then it delivers only to the Resend account owner.

### 8e — Test end-to-end (sandbox)

1. Pricing page → Subscribe → pay with Paddle's test card `4242 4242 4242 4242`
   (any future expiry / CVC).
2. Confirm: overlay success → redirect to `/subscribe/success` → "Manage
   subscription" opens the Paddle customer portal.
3. Confirm the automation: `subscriptions` row created + `onboarded_at` set,
   Trello board exists with the client invited, welcome email sent, Slack ping
   received, studio email received.
4. Cancel from the portal and confirm the row updates + "set to cancel" alert.

---

## Quick reference — what lives where

| Concern            | Where                                                    |
| ------------------ | -------------------------------------------------------- |
| Frontend hosting   | Netlify (`netlify.toml`)                                 |
| Form data          | Supabase tables (`supabase/migrations/`)                 |
| Email delivery     | Resend, via `supabase/functions/notify-inquiry`          |
| Subscriptions      | Paddle overlay checkout (`src/lib/checkout.ts`)          |
| Post-subscribe automation | `supabase/functions/paddle-webhook` (Trello + Slack + welcome email) |
| Billing portal     | `supabase/functions/paddle-portal-session`               |
| Frontend env vars  | Netlify env vars + local `.env.local` (`.env.example`)   |
| Function secrets   | `supabase secrets set ...` (not in the repo)             |
| Spam protection    | Honeypot field in both forms (in code)                   |
