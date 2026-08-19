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

  This wiring now lives in a migration —
  `supabase/migrations/20260806125900_wire_inquiry_notifications.sql` — so it is
  reproducible and can't silently disappear on a project reset. The function
  reads its target URL and shared secret from database settings (no secret in
  the repo); set them once per project:

  ```sql
  alter database postgres
    set app.settings.notify_inquiry_url =
      'https://<PROJECT_REF>.supabase.co/functions/v1/notify-inquiry';
  alter database postgres
    set app.settings.notify_inquiry_secret = '<same value as WEBHOOK_SECRET>';
  ```

  Verify the triggers exist any time email stops arriving:

  ```sql
  select tgname, tgrelid::regclass from pg_trigger
  where tgname in ('notify_contact_insert', 'notify_founder_insert');
  ```

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
dashboard setup to get wrong).

Three Edge Functions run the automation end-to-end:

- **`paddle-webhook`** — on activation, onboards the client (once):
  1. records the subscription in the `subscriptions` table,
  2. creates a **private Trello board** (lists: 📥 Design requests → 🎨 In
     progress → 👀 In review → ✅ Done, plus a "Start here" card), invites the
     client by email, and adds the **design team**,
  3. registers a **Trello webhook** on that board (→ `trello-webhook`),
  4. creates a **private Slack channel** `#<client>-design`, invites the design
     team, adds the client (Slack Connect if external) or falls back to the
     standing invite link, and posts a welcome message,
  5. sends the client a **welcome email** (Resend) with Trello + Slack links,
  6. pings the studio channel + emails the studio.
- **`slack-events`** — the client files requests with the `/design-request`
  slash command or the "Create design request" message shortcut → a Trello card
  is created in 📥 Design requests, assigned to the default designer, with an
  **SLA due date** (Lite 2 business days; Standard / Product Partner next
  business day), and a confirmation posted in the channel. Also handles the
  **Approve** button (see completion below).
- **`trello-webhook`** — a card moving between lists posts a status ping to the
  client's Slack channel; moving a card to **✅ Done** posts a completion message
  with the final files and an **Approve** button. Approving marks the request
  approved and **archives the card**.

Onboarding runs exactly once per subscription (`onboarded_at` guard); the
ongoing webhooks are idempotent too (Slack/Trello redelivery is deduped via
`processed_events`, completion via `design_requests.completed_notified_at`). If
an onboarding step fails, the studio email lists what needs manual follow-up
instead of retrying into duplicate boards/channels.

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
   boards are created under your account and clients are invited from it. On the
   same page, copy the **OAuth secret** shown next to the API key — that's
   `TRELLO_API_SECRET`, used to verify webhook signatures. (This is NOT the
   token; without it, `trello-webhook` rejects every event.)
3. Find each designer's **Trello member id**
   (`https://api.trello.com/1/members/<username>?key=…&token=…` → `id`). These
   go in `DESIGN_TEAM_TRELLO_MEMBER_IDS` (comma-separated) and are added to every
   new client board; the first (or `DEFAULT_DESIGNER_TRELLO_ID`) is auto-assigned
   to new request cards.
4. No manual "Trello app for Slack" step is needed — `trello-webhook` handles
   card→Slack sync itself, per board, registered automatically at onboarding.

### 8c — Slack app

Create one Slack app at <https://api.slack.com/apps> ("From scratch"), install
it to the workspace, and copy the **Bot User OAuth Token** (`xoxb-…` →
`SLACK_BOT_TOKEN`) and the **Signing Secret** (→ `SLACK_SIGNING_SECRET`).

1. **OAuth & Permissions → Bot Token Scopes:** `channels:manage`,
   `groups:write`, `channels:read`, `groups:read`, `chat:write`, `users:read`,
   `users:read.email`, `commands`. (Adding external clients to their channel
   uses Slack Connect, which needs a paid plan; without it, onboarding falls
   back to the standing invite link.)
2. **Slash Commands → Create New Command:** `/design-request`, Request URL
   `https://<ref>.supabase.co/functions/v1/slack-events`, short description
   "File a design request".
3. **Interactivity & Shortcuts:** turn on, Request URL = the same
   `slack-events` URL. Add a **shortcut** of type *On messages* named
   "Create design request" (callback id can be anything — the function keys off
   the payload type, not the callback id).
4. **Event Subscriptions:** optional. If you enable it, use the same
   `slack-events` URL — the function answers the verification handshake and
   ignores the rest.
