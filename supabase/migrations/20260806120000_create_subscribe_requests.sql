/*
# Create subscribe_requests table

## Summary
Stores billing-intake submissions from the new /subscribe page. A visitor who
picks a tier fills in the basic information needed to raise an invoice; the row
lands here as `status = 'pending'`. The studio owner reviews each one (the
reserved-capacity / fit gate) and, on approval, an Edge Function creates the
customer + recurring invoice in the invoicing tool (Zoho Invoice) and flips the
row to `approved`.

This is a public, no-auth form — same trust model as `contact_inquiries` and
`founder_inquiries`: the anon key may INSERT but can never read rows back.

## New Tables
- `subscribe_requests`
  - `id`               uuid, primary key
  - `name`             text, required — billing contact name
  - `email`            text, required — where the invoice is sent
  - `company`          text, optional — company / product (B2B)
  - `country`          text, optional — required on an invoice
  - `billing_address`  text, optional — full billing address for the invoice
  - `vat_id`           text, optional — company tax/VAT id (reverse-charge note)
  - `tier`             text, required — 'lite' | 'standard' | 'product-partner'
  - `payment_pref`     text, optional — how they'd like to pay
  - `note`             text, optional — anything else
  - `status`           text — 'pending' | 'approved' | 'invoiced' | 'rejected'
  - `zoho_customer_id` text, optional — filled on approval
  - `zoho_invoice_id`  text, optional — filled on approval
  - `approved_at`      timestamptz, optional — set on approval
  - `created_at`       timestamptz, defaults to now()

## Security
- RLS enabled. The public site (anon key) may INSERT only, and only rows whose
  `status` is 'pending' — so a submission can never self-approve. No SELECT /
  UPDATE / DELETE for anon; the service role (Edge Function / dashboard) does
  the review + approval, bypassing RLS.
*/

CREATE TABLE IF NOT EXISTS subscribe_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  country text,
  billing_address text,
  vat_id text,
  tier text NOT NULL,
  payment_pref text,
  note text,
  status text NOT NULL DEFAULT 'pending',
  zoho_customer_id text,
  zoho_invoice_id text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscribe_requests ENABLE ROW LEVEL SECURITY;

-- Public site (anon key) may submit a new request, but only as 'pending'.
-- No read-back, no self-approval.
DROP POLICY IF EXISTS "anon_insert_subscribe_requests" ON subscribe_requests;
CREATE POLICY "anon_insert_subscribe_requests"
ON subscribe_requests FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');

-- Index the review queue: newest pending requests first.
CREATE INDEX IF NOT EXISTS subscribe_requests_status_created_idx
  ON subscribe_requests (status, created_at DESC);
