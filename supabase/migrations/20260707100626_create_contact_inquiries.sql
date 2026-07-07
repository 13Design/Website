/*
# Create contact_inquiries table

## Summary
Stores submissions from the main Contact page form on the 13 Design Studio
marketing site. This is a public, no-auth contact form — anyone visiting the
site can submit a message. No sign-in screen exists.

## New Tables
- `contact_inquiries`
  - `id`           uuid, primary key
  - `name`         text, required — submitter's name
  - `email`        text, required — submitter's contact email
  - `product_url`  text, optional — link to the live product
  - `stage`        text — where the product is today (idea / shipped / live / raising / launching / scaling)
  - `challenges`   text, optional — what challenges the founder is facing
  - `whats_next`   text, optional — upcoming raise / launch / growth push + timing
  - `message`      text, optional — open message field
  - `created_at`   timestamptz, defaults to now()

## Security
- RLS enabled on `contact_inquiries`.
- Single-tenant, no-auth marketing form: the public site (anon key) is allowed
  to INSERT but cannot read back any rows (messages are private to the studio
  owner via the Supabase dashboard / service role). This prevents scraping of
  other people's messages while keeping the form functional.
- INSERT policy scoped to anon + authenticated.
- No SELECT / UPDATE / DELETE policy for anon — rows are only readable by the
  service role (dashboard), which bypasses RLS.

## Important notes
1. No `user_id` / `auth.users` link — the site has no auth flow.
2. Distinct from `founder_inquiries` (the founding-client application form);
   this table captures general contact messages.
*/

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  product_url text,
  stage text,
  challenges text,
  whats_next text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow the public (anon key) to submit new inquiries. No read-back.
DROP POLICY IF EXISTS "anon_insert_contact_inquiries" ON contact_inquiries;
CREATE POLICY "anon_insert_contact_inquiries"
ON contact_inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);
