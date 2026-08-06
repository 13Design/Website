/*
# Notify the studio on a new subscribe request

Reuses the same `public.notify_inquiry_webhook()` trigger function the contact
and founding-client forms already use. That function POSTs the inserted row
(with `table = tg_table_name`) to the `notify-inquiry` Edge Function, which — for
`subscribe_requests` — renders a signed "Review & approve" button linking to the
`subscribe-approve` control panel.

No new function is defined; this only attaches the existing one to the new table.
*/

DROP TRIGGER IF EXISTS notify_subscribe_insert ON public.subscribe_requests;
CREATE TRIGGER notify_subscribe_insert
AFTER INSERT ON public.subscribe_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_inquiry_webhook();
