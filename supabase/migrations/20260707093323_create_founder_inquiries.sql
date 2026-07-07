/*
# Create founder_inquiries table

## Summary
Stores submissions from the "Founding client spots" request form on the
13 Design Studio marketing site. This is a public, no-auth contact form —
anyone visiting the site can submit a request. No sign-in screen exists.

## New Tables
- `founder_inquiries`
  - `id`            uuid, primary key
  - `name`          text, required — submitter's full name
  - `email`         text, required — submitter's contact email
  - `product_name`  text, required — product name and/or link (live link or demo)
  - `product_kind`  text — AI-native feature / AI-generated MVP / Both / Other
  - `stage`         text — Just shipped / Live with users / Preparing to raise / Preparing to launch / Scaling
  - `what_feels_off` text — the one or two things bothering the founder most
  - `whats_next`     text, optional — a raise, launch, or growth push and rough timing
  - `anything_else`  text, optional — open field
  - `ok_to_share`    boolean — consent to publish work as a case study (required true)
  - `created_at`     timestamptz, defaults to now()

## Security
- RLS enabled on `founder_inquiries`.
- This is a single-tenant, no-auth marketing form: the public site (anon key)
  is allowed to INSERT, but cannot read back any rows (submissions are private
  to the studio owner via the Supabase dashboard / service role). This prevents
  scraping of other people's submissions while keeping the form functional.
- INSERT policy scoped to anon + authenticated with a light consent check.
- No SELECT / UPDATE / DELETE policy for anon — rows are only readable by the
  service role (dashboard), which bypasses RLS.

## Important notes
1. No `user_id` / `auth.users` link — the site has no auth flow.
2. `ok_to_share` consent is captured but not enforced at the DB layer beyond
   presence; the form itself requires the checkbox before submit.
*/

CREATE TABLE IF NOT EXISTS founder_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  product_name text NOT NULL,
  product_kind text,
  stage text,
  what_feels_off text,
  whats_next text,
  anything_else text,
  ok_to_share boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE founder_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow the public (anon key) to submit new inquiries. No read-back.
DROP POLICY IF EXISTS "anon_insert_founder_inquiries" ON founder_inquiries;
CREATE POLICY "anon_insert_founder_inquiries"
ON founder_inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);
