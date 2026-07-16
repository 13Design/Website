import type { Route } from './router';

export const SITE_URL = 'https://13design.org';
export const SITE_NAME = '13 Design Studio';
export const OG_IMAGE = `${SITE_URL}/og.png`;

type Meta = { title: string; description: string };

/**
 * Per-route title + meta description. Titles lead with the specific page, end
 * with the brand. Descriptions are written for a search snippet — one clear
 * sentence of what the page is, front-loaded with the terms that matter.
 */
export const ROUTE_META: Record<Route, Meta> = {
  '/': {
    title: '13 Design Studio — Product design for AI-native & AI-built products',
    description:
      'A digital product design agency for AI-native and AI-built products. We turn AI features and AI-generated MVPs into products people trust and understand at first glance.',
  },
  '/services': {
    title: 'Services — AI product & UX design | 13 Design Studio',
    description:
      'AI UX and product design, AI-integration UX, UX rescue sprints, product finishing, design systems, and fractional product partnership — for AI-native and AI-built products.',
  },
  '/pricing': {
    title: 'Subscription pricing — design retainers from $800/mo | 13 Design Studio',
    description:
      'Month-to-month design subscriptions: Lite $800, Standard $2,500, Product Partner $4,500. Fixed monthly price, no lock-in, cancel anytime. Reserved design capacity for AI products.',
  },
  '/about': {
    title: 'About — a design studio for the AI era | 13 Design Studio',
    description:
      'Why we built a design studio for AI-native and AI-built products, and how we work: human judgment on every flow, screen, and decision.',
  },
  '/contact': {
    title: 'Contact — talk to us about your AI product | 13 Design Studio',
    description:
      'Tell us where your AI product is today and what you need. We reply within one business day. Based in Kraków, working with founders everywhere.',
  },
  '/work': {
    title: 'Work — case studies | 13 Design Studio',
    description:
      'Selected work from 13 Design Studio. Case studies for our founding clients land here as that work ships.',
  },
  '/founding-clients': {
    title: 'Founding clients — build the first case studies with us | 13 Design Studio',
    description:
      'We are taking on a small number of founding clients on terms that reflect it. Help build our first case studies and be among the first names on our Work page.',
  },
  '/subscribe/success': {
    title: "You're subscribed — 13 Design Studio",
    description: 'Your design subscription is active. Here is what happens next.',
  },
  '/subscribe/cancel': {
    title: 'Checkout cancelled — 13 Design Studio',
    description: 'No payment was taken. Your plan is still there whenever you are ready.',
  },
  '/terms': {
    title: 'Terms & agreement — 13 Design Studio',
    description:
      'How we work with clients and how the subscription runs: ownership, confidentiality, case studies, governing law, and what "up to N days" means.',
  },
};

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
  const noindex = search.includes('session_id') || route.startsWith('/subscribe/');
  upsertMeta('meta[name="robots"]', 'name', 'robots',
    noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');
}
