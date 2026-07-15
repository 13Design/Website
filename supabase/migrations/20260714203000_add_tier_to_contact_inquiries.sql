/*
# Add tier to contact_inquiries

## Summary
Adds one optional column to `contact_inquiries` so that inquiries arriving from
the Subscription page carry the tier the visitor picked. The Subscribe button on
each pricing tier now links to /contact?tier=<id>, and the form records the
selected plan (e.g. "Standard — $2,500/mo").

## Modified Tables
- `contact_inquiries`
  - `tier` text, optional — the subscription tier the visitor selected, if any.
    Empty for general contact messages.

## Security
- No RLS policy changes. The existing INSERT policy for `anon, authenticated`
  remains in effect. The new column is nullable so existing inserts still work.
*/

ALTER TABLE contact_inquiries
  ADD COLUMN IF NOT EXISTS tier text;
