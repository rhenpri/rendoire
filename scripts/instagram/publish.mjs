#!/usr/bin/env node
// Publish a generated deck to Instagram through the Graph API.
//
//   node scripts/instagram/publish.mjs <slug> --base <public url dir> [--dir <local dir>] [--formats carousel,reel] [--dry]
//
// --base   where the slides and reel are reachable from the internet, e.g. https://rendoire.com/ig/<slug>
//          (Instagram downloads them from there; it never accepts an upload)
// Env:     IG_ACCESS_TOKEN  long-lived token (required unless --dry)
//          IG_USER_ID       Instagram account id (default "me", which works with Instagram Login tokens)
//          IG_API_BASE      default https://graph.instagram.com/v23.0 (use https://graph.facebook.com/v23.0 for Facebook Login tokens)
//
// Safe to re-run: it looks at your recent posts first and skips anything already published for this slug.

import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const val = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : null);
const flag = (f) => args.includes(f);
const slug = args.find((a) => !a.startsWith('--') && ![val('--base'), val('--dir'), val('--formats')].includes(a));
const dry = flag('--dry');
const base = (val('--base') ?? '').replace(/\/$/, '');
const dir = resolve(val('--dir') ?? `.instagram/${slug}`);
const formats = (val('--formats') ?? process.env.IG_FORMATS ?? 'carousel,reel').split(',').map((s) => s.trim());

const TOKEN = process.env.IG_ACCESS_TOKEN;
const USER = process.env.IG_USER_ID || 'me';
const API = (process.env.IG_API_BASE || 'https://graph.instagram.com/v23.0').replace(/\/$/, '');

if (!slug || !base) {
  console.error('Usage: publish.mjs <slug> --base <url> [--dir dir] [--formats carousel,reel] [--dry]');
  process.exit(1);
}
if (!dry && !TOKEN) {
  console.log('IG_ACCESS_TOKEN is not set, so nothing is published. Slides are generated and ready.');
  process.exit(0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

async function api(path, { method = 'GET', params = {} } = {}) {
  const url = new URL(`${API}/${path}`);
  const body = new URLSearchParams();
  const all = { ...params, access_token: TOKEN };
  for (const [k, v] of Object.entries(all)) if (v !== undefined && v !== null) (method === 'GET' ? url.searchParams : body).set(k, String(v));
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { method, body: method === 'GET' ? undefined : body });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return json;
    const e = json.error ?? {};
    const transient = res.status >= 500 || e.is_transient;
    if (transient && attempt < 4) {
      await sleep(4000 * attempt);
      continue;
    }
    throw new Error(`Instagram API ${res.status} on ${path}: ${e.message ?? JSON.stringify(json)} (code ${e.code ?? '?'})`);
  }
}

/** Instagram fetches from a URL, so wait until the deploy has made the file public. */
async function waitForUrl(url, kind, minutes = 8) {
  const until = Date.now() + minutes * 60_000;
  while (Date.now() < until) {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow' }).catch(() => null);
    const type = r?.headers.get('content-type') ?? '';
    if (r?.ok && type.startsWith(kind)) return;
    log(`  waiting for ${url} (${r?.status ?? 'no response'} ${type})`);
    await sleep(15_000);
  }
  throw new Error(`${url} never became available`);
}

async function waitFinished(id, label, minutes = 10) {
  const until = Date.now() + minutes * 60_000;
  while (Date.now() < until) {
    const { status_code, status } = await api(id, { params: { fields: 'status_code,status' } });
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`${label} failed: ${status ?? status_code}`);
    await sleep(6000);
  }
  throw new Error(`${label} did not finish in ${minutes} minutes`);
}

async function permalink(id) {
  return (await api(id, { params: { fields: 'permalink' } })).permalink;
}

/** Look at recent posts for this slug's link so a re-run never double posts. */
async function alreadyPosted() {
  const marker = `rendoire.com/blog/${slug}`;
  const { data = [] } = await api(`${USER}/media`, { params: { fields: 'caption,media_type,media_product_type,permalink', limit: 50 } });
  const mine = data.filter((m) => (m.caption ?? '').includes(marker));
  return {
    carousel: mine.find((m) => m.media_type === 'CAROUSEL_ALBUM')?.permalink ?? null,
    reel: mine.find((m) => m.media_product_type === 'REELS')?.permalink ?? null,
  };
}

const read = (f) => readFileSync(join(dir, f), 'utf8').trim();

async function postCarousel() {
  const deck = JSON.parse(read('deck.json'));
  const images = deck.carousel;
  const caption = read('caption.txt');
  log(`Carousel: ${images.length} images`);
  if (dry) return log(`  [dry] would post ${images.map((i) => `${base}/${i}`).join(', ')}`);
  const children = [];
  for (const [i, name] of images.entries()) {
    const url = `${base}/${name}`;
    await waitForUrl(url, 'image');
    const alt = (deck.alt?.[i] ?? '').slice(0, 1000);
    const { id } = await api(`${USER}/media`, { method: 'POST', params: { image_url: url, is_carousel_item: true, alt_text: alt || undefined } });
    children.push(id);
  }
  for (const id of children) await waitFinished(id, `image ${id}`, 3);
  const { id: container } = await api(`${USER}/media`, { method: 'POST', params: { media_type: 'CAROUSEL', children: children.join(','), caption } });
  await waitFinished(container, 'carousel', 5);
  const { id } = await api(`${USER}/media_publish`, { method: 'POST', params: { creation_id: container } });
  const link = await permalink(id);
  log(`  published: ${link}`);
  return link;
}

async function postReel() {
  const caption = read('reel-caption.txt');
  const url = `${base}/reel.mp4`;
  log('Reel');
  if (dry) return log(`  [dry] would post ${url}`);
  await waitForUrl(url, 'video');
  const { id: container } = await api(`${USER}/media`, {
    method: 'POST',
    params: { media_type: 'REELS', video_url: url, caption, share_to_feed: true, thumb_offset: 2600 },
  });
  await waitFinished(container, 'reel', 12);
  const { id } = await api(`${USER}/media_publish`, { method: 'POST', params: { creation_id: container } });
  const link = await permalink(id);
  log(`  published: ${link}`);
  return link;
}

const done = dry ? { carousel: null, reel: null } : await alreadyPosted();
const out = {};
if (formats.includes('carousel')) {
  if (done.carousel) log(`Carousel already posted: ${done.carousel}`);
  else out.carousel = await postCarousel();
}
if (formats.includes('reel')) {
  if (done.reel) log(`Reel already posted: ${done.reel}`);
  else if (existsSync(join(dir, 'reel.mp4'))) out.reel = await postReel();
}

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Instagram: ${slug}\n${Object.entries(out).map(([k, v]) => `- ${k}: ${v ?? '(dry run)'}`).join('\n') || '- nothing new to publish'}\n`,
  );
}
