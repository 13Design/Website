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

1. Create a **Resend** account at <https://resend.com>.
2. **Verify a sender.** Add and verify the domain `13design.studio` (Resend →
   Domains → add DNS records). For a quick test before DNS is ready you can send
   from Resend's shared `onboarding@resend.dev`, but use your own domain for
   production so mail doesn't land in spam.
3. Create an **API key** (Resend → API Keys).
4. Set the function's secrets and deploy it (from the repo root):

   ```bash
   supabase secrets set \
     RESEND_API_KEY="re_xxxxxxxx" \
     NOTIFY_TO="hello@13design.studio" \
     NOTIFY_FROM="13 Design <notify@13design.studio>" \
     WEBHOOK_SECRET="$(openssl rand -hex 24)"

   supabase functions deploy notify-inquiry --no-verify-jwt
   ```

   Note the `WEBHOOK_SECRET` value you generated — you'll paste it in the next
   step. (View it later with `supabase secrets list` shows only names, so keep a
   copy now.)
5. Wire up **Database Webhooks** so an insert triggers the function. In the
   Supabase dashboard → **Database → Webhooks → Create a new hook**, do this
   **twice**, once per table:
   - **Table:** `contact_inquiries` (then repeat for `founder_inquiries`)
   - **Events:** Insert
   - **Type:** Supabase Edge Functions → `notify-inquiry`
   - **HTTP Headers:** add `x-webhook-secret` = the `WEBHOOK_SECRET` value
   - Save.

Now every submission POSTs the row to the function, which emails `NOTIFY_TO`
with a formatted summary and a "Reply to sender" button.

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

1. Netlify → **Domain management → Add a domain** → enter `13design.studio`.
2. Follow Netlify's DNS instructions — either point your registrar's
   nameservers at Netlify, or add the CNAME/A records they show.
3. Netlify auto-provisions the HTTPS certificate once DNS resolves (minutes to
   a couple hours).
4. If you verified your email domain in Resend at a different DNS provider, make
   sure those records still exist after any nameserver change.

---

## Quick reference — what lives where

| Concern            | Where                                                    |
| ------------------ | -------------------------------------------------------- |
| Frontend hosting   | Netlify (`netlify.toml`)                                 |
| Form data          | Supabase tables (`supabase/migrations/`)                 |
| Email delivery     | Resend, via `supabase/functions/notify-inquiry`          |
| Frontend env vars  | Netlify env vars + local `.env.local` (`.env.example`)   |
| Function secrets   | `supabase secrets set ...` (not in the repo)             |
| Spam protection    | Honeypot field in both forms (in code)                   |
