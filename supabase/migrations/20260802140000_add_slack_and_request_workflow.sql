/*
# Slack channels + design-request workflow

## Summary
Extends onboarding to a per-client Slack channel and adds the ongoing
request/completion workflow that keeps Trello and Slack in sync.

Two new Edge Functions write these rows (service role, signature-verified):
  - `slack-events`   — Slack slash command / shortcut → creates a request card;
                       "Approve" button → marks the request approved + archived.
  - `trello-webhook` — Trello card list-moves → status pings in Slack; a move to
                       "Done" → completion message with the final files + an
                       Approve button.

`paddle-webhook` still owns onboarding and now also records the Slack channel it
provisioned so the other two functions can map a board or channel back to a
client.

## Changes to `subscriptions`
- `slack_channel_id`    text — the client's dedicated channel (C…)
- `slack_channel_name`  text — e.g. "acme-design"

Lookups from the ongoing webhooks need to resolve board→client and
channel→client fast, so both directions are indexed.

## New table `design_requests`
One row per request, keyed to its Trello card. Makes the ongoing automation
idempotent (Slack replays events, Trello replays actions) and gives support a
single place to see a request's state without cross-referencing both tools.

- `id`                    uuid, pk
- `subscription_id`       uuid — owning client (nullable; a board may predate this table)
- `trello_card_id`        text, unique — the card this request is (upsert key)
- `trello_board_id`       text — board the card lives on
- `slack_channel_id`      text — client channel the request belongs to
- `source`                text — 'slack' | 'trello' | 'form'
- `title`                 text
- `status`                text — mirrors the Trello list name / lifecycle
- `assignee_trello_id`    text — designer the card is assigned to
- `due_at`                timestamptz — SLA due date set at creation
- `completed_notified_at` timestamptz — completion message posted once
- `approved_at`           timestamptz — client approved in Slack
- `approved_by`           text — Slack user id who approved
- `archived_at`           timestamptz — card archived after approval
- `created_at` / `updated_at` timestamptz

## New table `processed_events`
Dedup ledger for at-least-once webhook delivery. Slack retries events (same
`event_id` / interactivity payloads) and Trello replays `action.id`; both
functions record the key here and no-op on a repeat.

- `source`      text — 'slack' | 'trello'
- `event_key`   text — Slack event_id / interactivity hash, or Trello action id
- `created_at`  timestamptz
- primary key (source, event_key)

## Security
RLS enabled with no policies on both new tables — service role only, same as
`subscriptions`. None of this data is ever publicly readable.
*/

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS slack_channel_id text,
  ADD COLUMN IF NOT EXISTS slack_channel_name text;

CREATE INDEX IF NOT EXISTS subscriptions_trello_board_idx
  ON subscriptions (trello_board_id);
CREATE INDEX IF NOT EXISTS subscriptions_slack_channel_idx
  ON subscriptions (slack_channel_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS design_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions (id) ON DELETE SET NULL,
  trello_card_id text UNIQUE,
  trello_board_id text,
  slack_channel_id text,
  source text,
  title text,
  status text,
  assignee_trello_id text,
  due_at timestamptz,
  completed_notified_at timestamptz,
  approved_at timestamptz,
  approved_by text,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE design_requests ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: service role only.

CREATE INDEX IF NOT EXISTS design_requests_board_idx
  ON design_requests (trello_board_id);
CREATE INDEX IF NOT EXISTS design_requests_subscription_idx
  ON design_requests (subscription_id);

-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS processed_events (
  source text NOT NULL,
  event_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source, event_key)
);

ALTER TABLE processed_events ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: service role only.
