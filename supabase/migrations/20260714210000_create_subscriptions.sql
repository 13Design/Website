/*
# Create subscriptions table

## Summary
Records Stripe subscriptions created through the Subscription page. Rows are
written only by the `stripe-webhook` Edge Function (service role) in response to
verified Stripe events — never by the browser.

Lite and Standard are self-serve via Stripe Checkout. Embedded is intentionally
not sold here: it stays call-first and arrives through `contact_inquiries`.

## New Tables
- `subscriptions`
  - `id`                          uuid, primary key
  - `stripe_customer_id`          text — Stripe customer
  - `stripe_subscription_id`      text, unique — the subscription (upsert key)
  - `stripe_checkout_session_id`  text — session that created it
  - `email`                       text — customer email collected at checkout
  - `name`                        text — customer name, if provided
  - `tier`                        text — 'lite' | 'standard'
  - `status`                      text — Stripe status (active, past_due, canceled…)
  - `amount_total`                integer — amount in the smallest currency unit
  - `currency`                    text
  - `current_period_end`          timestamptz — when the current period ends
  - `cancel_at_period_end`        boolean — cancellation scheduled
  - `created_at` / `updated_at`   timestamptz

## Security
- RLS enabled with **no policies at all**: anon and authenticated cannot read or
  write. Only the service role (used by the webhook, which verifies Stripe's
  signature first) can touch this table, and it bypasses RLS. Subscription and
  billing data must never be publicly readable.
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  stripe_checkout_session_id text,
  email text,
  name text,
  tier text,
  status text,
  amount_total integer,
  currency text,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Intentionally no policies: service role only.

CREATE INDEX IF NOT EXISTS subscriptions_email_idx ON subscriptions (email);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions (status);
