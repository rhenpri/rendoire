#!/usr/bin/env node
// Turn a blog post into an Instagram carousel (+ reel) in the site's style.
//
//   npm run ig -- <slug> [--no-reel] [--no-carousel] [--no-ai] [--out <dir>] [--json]
//
// Output (default .instagram/<slug>/): slide-01.jpg ..., reel.mp4, caption.txt, reel-caption.txt,
// deck.json, preview.jpg. Publishing is a separate step (publish.mjs) so you can look first.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadPost, ROOT, listSlugs } from './lib/post.mjs';
import { buildDeck } from './lib/slides.mjs';
import { launch, renderCarousel, renderReel, contactSheet } from './lib/render.mjs';

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const val = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : null);
const slug = args.find((a) => !a.startsWith('--') && a !== val('--out'));

if (!slug) {
  console.error('Usage: npm run ig -- <slug> [--no-reel] [--no-carousel] [--no-ai] [--out dir]\n\nPosts:\n  ' + listSlugs().join('\n  '));
  process.exit(1);
}

const post = loadPost(slug);
if (post.meta?.instagram?.skip) {
  console.log(`"${slug}" has instagram.skip set, nothing to do.`);
  process.exit(0);
}

const outDir = resolve(val('--out') ?? join(ROOT, '.instagram', slug));
mkdirSync(outDir, { recursive: true });

console.log(`Building deck for "${post.title}"`);
const deck = await buildDeck(post, { ai: !flag('--no-ai') });
deck.outDir = outDir;
console.log(`  ${deck.slides.length} slides (${deck.source} copy)`);

const browser = await launch();
const result = { slug, outDir, carousel: [], reel: null };
try {
  if (!flag('--no-carousel')) {
    result.carousel = await renderCarousel(deck, browser);
    await contactSheet(deck, result.carousel);
    console.log(`  carousel: ${result.carousel.length} images`);
  }
  if (!flag('--no-reel')) {
    result.reel = await renderReel(deck, browser);
    console.log(`  reel: ${result.reel.seconds}s`);
  }
} finally {
  await browser.close();
}

writeFileSync(join(outDir, 'caption.txt'), deck.caption + '\n');
writeFileSync(join(outDir, 'reel-caption.txt'), deck.reelCaption + '\n');
const { outDir: _o, ...plainDeck } = deck;
writeFileSync(join(outDir, 'deck.json'), JSON.stringify({ ...plainDeck, ...result }, null, 2));
console.log(`Done: ${outDir}`);
if (flag('--json')) console.log(JSON.stringify(result));
