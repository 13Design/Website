/**
 * Post-build pre-render. Serves the built dist/ over a tiny static server,
 * drives each route through headless Chrome, and writes the fully-rendered HTML
 * back to dist/<route>/index.html.
 *
 * Why: this is a client-side SPA, so without this crawlers that don't run JS
 * (many AI assistants, social unfurlers) see an empty <div id="root">. After
 * pre-render they get real content, per-route <title>/meta, and JSON-LD.
 *
 * Netlify serves the pre-rendered file when it exists and only falls back to the
 * SPA rewrite otherwise, so the existing _redirects rule stays compatible.
 *
 * Runs automatically after `npm run build` via the `postbuild` script.
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = 4390;

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
];

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

// Static server with SPA fallback: real files win, everything else gets the shell.
const server = createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let filePath = join(DIST, urlPath);
  if (!extname(filePath) || !existsSync(filePath)) filePath = join(DIST, 'index.html');
  try {
    const buf = await readFile(filePath);
    res.setHeader('Content-Type', MIME[extname(filePath)] || 'application/octet-stream');
    res.end(buf);
  } catch {
    res.statusCode = 404;
    res.end('not found');
  }
});

async function main() {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let ok = 0;
  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      // Readiness is signalled by real content + per-route meta, not network
      // idle — Google Fonts keeps connections open and never fully idles.
      await page.waitForFunction(
        () =>
          document.querySelector('main') &&
          document.querySelector('#root')?.children.length > 0 &&
          /13 Design/.test(document.title),
        { timeout: 30000, polling: 200 },
      );
      // Small settle for any post-mount effects (meta, JSON-LD).
      await new Promise((r) => setTimeout(r, 300));

      const html = await page.evaluate(
        () => '<!doctype html>\n' + document.documentElement.outerHTML,
      );

      const outPath =
        route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, html, 'utf8');
      console.log(`  prerendered ${route} -> ${outPath.replace(DIST, 'dist')}`);
      ok++;
    } catch (err) {
      console.error(`  FAILED ${route}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();
  console.log(`prerender: ${ok}/${ROUTES.length} routes`);
  if (ok < ROUTES.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
