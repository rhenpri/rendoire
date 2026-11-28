// Render the 1200×630 social cards for the site's section pages into public/.
// Posts get their card from their cover image; these are for everything else.
//
// Usage: node scripts/og-cards.mjs
// Needs Playwright's Chromium (npx playwright-core install chromium).

import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// Inlined as data URLs: a page loaded with setContent cannot fetch file:// fonts.
const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(join(root, 'node_modules', pkg, 'files', file)).toString('base64')}`;

// `file` is relative to public/. Keep `title` short: it is set very large.
const cards = [
  {
    file: 'og-image.png',
    kicker: 'rendoire.com',
    title: 'rendoire',
    dot: true,
    line: 'Essays on putting AI to work in the real world, and a guide to self-hosting.',
  },
  { file: 'og/blog.png', kicker: 'Writing', title: 'The journal', line: 'Essays on AI in real organisations, and on owning your own technology.' },
  { file: 'og/self-hosting.png', kicker: 'Self-hosting', title: 'Own your data', line: 'An opinionated list of tools: private cloud, local AI, privacy apps and the hardware to run them.' },
  { file: 'og/ai.png', kicker: 'AI knowledge', title: 'From zero to agents', line: 'A learning path from the fundamentals to agents, with the books that actually teach.' },
  { file: 'og/savings.png', kicker: 'Calculator', title: 'Renting vs owning', line: 'What your subscriptions add up to over the years, against running the same things yourself.' },
  { file: 'og/about.png', kicker: 'About', title: 'Ry Henderson', line: 'Technology manager in Derry. Live services, AI, and owning your own technology.' },
];

const page = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: F; src: url(${font('@fontsource-variable/fraunces', 'fraunces-latin-wght-normal.woff2')}); font-weight: 100 900; }
@font-face { font-family: G; src: url(${font('@fontsource-variable/geist', 'geist-latin-wght-normal.woff2')}); font-weight: 100 900; }
@font-face { font-family: M; src: url(${font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2')}); }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; background: #0a0a0a; }
body {
  padding: 26px;
  background:
    radial-gradient(600px 400px at 15% 5%, rgba(62, 207, 142, 0.09), transparent 70%),
    radial-gradient(700px 400px at 95% 100%, rgba(196, 181, 253, 0.07), transparent 70%),
    #0a0a0a;
}
.frame { height: 100%; border: 1px solid rgba(255,255,255,0.09); border-radius: 22px; padding: 110px 64px 0; }
.kicker { font: 400 22px M; color: #9a9a9a; letter-spacing: 0.04em; display: flex; align-items: center; gap: 14px; }
.kicker::before { content: ''; width: 11px; height: 11px; border-radius: 50%; background: #3ecf8e; box-shadow: 0 0 12px #3ecf8e; }
h1 { font: 600 132px/1 F; color: #ececec; letter-spacing: -0.02em; margin: 34px 0 30px; }
h1 i { color: #c4b5fd; font-style: normal; }
p { font: 400 34px/1.35 G; color: #b0b0b0; max-width: 980px; }
.rule { width: 66px; height: 4px; border-radius: 2px; background: #3ecf8e; margin-top: 44px; }
</style></head><body><div class="frame">
<div class="kicker">${c.kicker}</div>
<h1 style="font-size:${c.title.length > 14 ? 104 : 132}px">${c.title}${c.dot ? '<i>.</i>' : ''}</h1>
<p>${c.line.replace(/-/g, '\u2011')}</p>
<div class="rule"></div>
</div></body></html>`;

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const c of cards) {
  const out = join(root, 'public', c.file);
  mkdirSync(dirname(out), { recursive: true });
  await tab.setContent(page(c), { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: out });
  console.log(`  ✓ public/${c.file}`);
}
await browser.close();
