// Shared post-processing for Markdown posts in src/content/blog/.
// Used by import-medium.mjs (new imports) and tidy-posts.mjs (existing files).
//
// Everything here is idempotent: running it twice changes nothing.

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, '..', '..');
export const BLOG_DIR = join(ROOT, 'src', 'content', 'blog');
export const ASSET_DIR = join(ROOT, 'src', 'assets', 'blog');

const UA = 'site-image-fetch/1.0';
const MAX_WIDTH = 1600;

// --- topics ---------------------------------------------------------------
// Medium tags are written for Medium's discovery, so ten posts end up with
// thirty-odd near-duplicates. Fold them into the handful of topics the site is
// actually about. Unknown tags pass through untouched; `null` drops a tag that
// says nothing ("technology" on a technology blog).
const TOPIC_MAP = {
  ai: 'ai',
  'artificial-intelligence': 'ai',
  'ai-development': 'ai',
  'ai-engineering': 'ai',
  'ai-agent': 'ai',
  'agentic-ai': 'ai',
  'future-technology': 'ai',
  'mixture-of-experts': 'ai',
  token: 'ai',

  'self-hosting': 'self-hosting',

  privacy: 'privacy',
  security: 'privacy',
  grapheneos: 'privacy',
  android: 'privacy',

  'digital-minimalism': 'digital-minimalism',
  dumbphone: 'digital-minimalism',
  unihertz: 'digital-minimalism',
  gamification: 'digital-minimalism',

  software: 'software',
  'software-engineering': 'software',
  'systems-thinking': 'software',

  neurodiversity: 'neurodiversity',
  dyslexia: 'neurodiversity',

  philosophy: 'culture',
  'future-of-work': 'culture',

  technology: null,
  business: null,
  'business-technology': null,
  'tech-strategy': null,
  innovation: null,
  entrepeneurship: null,
  entrepreneurship: null,
  review: null,
};

export function normalizeTags(tags) {
  const out = [];
  for (const raw of tags) {
    const key = String(raw).trim().toLowerCase().replace(/\s+/g, '-');
    const mapped = key in TOPIC_MAP ? TOPIC_MAP[key] : key;
    if (mapped && !out.includes(mapped)) out.push(mapped);
  }
  return out.length ? out : ['culture'];
}

// --- body cleanup -----------------------------------------------------------

export function cleanBody(md) {
  return (
    md
      // Medium's read-tracking pixel rides along in the RSS body.
      .replace(/^!\[[^\]]*\]\(https?:\/\/medium\.com\/_\/stat\?[^)]*\)\s*$/gm, '')
      // "word*(aside)*" is not valid emphasis in CommonMark; it needs a space.
      .replace(/([A-Za-z0-9])\*\(/g, '$1 *(')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  );
}

// --- description ------------------------------------------------------------
// The first real sentence(s) of the post: skips epigraphs, headings, images,
// a repeated title and italic-only subtitle lines, then cuts on a sentence
// boundary instead of mid-word.

const plain = (s) =>
  s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]+/g, '')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

export function describe(body, title, max = 165) {
  const paras = body.split(/\n{2,}/).map((p) => p.trim());
  let text = '';
  for (const p of paras) {
    if (!p || /^(>|#|!\[|---|```|[-*] )/.test(p)) continue;
    const t = plain(p);
    if (t.length < 40) continue; // bylines, captions, stray labels
    if (norm(t).includes(norm(title)) && t.length < title.length + 20) continue;
    text = text ? `${text} ${t}` : t;
    if (text.length >= 90) break;
  }
  if (!text) return title;
  if (text.length <= max) return text;

  const sentences = text.match(/[^.!?]+[.!?]+[”"’')\]]*(?=\s|$)/g) ?? [];
  let out = '';
  for (const s of sentences) {
    if ((out + s).trim().length > max) break;
    out += s;
  }
  out = out.trim();
  if (out.length >= 60) return out;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

// --- images -----------------------------------------------------------------
// Download remote images next to the site source so the build can resize and
// re-encode them, and so a post never depends on someone else's CDN.

const EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

async function download(url, dir, base) {
  const have = existsSync(dir) ? readdirSync(dir).find((f) => f.startsWith(`${base}.`)) : null;
  if (have) return have;
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  const type = (res.headers.get('content-type') ?? '').split(';')[0].trim();
  const ext = EXT[type];
  if (!ext) throw new Error(`unexpected content-type "${type}" for ${url}`);
  mkdirSync(dir, { recursive: true });
  let bytes = Buffer.from(await res.arrayBuffer());
  let file = `${base}.${ext}`;
  // Keep the repo small: store photos and illustrations as WebP, capped at
  // MAX_WIDTH. The build still derives the sizes each page needs from these.
  if (ext === 'jpg' || ext === 'png') {
    bytes = await sharp(bytes)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 86 })
      .toBuffer();
    file = `${base}.webp`;
  }
  writeFileSync(join(dir, file), bytes);
  return file;
}

// Ask Medium's CDN for a larger rendition than the feed links to.
const upscale = (url) => url.replace(/(cdn-images-\d+\.medium\.com)\/max\/\d+\//, '$1/max/1600/');

const isRemote = (s) => /^https?:\/\//.test(s);

/**
 * Returns { cover, body } with every remote image replaced by a relative path
 * into src/assets/blog/<slug>/. An image that fails to download keeps its
 * remote URL and is reported, so one dead link never blocks an import.
 */
export async function localizeImages({ slug, cover, body }) {
  const dir = join(ASSET_DIR, slug);
  const rel = (file) => `../../assets/blog/${slug}/${file}`;
  const failures = [];

  if (cover && isRemote(cover)) {
    try {
      cover = rel(await download(upscale(cover), dir, 'cover'));
    } catch (e) {
      failures.push(e.message);
    }
  }

  // Body images are named after a hash of their source URL, so importing the
  // same post again reuses the file instead of downloading a second copy.
  const matches = [...body.matchAll(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g)];
  for (const m of matches) {
    try {
      const base = createHash('sha1').update(m[2]).digest('hex').slice(0, 10);
      const file = await download(upscale(m[2]), dir, base);
      body = body.replace(m[0], `![${m[1]}](${rel(file)})`);
    } catch (e) {
      failures.push(e.message);
    }
  }

  return { cover, body, failures };
}

// --- frontmatter ------------------------------------------------------------
// The files are written by these scripts, so the format is known: one
// `key: <JSON value or bare scalar>` per line.

export function parsePost(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error('missing frontmatter');
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    try {
      data[key] = JSON.parse(value);
    } catch {
      data[key] = value;
    }
  }
  return { data, body: m[2].replace(/^\n+/, '') };
}

const ORDER = ['title', 'description', 'pubDate', 'updatedDate', 'tags', 'cover', 'coverAlt', 'medium', 'draft', 'featured'];

export function serializePost(data, body) {
  const keys = [...ORDER.filter((k) => k in data), ...Object.keys(data).filter((k) => !ORDER.includes(k))];
  const lines = keys
    .filter((k) => data[k] !== undefined && data[k] !== null && data[k] !== '')
    .map((k) => {
      const v = data[k];
      if (k === 'pubDate' || k === 'updatedDate') return `${k}: ${v}`;
      if (Array.isArray(v)) return `${k}: [${v.map((x) => JSON.stringify(x)).join(', ')}]`;
      return `${k}: ${JSON.stringify(v)}`;
    });
  return `---\n${lines.join('\n')}\n---\n\n${body.trim()}\n`;
}
