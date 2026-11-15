// Import posts from a Medium publication/user RSS feed into the local
// Markdown content collection at src/content/blog/.
//
// Usage:
//   node scripts/import-medium.mjs [feedUrl]
//
// Default feed: https://medium.com/feed/@rendoire
//
// Requires `turndown` (devDependency) for HTML -> Markdown conversion.
//
// The import is additive and respects local edits:
//   - posts that are not in the feed (written here, or older than the feed's
//     window) are left alone;
//   - for a post that already exists, the title, description, tags and
//     coverAlt you have on disk win over what Medium sends;
//   - images are downloaded into src/assets/blog/<slug>/ and Medium's
//     tracking pixel is stripped (see scripts/lib/posts.mjs).

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import TurndownService from 'turndown';
import {
  BLOG_DIR as OUT_DIR,
  cleanBody,
  describe,
  localizeImages,
  normalizeTags,
  parsePost,
  serializePost,
} from './lib/posts.mjs';

const FEED_URL = process.argv[2] || 'https://medium.com/feed/@rendoire';
const UA = 'rendoire-import/1.0 (+https://rendoire.com)';

// --- helpers -------------------------------------------------------------

const cdata = (xml, tag) => {
  const re = new RegExp(
    `<${tag}(?:[^>]*)>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`,
    'i',
  );
  const m = xml.match(re);
  if (!m) return '';
  return m[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const toYmd = (d) => d.toISOString().split('T')[0];

const cleanSlug = (link, title) => {
  const last = link.split('/').pop() || '';
  return slugify(last.replace(/-[0-9a-f]{8,16}$/i, '')) || slugify(title);
};

// --- turndown configuration ---------------------------------------------

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  strongDelimiter: '**',
});

turndown.addRule('figure', {
  filter: 'figure',
  replacement: (content) => `\n\n${content.trim()}\n\n`,
});
turndown.addRule('figcaption', {
  filter: 'figcaption',
  replacement: (content) => `\n\n_${content.trim()}_\n\n`,
});
turndown.remove(['script', 'style', 'noscript']);

// --- main ----------------------------------------------------------------

const res = await fetch(FEED_URL, { headers: { 'user-agent': UA } });
if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
const xml = await res.text();

const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((m) => m[1]);
console.log(`Found ${items.length} posts in feed.`);

mkdirSync(OUT_DIR, { recursive: true });
const problems = [];
let count = 0;

for (const item of items) {
  let title = cdata(item, 'title');
  const link = cdata(item, 'link').replace(/\?source=.*$/, '');
  const pubDate = new Date(cdata(item, 'pubDate'));
  let html = cdata(item, 'content:encoded') || cdata(item, 'description');

  const categories = [...item.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)]
    .map((m) => m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim())
    .filter(Boolean);

  if (!title || !html) continue;

  // Medium sometimes truncates long titles in RSS; fall back to og:title.
  if (title.endsWith('…') && link) {
    try {
      const page = await fetch(link, { headers: { 'user-agent': UA } });
      if (page.ok) {
        const pageHtml = await page.text();
        const og = pageHtml.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
        if (og) title = og[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
      }
    } catch {
      /* keep truncated title */
    }
  }

  // Extract hero image and drop it from the body to avoid duplication.
  const coverMatch = html.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
  let cover = coverMatch ? coverMatch[1] : '';
  if (coverMatch) html = html.replace(coverMatch[0], '');

  const slug = cleanSlug(link, title);
  const path = join(OUT_DIR, `${slug}.md`);
  const existing = existsSync(path) ? parsePost(readFileSync(path, 'utf8')).data : {};

  // Recover a full title when Medium truncated it and og:title was blocked.
  if (title.endsWith('…') || title.endsWith('...')) {
    const fromSlug = slug
      .split('-')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ');
    if (fromSlug.length > title.length) title = fromSlug;
  }

  let body = cleanBody(turndown.turndown(html));
  const localized = await localizeImages({ slug, cover, body });
  ({ cover, body } = localized);
  for (const f of localized.failures) problems.push(`${slug}: ${f}`);

  const data = {
    title: existing.title ?? title,
    description: existing.description ?? describe(body, title),
    pubDate: toYmd(pubDate),
    updatedDate: existing.updatedDate,
    tags: existing.tags ?? normalizeTags(categories),
    cover: cover || undefined,
    coverAlt: existing.coverAlt,
    medium: link || undefined,
    draft: existing.draft ?? false,
    featured: existing.featured || undefined,
  };

  writeFileSync(path, serializePost(data, body), 'utf8');
  console.log(`  ${existing.title ? '↻' : '✓'} ${slug}.md  (${data.title})`);
  count++;
}

console.log(`\nImported ${count} posts into src/content/blog/.`);
if (problems.length) {
  console.log(`\n${problems.length} image(s) could not be downloaded and still point at the remote URL:`);
  for (const p of problems) console.log(`  - ${p}`);
}
