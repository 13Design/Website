/*
# Add product_url and timeline to founder_inquiries

## Summary
Adds two optional columns to the `founder_inquiries` table to support the
updated Founding Clients intake form:
- `product_url` — link to the live product (optional)
- `timeline`    — when the founder wants to start (optional)

No existing columns are changed or removed. RLS policies are unchanged —
the table already allows public INSERT via the anon key with no read-back.

## Modified Tables
- `founder_inquiries`
  - `product_url` text, optional — link to the live product
  - `timeline`    text, optional — ASAP / this quarter / just exploring

## Security
- No RLS policy changes. Existing INSERT policy for `anon, authenticated`
  remains in effect. New columns are nullable so existing inserts still work.
*/

ALTER TABLE founder_inquiries
  ADD COLUMN IF NOT EXISTS product_url text,
  ADD COLUMN IF NOT EXISTS timeline text;
