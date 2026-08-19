/*
# Wire inquiry email notifications (function + triggers)

## Why this exists
The `notify_inquiry_webhook()` trigger function and the per-table triggers that
POST each new inquiry to the `notify-inquiry` Edge Function were originally
created by hand in the dashboard (see LAUNCH.md, Step 4) and were never captured
as a migration. That left two real problems:

1. A later migration — `20260806130000_notify_subscribe_requests.sql` — runs
   `EXECUTE FUNCTION public.notify_inquiry_webhook()`. On a fresh `supabase db
   reset` that migration FAILS, because nothing in the migration history defines
   the function it depends on.
2. On the live database the hand-made function/triggers can silently disappear
   (a project reset or restore drops them). After that, contact submissions
   still INSERT fine but no email is ever sent — inquiries pile up unseen. This
   is the failure mode behind "I'm not receiving the form submissions".

This migration makes the wiring reproducible and idempotent. It is intentionally
dated just before `20260806130000` so that, on a fresh reset, the function is
defined before the subscribe-notify migration attaches it to a third table.

## Configuration (set once per project — no secret is stored in the repo)
The function reads the target URL and shared secret from database settings, so
nothing sensitive lives in version control. Set them once (values come from the
`notify-inquiry` function's URL and its `WEBHOOK_SECRET` secret):

    alter database postgres
      set app.settings.notify_inquiry_url =
        'https://<PROJECT_REF>.supabase.co/functions/v1/notify-inquiry';
    alter database postgres
      set app.settings.notify_inquiry_secret = '<same value as WEBHOOK_SECRET>';

If the URL is unset, the trigger no-ops with a warning so that inserts never
fail — the form keeps working even before notifications are configured.

## Security
- `SECURITY DEFINER` so the anon insert can enqueue the outbound request.
- `net.http_post` (pg_net) is asynchronous — it queues the request and returns
  immediately, so the visitor's INSERT is never blocked on the email send.
*/

create extension if not exists pg_net;

create or replace function public.notify_inquiry_webhook()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fn_url text := current_setting('app.settings.notify_inquiry_url', true);
  secret text := current_setting('app.settings.notify_inquiry_secret', true);
begin
  if fn_url is null or fn_url = '' then
    raise warning
      'notify_inquiry_webhook: app.settings.notify_inquiry_url is not set; skipping notification for table %',
      tg_table_name;
    return new;
  end if;

  perform net.http_post(
    url     := fn_url,
    headers := jsonb_build_object(
      'Content-Type',     'application/json',
      'x-webhook-secret', coalesce(secret, '')
    ),
    body    := jsonb_build_object(
      'type',   tg_op,
      'table',  tg_table_name,
      'record', to_jsonb(new)
    )
  );

  return new;
end;
$$;

-- Contact page form (src/pages/Contact.tsx → contact_inquiries)
drop trigger if exists notify_contact_insert on public.contact_inquiries;
create trigger notify_contact_insert
after insert on public.contact_inquiries
for each row execute function public.notify_inquiry_webhook();

-- Founding-client application form → founder_inquiries
drop trigger if exists notify_founder_insert on public.founder_inquiries;
create trigger notify_founder_insert
after insert on public.founder_inquiries
for each row execute function public.notify_inquiry_webhook();
