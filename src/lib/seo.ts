import type { Route } from './router';
import routeMeta from './routeMeta.json';

/**
 * Single source of truth for per-route titles + descriptions lives in
 * routeMeta.json, so the build-time pre-render (scripts/prerender.mjs) and this
 * runtime code can never drift. Titles lead with the specific page and end with
 * the brand; descriptions are one search-snippet sentence, front-loaded.
 */
export const SITE_URL = routeMeta.siteUrl;
export const SITE_NAME = routeMeta.siteName;
export const OG_IMAGE = `${SITE_URL}${routeMeta.ogImagePath}`;

type Meta = { title: string; description: string };

export const ROUTE_META = routeMeta.routes as Record<Route, Meta>;

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Apply per-route head tags. Runs on every client navigation; the pre-render
 *  step snapshots the resolved tags into each route's static HTML. */
export function applyRouteMeta(route: Route, search = '') {
  const meta = ROUTE_META[route] ?? ROUTE_META['/'];
  const url = `${SITE_URL}${route === '/' ? '/' : route}`;

  document.title = meta.title;
  upsertMeta('meta[name="description"]', 'name', 'description', meta.description);
  upsertLink('canonical', url);

  upsertMeta('meta[property="og:title"]', 'property', 'og:title', meta.title);
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', meta.description);
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title);
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description);

  // Pages behind a checkout/return flow should not be indexed.
  const noindex = search.includes('session_id') || route.startsWith('/subscribe');
  upsertMeta('meta[name="robots"]', 'name', 'robots',
    noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');
}
