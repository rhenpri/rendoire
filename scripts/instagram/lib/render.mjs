// Render a deck with headless Chromium: JPEG stills for the carousel, an H.264 MP4 for the reel.

import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { buildHtml, SIZES } from './html.mjs';

export const FPS = 30;

async function launch() {
  return chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-gpu-vsync'],
  });
}

/** Decide per image whether to crop (photos) or letterbox (diagrams, very wide screens). */
async function imageFits(deck) {
  const fits = new Map();
  for (const s of deck.slides) {
    if (!s.image || s.type === 'cover' || fits.has(s.image) || !existsSync(s.image)) continue;
    const { width, height } = await sharp(s.image).metadata();
    const r = width / height;
    fits.set(s.image, r > 1.9 ? 'skip' : r < 0.75 ? 'contain' : 'cover');
  }
  return fits;
}

async function open(browser, deck, format) {
  const { w, h } = SIZES[format];
  const fits = await imageFits(deck);
  for (const sl of deck.slides) if (sl.type !== 'cover' && sl.image && fits.get(sl.image) === 'skip') sl.image = null;
  const { html, starts, total } = buildHtml(deck, format, fits);
  const dir = join(deck.outDir, '.build');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${format}.html`);
  writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => window.prepare());
  return { page, starts, total };
}

export async function renderCarousel(deck, browser) {
  const { page } = await open(browser, deck, 'carousel');
  const files = [];
  for (let i = 0; i < deck.slides.length; i++) {
    await page.evaluate((n) => window.showStill(n), i);
    await page.waitForTimeout(60);
    const jpg = await page.screenshot({ type: 'jpeg', quality: 93 });
    const name = `slide-${String(i + 1).padStart(2, '0')}.jpg`;
    writeFileSync(join(deck.outDir, name), jpg);
    files.push(name);
  }
  await page.close();
  return files;
}

export async function renderReel(deck, browser, { fps = FPS } = {}) {
  const { page, total } = await open(browser, deck, 'reel');
  const out = join(deck.outDir, 'reel.mp4');
  const ff = spawn(
    'ffmpeg',
    [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
      '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', '-r', String(fps),
      out,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  const done = new Promise((res, rej) => {
    ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`))));
    ff.on('error', rej);
  });
  const frames = Math.ceil(total * fps);
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.frame(t), f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 90 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 90 === 0) process.stdout.write(`\r  reel frame ${f}/${frames}`);
  }
  process.stdout.write(`\r  reel frame ${frames}/${frames}\n`);
  ff.stdin.end();
  await done;
  await page.close();
  return { file: 'reel.mp4', seconds: +total.toFixed(1) };
}

/** One image with every slide side by side, for a quick look before anything is posted. */
export async function contactSheet(deck, files) {
  const th = 540, tw = 432;
  const tiles = await Promise.all(files.map((f) => sharp(join(deck.outDir, f)).resize(tw, th).jpeg({ quality: 88 }).toBuffer()));
  const cols = Math.min(5, tiles.length);
  const rows = Math.ceil(tiles.length / cols);
  const gap = 16;
  const sheet = sharp({ create: { width: cols * tw + (cols + 1) * gap, height: rows * th + (rows + 1) * gap, channels: 3, background: '#050505' } });
  await sheet
    .composite(tiles.map((input, i) => ({ input, left: gap + (i % cols) * (tw + gap), top: gap + Math.floor(i / cols) * (th + gap) })))
    .jpeg({ quality: 88 })
    .toFile(join(deck.outDir, 'preview.jpg'));
}

export { launch };
