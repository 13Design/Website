// Zoho Invoice integration for the invoice-based subscription flow.
//
// Uses a stored OAuth refresh token to mint a short-lived access token, then
// finds-or-creates the customer and raises a MONTHLY RECURRING invoice. The
// generated invoices are left for the studio to send by hand ("draft I send
// with one click") — that behaviour is controlled by a one-time Zoho setting:
//   Zoho Invoice → Settings → Preferences → Recurring Invoices →
//   turn OFF "automatically send invoices to customers".
// With that off, each month's invoice is created and waits for a manual send.
//
// Secrets (all set by the studio owner via `supabase secrets set`):
//   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ORG_ID
//   ZOHO_ACCOUNTS_DOMAIN  (default https://accounts.zoho.eu)
//   ZOHO_API_DOMAIN       (default https://www.zohoapis.eu)

function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function accountsDomain(): string {
  return Deno.env.get("ZOHO_ACCOUNTS_DOMAIN") ?? "https://accounts.zoho.eu";
}

function apiDomain(): string {
  return Deno.env.get("ZOHO_API_DOMAIN") ?? "https://www.zohoapis.eu";
}

/** Exchange the long-lived refresh token for a fresh access token. */
export async function accessToken(): Promise<string> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: requireEnv("ZOHO_CLIENT_ID"),
    client_secret: requireEnv("ZOHO_CLIENT_SECRET"),
    refresh_token: requireEnv("ZOHO_REFRESH_TOKEN"),
  });
  const res = await fetch(`${accountsDomain()}/oauth/v2/token?${params.toString()}`, {
    method: "POST",
  });
  const data = await res.json().catch(() => ({}));
  const token = (data as { access_token?: string }).access_token;
  if (!res.ok || !token) {
    throw new Error(`Zoho token refresh failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return token;
}

/**
 * Call the Zoho Invoice API. Zoho returns 200 with a JSON body carrying its own
 * `code` (0 = success); a non-zero code is an application error even on HTTP 200,
 * so we check both.
 */
async function api<T>(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const org = requireEnv("ZOHO_ORG_ID");
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${apiDomain()}/invoice/v3${path}${sep}organization_id=${org}`, {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  const code = (data as { code?: number }).code;
  if (!res.ok || (code !== undefined && code !== 0)) {
    throw new Error(`Zoho ${method} ${path} failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data as T;
}

export type Billing = {
  name: string;
  email: string;
  company?: string;
  country?: string;
  address?: string;
  vatId?: string;
};

/** Find a customer by email, or create one from the billing details. */
export async function findOrCreateContact(token: string, b: Billing): Promise<string> {
  const found = await api<{ contacts?: { contact_id: string }[] }>(
    token,
    "GET",
    `/contacts?email=${encodeURIComponent(b.email)}`,
  );
  if (found.contacts && found.contacts.length > 0) {
    return found.contacts[0].contact_id;
  }

  const billingAddress = b.address || b.country
    ? { address: b.address ?? "", country: b.country ?? "" }
    : undefined;

  const created = await api<{ contact: { contact_id: string } }>(
    token,
    "POST",
    "/contacts",
    {
      contact_name: b.company || b.name || b.email,
      ...(b.company ? { company_name: b.company } : {}),
      ...(b.vatId ? { tax_reg_no: b.vatId } : {}),
      ...(billingAddress ? { billing_address: billingAddress } : {}),
      contact_persons: [
        {
          first_name: b.name || b.email,
          email: b.email,
          is_primary_contact: true,
        },
      ],
    },
  );
  return created.contact.contact_id;
}

/**
 * Create a monthly recurring invoice for a customer at the tier's rate, starting
 * today. Left unsent (see the module note on the Zoho auto-send setting) so the
 * studio reviews and sends each generated invoice by hand.
 */
export async function createMonthlyRecurringInvoice(
  token: string,
  opts: {
    customerId: string;
    tierName: string;
    daysPerMonth: string;
    amount: number; // whole currency units, e.g. 2500
    clientLabel: string;
  },
): Promise<{ recurringInvoiceId: string; name: string }> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const name = `${opts.tierName} — ${opts.clientLabel}`;

  const created = await api<{
    recurring_invoice: { recurring_invoice_id: string; recurrence_name?: string };
  }>(token, "POST", "/recurringinvoices", {
    customer_id: opts.customerId,
    recurrence_name: name,
    recurrence_frequency: "months",
    repeat_every: 1,
    start_date: today,
    line_items: [
      {
        name: opts.tierName,
        description: opts.daysPerMonth,
        rate: opts.amount,
        quantity: 1,
      },
    ],
  });

  return {
    recurringInvoiceId: created.recurring_invoice.recurring_invoice_id,
    name: created.recurring_invoice.recurrence_name ?? name,
  };
}
