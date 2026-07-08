/*
# Add company and looking_for to contact_inquiries

## Summary
Adds two optional columns to the `contact_inquiries` table to support the
updated Contact form:
- `company`     — the submitter's company or product name (optional)
- `looking_for` — which engagement the visitor is interested in (optional)

No existing columns are changed or removed. RLS policies are unchanged —
the table already allows public INSERT via the anon key with no read-back.

## Modified Tables
- `contact_inquiries`
  - `company`     text, optional — company or product name
  - `looking_for` text, optional — which service / engagement the visitor wants

## Security
- No RLS policy changes. Existing INSERT policy for `anon, authenticated`
  remains in effect. New columns are nullable so existing inserts still work.
*/

ALTER TABLE contact_inquiries
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS looking_for text;
