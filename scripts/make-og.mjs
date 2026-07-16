/**
 * One-off generator for the social share image (public/og.png, 1200×630).
 * Renders a branded HTML card to PNG with the Chromium puppeteer already pulls
 * in. Re-run manually if the positioning/wordmark changes: `node scripts/make-og.mjs`.
 */
import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og.png');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>
  * { margin:0; box-sizing:border-box; }
  body { width:1200px; height:630px; background:#08080a; font-family:'Space Grotesk',sans-serif; overflow:hidden; position:relative; }
  .glow { position:absolute; top:-30%; left:35%; width:800px; height:600px; border-radius:50%;
          background:radial-gradient(ellipse at center, rgba(232,116,76,0.28), transparent 62%); filter:blur(40px); }
  .grid { position:absolute; inset:0; background-image:
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size:48px 48px; }
  .wrap { position:absolute; inset:0; padding:72px 80px; display:flex; flex-direction:column; justify-content:space-between; }
  .top { display:flex; align-items:baseline; gap:16px; }
  .mark { font-size:52px; font-weight:600; color:#f4f2ec; letter-spacing:-0.04em; }
  .kicker { font-size:15px; letter-spacing:0.32em; text-transform:uppercase; color:#928d81; }
  h1 { font-size:76px; line-height:0.98; font-weight:500; letter-spacing:-0.035em; color:#f4f2ec; max-width:1000px; }
  .accent { color:#f0895b; font-weight:400; font-style:italic; }
  .foot { display:flex; align-items:center; gap:14px; }
  .dot { width:11px; height:11px; border-radius:50%; background:#e8744c; }
  .url { font-family:'JetBrains Mono',monospace; font-size:20px; color:#bfb9ac; letter-spacing:0.02em; }
</style></head>
<body>
  <div class="glow"></div>
  <div class="grid"></div>
  <div class="wrap">
    <div class="top">
      <span class="mark">13</span>
      <span class="kicker">Design Studio</span>
    </div>
    <h1>Product design for<br>AI-native &amp; AI-built products<span class="accent">.</span></h1>
    <div class="foot">
      <span class="dot"></span>
      <span class="url">13design.org — Kraków, for founders everywhere</span>
    </div>
  </div>
</body></html>`;

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise((r) => setTimeout(r, 500)); // let webfonts paint
const buf = await page.screenshot({ type: 'png' });
await writeFile(OUT, buf);
await browser.close();
console.log(`wrote ${OUT} (${(buf.length / 1024).toFixed(0)} KB)`);
