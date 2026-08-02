/**
 * Cloudflare Web Analytics — privacy-first, cookieless, no consent banner
 * required. It sets no cookies, tracks no individuals, and (unlike Google
 * Analytics) needs no cookie-consent wall. Its beacon automatically records
 * SPA route changes via the History API, so path-based routes like
 * `/subscribe/success` are counted as page views — giving a basic funnel
 * (pricing → completed checkout) without any custom instrumentation.
 *
 * The beacon loads only when VITE_CF_BEACON_TOKEN is set, so local dev and any
 * environment without the token stay analytics-free. Get the token from the
 * Cloudflare dashboard → Web Analytics → add site 13design.org (standalone —
 * the site does not need to be proxied through Cloudflare).
 */
export function initAnalytics(): void {
  const token = import.meta.env.VITE_CF_BEACON_TOKEN as string | undefined;
  if (!token) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  // SPA tracking is on by default; the token is all the beacon needs.
  script.setAttribute('data-cf-beacon', JSON.stringify({ token }));
  document.head.appendChild(script);
}
