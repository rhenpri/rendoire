// Typographic post covers in the site's own style, so no cover depends on a
// photo whose licence we cannot show. Each cover is the post title over one of
// the MiniViz glyphs, rendered at 1600×900 and saved as cover.webp.
//
// Usage:
//   node scripts/covers.mjs                 # every post listed below
//   node scripts/covers.mjs <slug> [...]    # just these
//
// Then point the post's frontmatter at ../../assets/blog/<slug>/cover.webp.

import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// slug → glyph (a key in src/components/MiniViz.astro), kicker, and how many
// trailing words of the title to set in green.
const COVERS = {
  'the-safety-was-never-in-the-model': { glyph: 'hallucination', kicker: 'AI · Between the model and the real world', accent: 2 },
  'the-models-were-the-easy-part': { glyph: 'mcp', kicker: 'AI · Between the model and the real world', accent: 2 },
  'built-different-the-structural-shift-of-agentic-ai': { glyph: 'agent', kicker: 'AI · Between the model and the real world', accent: 1, title: 'Built Different' },
  'streaming-was-practice': { glyph: 'media', kicker: 'Culture · AI', accent: 1 },
  'the-best-technology-is-human': { glyph: 'graph', kicker: 'Culture', accent: 1, title: 'The Best Technology Is Human' },
  'think-different-the-dyslexic-advantage-in-systems-thinking': { glyph: 'transformer', kicker: 'Neurodiversity · Systems', accent: 2, title: 'The Dyslexic Advantage' },
  'grapheneos-review': { glyph: 'security', kicker: 'Privacy · Taking my devices back', accent: 1 },
};

const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(join(root, 'node_modules', pkg, 'files', file)).toString('base64')}`;

// Pull the glyph SVG bodies straight out of the component, so covers match the site.
const miniviz = readFileSync(join(root, 'src/components/MiniViz.astro'), 'utf8');
const glyph = (key) => {
  const m = new RegExp(`^\\s+${key}: \`([\\s\\S]*?)\`,$`, 'm').exec(miniviz);
  if (!m) throw new Error(`no MiniViz glyph "${key}"`);
  return m[1];
};

const titleOf = (slug) => {
  const raw = readFileSync(join(root, 'src/content/blog', `${slug}.md`), 'utf8');
  return /^title:\s*"?(.*?)"?\s*$/m.exec(raw)[1];
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const page = ({ title, kicker, glyphSvg, accent }) => {
  const words = title.split(' ');
  const head = esc(words.slice(0, words.length - accent).join(' '));
  const tail = esc(words.slice(words.length - accent).join(' '));
  const size = title.length > 34 ? 104 : title.length > 22 ? 122 : 140;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: F; src: url(${font('@fontsource-variable/fraunces', 'fraunces-latin-wght-normal.woff2')}); font-weight: 100 900; }
@font-face { font-family: M; src: url(${font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2')}); }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1600px; height: 900px; }
body {
  --green: #3ecf8e; --purple: #c4b5fd; --red: #f87171;
  display: grid; grid-template-columns: 1fr 560px; align-items: center; gap: 40px;
  padding: 0 100px;
  background:
    radial-gradient(900px 600px at 10% 0%, rgba(62, 207, 142, 0.08), transparent 70%),
    radial-gradient(900px 600px at 100% 100%, rgba(196, 181, 253, 0.07), transparent 70%),
    #0a0a0a;
}
.kicker { font: 400 24px M; letter-spacing: 0.14em; text-transform: uppercase; color: #8f8f8f; padding-bottom: 14px; border-bottom: 2px solid var(--green); display: inline-block; }
h1 { font: 600 ${size}px/1.02 F; letter-spacing: -0.02em; color: #ececec; margin-top: 44px; }
h1 em { font-style: normal; color: var(--green); }
.mark { font: 400 22px M; color: #6f6f6f; margin-top: 48px; letter-spacing: 0.08em; }
.panel { height: 560px; border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; background: #101010; display: grid; place-items: center; }
.panel svg { width: 460px; height: auto; }
</style></head><body>
<div><span class="kicker">${esc(kicker)}</span><h1>${head} <em>${tail}</em></h1><div class="mark">rendoire.com</div></div>
<div class="panel"><svg viewBox="0 0 120 80" fill="none">${glyphSvg}</svg></div>
</body></html>`;
};

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(COVERS);
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1600, height: 900 } });
for (const slug of slugs) {
  const c = COVERS[slug];
  if (!c) throw new Error(`no cover settings for ${slug}`);
  await tab.setContent(page({ title: c.title ?? titleOf(slug), kicker: c.kicker, glyphSvg: glyph(c.glyph), accent: c.accent }));
  await tab.evaluate(() => document.fonts.ready);
  const png = await tab.screenshot();
  const out = join(root, 'src/assets/blog', slug, 'cover.webp');
  mkdirSync(dirname(out), { recursive: true });
  await sharp(png).webp({ quality: 86 }).toFile(out);
  console.log(`  ✓ ${slug}`);
}
await browser.close();
