/**
 * Postbuild prerender — writes a static `dist/<route>/index.html` per route with
 * route-specific <head> meta (title, description, canonical, OG/Twitter). This
 * gives social scrapers and non-JS crawlers the right per-page card instead of
 * the homepage one for every URL. Netlify serves an existing file in preference
 * to the SPA `/* -> /index.html` fallback, so these win. The client SPA still
 * boots normally from the same asset tags.
 *
 * Runs automatically after `npm run build` (npm "postbuild" lifecycle).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const BASE = "https://13design.org";
const SITE = "13 Design Studio";
const HOME_TITLE = `${SITE} — Product design for AI-native & AI-built products`;

/** Routes to prerender. "/" keeps the template's default (homepage) meta. */
const ROUTES = [
  {
    path: "/services",
    title: `Services — ${SITE}`,
    description:
      "Interaction design for AI-native features, UX rescue sprints, product finishing, and a fractional product partner — for AI-native and AI-built products.",
  },
  {
    path: "/about",
    title: `About — ${SITE}`,
    description:
      "A studio built for the moment AI products grow up. Human judgment on every screen — we design for people and agents alike.",
  },
  {
    path: "/work",
    title: `Work — ${SITE}`,
    description:
      "Case studies are on the way. We're taking on our first founding clients now — full write-ups land here as that work ships.",
  },
  {
    path: "/founding-clients",
    title: `Founding clients — ${SITE}`,
    description:
      "We're taking on a small number of founding clients at a founder rate, in exchange for the first case studies. See if your product is a fit.",
  },
  {
    path: "/contact",
    title: `Contact — ${SITE}`,
    description:
      "Tell us where your product is today and what's coming up. A direct, honest conversation — we reply within one business day.",
  },
  {
    path: "/terms",
    title: `Terms & agreement — ${SITE}`,
    description:
      "How we work with clients — what you own, confidentiality, showing work, and the law that governs it. The plain-language working agreement.",
  },
  {
    path: "/privacy",
    title: `Privacy — ${SITE}`,
    description:
      "Your data, handled plainly. We collect only what it takes to reply, use cookieless analytics, and never sell data — what we hold, why, and your rights.",
  },
];

/** Escape for use inside an HTML attribute value or <title>. */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function render(template, { path, title, description }) {
  const url = BASE + path;
  const t = esc(title);
  const d = esc(description);
  return (
    template
      // <title>
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
      // description (multi-line meta in the template)
      .replace(
        /(<meta\s+name="description"\s+content=")[\s\S]*?("\s*\/>)/,
        `$1${d}$2`,
      )
      // canonical
      .replace(
        /(<link rel="canonical" href=")[^"]*("\s*\/>)/,
        `$1${esc(url)}$2`,
      )
      // OG + Twitter title/description/url
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${t}$2`)
      .replace(/(<meta property="og:description"\s+content=")[\s\S]*?(")/, `$1${d}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(url)}$2`)
      .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${t}$2`)
      .replace(/(<meta name="twitter:description"\s+content=")[\s\S]*?(")/, `$1${d}$2`)
  );
}

const template = await readFile(join(DIST, "index.html"), "utf8");
// sanity: ensure the home title exists so replacements have a target
if (!template.includes(HOME_TITLE)) {
  console.warn("prerender: home <title> not found in template — check index.html");
}

let count = 0;
for (const route of ROUTES) {
  const html = render(template, route);
  // Flat file (e.g. dist/contact.html) rather than dist/contact/index.html —
  // directory-index files trigger Netlify's trailing-slash 301; flat ones don't.
  const slug = route.path.replace(/^\//, "");
  await writeFile(join(DIST, `${slug}.html`), html, "utf8");
  count++;
}

// 404 page — Netlify serves this (with a 404 status) for unmatched paths; the
// SPA then renders the NotFound route. Mark it noindex.
const notFound = render(template, {
  path: "/404",
  title: `Page not found — ${SITE}`,
  description: "The page you're looking for doesn't exist or has moved.",
}).replace(
  /(<meta name="robots" content=")[^"]*(")/,
  "$1noindex, follow$2",
);
await writeFile(join(DIST, "404.html"), notFound, "utf8");

console.log(`prerender: wrote ${count} route pages + 404.html`);
