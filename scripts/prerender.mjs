/**
 * Post-build static pre-render — no headless browser.
 *
 * This is a client-rendered SPA: the built dist/index.html ships an empty
 * <div id="root"> plus homepage-specific <head> tags. Without this step every
 * route would serve byte-identical HTML, so any crawler or link-preview bot
 * that doesn't run JS (social unfurlers, many AI crawlers, older engines) sees
 * the homepage's title/description/OG on every page.
 *
 * For each indexable route we copy dist/index.html to dist/<route>/index.html
 * and:
 *   1. rewrite the per-route <head> — <title>, description, canonical, and the
 *      OG/Twitter title+description+url;
 *   2. inject a FAQPage JSON-LD block on the routes that have an FAQ (home,
 *      pricing);
 *   3. fill <div id="root"> with a real content fallback (headline, intro,
 *      services, plans, FAQ) so non-JS crawlers get substance, not an empty
 *      shell. Real users never see this — createRoot().render() replaces #root
 *      on mount — so there is no hydration mismatch and no visual impact.
 *
 * Why not puppeteer: a headless-Chromium pre-render is unreliable in CI (it
 * times out on cold builds) and downloads ~150MB of Chromium every build, which
 * burns build minutes. Pure string injection is deterministic, instant, and has
 * zero runtime deps. Netlify serves the pre-rendered file when it exists and
 * falls back to the SPA rewrite otherwise, so _redirects stays compatible.
 *
 * Runs automatically after `npm run build` via the `postbuild` script. Meta
 * comes from src/lib/routeMeta.json and content from src/data/studio.ts — the
 * same sources the app reads, so the static HTML can't drift from the app.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

const meta = JSON.parse(await readFile(join(ROOT, 'src/lib/routeMeta.json'), 'utf8'));
const SITE_URL = meta.siteUrl.replace(/\/+$/, '');

// Indexable routes only — /subscribe/* is transactional and marked noindex.
const ROUTES = [
  '/',
  '/services',
  '/pricing',
  '/about',
  '/work',
  '/contact',
  '/founding-clients',
  '/terms',
  '/refunds',
  '/privacy',
];

/**
 * Load the data layer (src/data/studio.ts) at build time. It's pure data with
 * no runtime imports, so a single esbuild TS→ESM transform + data-URL import is
 * enough; no bundling needed. Non-fatal: if it fails we ship head-only.
 */
async function loadStudio() {
  const src = await readFile(join(ROOT, 'src/data/studio.ts'), 'utf8');
  const { code } = await transform(src, { loader: 'ts', format: 'esm' });
  return import('data:text/javascript;charset=utf-8,' + encodeURIComponent(code));
}

/** Escape a string for safe insertion into an HTML attribute, <title>, or text. */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * schema.org FAQPage from a list of Q&A pairs. Mirrors faqPageSchema() in
 * src/components/JsonLd.tsx; the Q&A content itself comes from studio.ts, so
 * only the (stable) schema shape is duplicated, never the copy.
 */
