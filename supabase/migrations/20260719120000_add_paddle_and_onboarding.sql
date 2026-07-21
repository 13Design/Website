/*
# Move subscriptions from Stripe to Paddle + record onboarding

## Summary
The studio now sells subscriptions through Paddle Billing (merchant of record)
instead of Stripe. Rows are written only by the `paddle-webhook` Edge Function
(service role) in response to signature-verified Paddle events — never by the
browser. The legacy stripe_* columns are kept so any historical test rows stay
readable; new rows key on `paddle_subscription_id`.

`onboarded_at` makes the post-subscribe automation idempotent: Paddle retries
webhooks, and Trello board creation + welcome emails must run exactly once per
subscription. The trello_* columns record what was provisioned so support can
find a client's board without digging through Trello.

## Changes to `subscriptions`
- `paddle_subscription_id`  text, unique — the Paddle subscription (upsert key)
- `paddle_customer_id`      text — Paddle customer (ctm_…)
- `paddle_transaction_id`   text — transaction that created it (txn_…)
- `onboarded_at`            timestamptz — when the one-time onboarding ran
- `trello_board_id`         text — the client's request board
- `trello_board_url`        text

## Security
Unchanged: RLS stays enabled with no policies — service role only.
*/

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS paddle_subscription_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS paddle_customer_id text,
  ADD COLUMN IF NOT EXISTS paddle_transaction_id text,
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz,
  ADD COLUMN IF NOT EXISTS trello_board_id text,
  ADD COLUMN IF NOT EXISTS trello_board_url text;

CREATE INDEX IF NOT EXISTS subscriptions_paddle_customer_idx
  ON subscriptions (paddle_customer_id);