5. Find each designer's **Slack user id** (profile → More → Copy member ID) for
   `DESIGN_TEAM_SLACK_USER_IDS` (comma-separated) — they're invited to every new
   client channel. Optionally set `STUDIO_SLACK_CHANNEL_ID` (an internal ops
   channel id) for studio alerts, and `SLACK_INVITE_URL` (a non-expiring
   workspace invite link) for the welcome email's fallback.

### 8d — Wire it up

```bash
# Database (subscriptions columns + design_requests + processed_events)
supabase db push

# Function secrets
supabase secrets set \
  PADDLE_API_KEY="pdl_…" \
  PADDLE_WEBHOOK_SECRET="pdl_ntfset_…" \
  PADDLE_ENV="sandbox" \
  TRELLO_KEY="…" TRELLO_TOKEN="…" TRELLO_WORKSPACE_ID="…" \
  TRELLO_API_SECRET="…" \
  TRELLO_WEBHOOK_CALLBACK_URL="https://<ref>.supabase.co/functions/v1/trello-webhook" \
  DESIGN_TEAM_TRELLO_MEMBER_IDS="5f…,60…" \
  DEFAULT_DESIGNER_TRELLO_ID="5f…" \
  SLACK_BOT_TOKEN="xoxb-…" \
  SLACK_SIGNING_SECRET="…" \
  DESIGN_TEAM_SLACK_USER_IDS="U01…,U02…" \
  STUDIO_SLACK_CHANNEL_ID="C01…" \
  SLACK_INVITE_URL="https://join.slack.com/t/…"

# Deploy all four functions (Paddle/Slack/Trello sign their own requests;
# no Supabase JWT). --use-api avoids the Docker-based bundler (see gotchas).
supabase functions deploy paddle-webhook --no-verify-jwt --use-api
supabase functions deploy paddle-portal-session --no-verify-jwt --use-api
supabase functions deploy slack-events --no-verify-jwt --use-api
supabase functions deploy trello-webhook --no-verify-jwt --use-api
```

> `TRELLO_WEBHOOK_CALLBACK_URL` must be byte-identical to the URL Trello has
> stored for each board webhook — it's part of the signed payload. `paddle-webhook`
> registers webhooks with this value and `trello-webhook` verifies against it, so
> setting it once (shared across functions) keeps them in sync. If you change it
> later, existing boards' webhooks keep pointing at the old URL and stop
> verifying — re-register them.

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
3. Confirm onboarding: `subscriptions` row created + `onboarded_at` set, Trello
   board exists with the client invited **and the design team added**, a Slack
   channel `#<client>-design` created with the team invited + welcome message,
   welcome email sent, studio email received.
4. Confirm the **request workflow**: in the client channel, run
   `/design-request Test request` → a card appears in 📥 Design requests,
   assigned + due-dated, with a confirmation in the channel. A `design_requests`
   row exists.
5. Confirm the **status + completion workflow**: drag the card across lists →
   status pings post in the channel; drag it to ✅ Done → a completion message
   with the **Approve** button posts. Click Approve → the card archives and the
   message updates to "Approved".
6. Cancel from the portal and confirm the row updates + "set to cancel" alert.

> **Request intake:** the Slack slash command / message shortcut and adding
> cards directly in Trello are both live. A **website request form** (posting to
> an edge function that creates the card) is scaffolded for but not built —
> `design_requests.source` already allows `'form'`. Ask if you want it added.

---

## Quick reference — what lives where

| Concern            | Where                                                    |
| ------------------ | -------------------------------------------------------- |
| Frontend hosting   | Netlify (`netlify.toml`)                                 |
| Form data          | Supabase tables (`supabase/migrations/`)                 |
| Email delivery     | Resend, via `supabase/functions/notify-inquiry`          |
| Subscriptions      | Paddle overlay checkout (`src/lib/checkout.ts`)          |
| Post-subscribe onboarding | `supabase/functions/paddle-webhook` (Trello board + Slack channel + welcome email) |
| Request intake (Slack)    | `supabase/functions/slack-events` (`/design-request`, shortcut, Approve button) |
| Card ↔ Slack sync         | `supabase/functions/trello-webhook` (status pings + completion/approval) |
| Shared automation code    | `supabase/functions/_shared/` (config, trello, slack, email, db) |
| Billing portal     | `supabase/functions/paddle-portal-session`               |
| Frontend env vars  | Netlify env vars + local `.env.local` (`.env.example`)   |
| Function secrets   | `supabase secrets set ...` (not in the repo)             |
| Spam protection    | Honeypot field in both forms (in code)                   |