function faqPageSchema(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/** Serialize JSON-LD safely for inlining inside a <script> element. */
function jsonLdScript(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

/**
 * Replace the content="…" of a <meta name|property="key"> tag.
 *
 * All substitutions use a *function* replacer, never a replacement string:
 * inserted values contain "$" (e.g. "$2,500"), and in a replacement string
 * "$2" is read as a backreference — which would silently eat the price.
 */
function setMeta(html, attr, key, value) {
  const re = new RegExp(
    `(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`,
    'i',
  );
  if (re.test(html)) return html.replace(re, (_m, p1, p2) => p1 + esc(value) + p2);
  // Tag absent (some routes may not ship every tag): add it before </head>.
  return html.replace(
    /<\/head>/i,
    (m) => `  <meta ${attr}="${key}" content="${esc(value)}" />\n  ${m}`,
  );
}

/** Strip the brand suffix from a page title to get a bare headline. */
function headline(title) {
  return title.replace(/\s*[|—-]\s*13 Design Studio\s*$/i, '').trim() || title;
}

function servicesSection(services) {
  const items = services
    .map((s) => `<li><h3>${esc(s.name)}</h3><p>${esc(s.body)}</p></li>`)
    .join('');
  return `<section><h2>What we do</h2><ul>${items}</ul></section>`;
}

function plansSection(tiers) {
  const items = tiers
    .map(
      (t) =>
        `<li><h3>${esc(t.name)} — ${esc(t.price)}${esc(t.cadence)}</h3>` +
        `<p>${esc(t.daysPerMonth)}. ${esc(t.description)}</p></li>`,
    )
    .join('');
  return `<section><h2>Subscription plans</h2><ul>${items}</ul></section>`;
}

function faqSection(faq) {
  const items = faq
    .map((f) => `<li><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></li>`)
    .join('');
  return `<section><h2>FAQ</h2><ul>${items}</ul></section>`;
}

/** The FAQ array for a route, or null if it has none. */
function faqFor(route, studio) {
  if (!studio) return null;
  if (route === '/') return studio.homeFaq;
  if (route === '/pricing') return studio.subscriptionFaq;
  return null;
}

/**
 * Real content fallback for #root, per route. `studio` may be null.
 *
 * The FAQ JSON-LD lives *inside* #root (not <head>) so that when React mounts
 * and replaces #root, its own <JsonLd> re-renders in the same place — leaving
 * exactly one FAQPage block at runtime, same as the app ships on its own.
 * Non-JS crawlers keep this static copy; JSON-LD is valid anywhere in the body.
 */
function bodyFor(route, m, studio) {
  const parts = [`<h1>${esc(headline(m.title))}</h1>`, `<p>${esc(m.description)}</p>`];
  if (studio) {
    if (route === '/') {
      parts.push(servicesSection(studio.services));
      parts.push(plansSection(studio.subscriptionTiers));
      parts.push(faqSection(studio.homeFaq));
    } else if (route === '/services') {
      parts.push(servicesSection(studio.services));
    } else if (route === '/pricing') {
      parts.push(plansSection(studio.subscriptionTiers));
      parts.push(faqSection(studio.subscriptionFaq));
    }
  }
  const faq = faqFor(route, studio);
  const ld = faq ? jsonLdScript(faqPageSchema(faq)) : '';
  return `<main>${parts.join('')}</main>${ld}`;
}

function renderRoute(shell, route, studio) {
  const m = meta.routes[route];
  if (!m) return null;
  const url = `${SITE_URL}${route === '/' ? '/' : route}`;

  let html = shell;
  html = html.replace(/<title>[^<]*<\/title>/i, () => `<title>${esc(m.title)}</title>`);
  html = setMeta(html, 'name', 'description', m.description);
  html = html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/i,
    (_m, p1, p2) => p1 + url + p2,
  );
  html = setMeta(html, 'property', 'og:title', m.title);
  html = setMeta(html, 'property', 'og:description', m.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:title', m.title);
  html = setMeta(html, 'name', 'twitter:description', m.description);

  // Real content for non-JS crawlers (incl. route-specific FAQ JSON-LD);
  // React replaces #root for real users.
  const body = bodyFor(route, m, studio);
  html = html.replace(/<div id="root">\s*<\/div>/i, () => `<div id="root">${body}</div>`);

  return html;
}

async function main() {
  const shell = await readFile(join(DIST, 'index.html'), 'utf8');

  let studio = null;
  try {
    studio = await loadStudio();
  } catch (err) {
    console.warn(`  studio data unavailable, shipping head-only content: ${err.message}`);
  }

  let ok = 0;
  for (const route of ROUTES) {
    const html = renderRoute(shell, route, studio);
    if (!html) {
      console.warn(`  skipped ${route}: no meta in routeMeta.json`);
      continue;
    }
    const outPath = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, html, 'utf8');
    console.log(`  prerendered ${route} -> ${outPath.replace(DIST, 'dist')}`);
    ok++;
  }

  console.log(`prerender: ${ok}/${ROUTES.length} routes`);
  if (ok < ROUTES.length) {
    console.warn('prerender: some routes had no meta; they ship as the SPA shell.');
  }
}

// Never fail the build: a degraded pre-render (SPA shell with generic meta) is
// far better than a blocked deploy.
main().catch((err) => {
  console.warn('prerender skipped (non-fatal):', err.message);
  process.exit(0);
});
