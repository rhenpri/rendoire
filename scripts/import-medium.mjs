// Import posts from a Medium publication/user RSS feed into the local
// Markdown content collection at src/content/blog/.
//
// Usage:
//   node scripts/import-medium.mjs [feedUrl]
//
// Default feed: https://medium.com/feed/@rendoire
//
// Requires `turndown` (devDependency) for HTML -> Markdown conversion.

import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import TurndownService from 'turndown';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = join(ROOT, 'src', 'content', 'blog');

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

const stripHtml = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const toYmd = (d) => d.toISOString().split('T')[0];

const cleanSlug = (link, title) => {
  const last = link.split('/').pop() || '';
  return slugify(last.replace(/-[0-9a-f]{8,16}$/i, '')) || slugify(title);
};

// Bump Medium CDN image resolution.
const upscale = (url) => url.replace(/\/max\/\d+\//, '/max/1200/');

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

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
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
  let cover = coverMatch ? upscale(coverMatch[1]) : '';
  if (coverMatch) html = html.replace(coverMatch[0], '');

  const body = turndown.turndown(html).replace(/\n{3,}/g, '\n\n').trim();
  const plain = stripHtml(html);
  const description = plain.length > 180 ? `${plain.slice(0, 177)}…` : plain;
  const slug = cleanSlug(link, title);

  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `pubDate: ${toYmd(pubDate)}`,
    `tags: [${categories.map((c) => JSON.stringify(c)).join(', ')}]`,
    cover ? `cover: ${JSON.stringify(cover)}` : null,
    link ? `medium: ${JSON.stringify(link)}` : null,
    'draft: false',
    '---',
    '',
    body,
    '',
  ]
    .filter((l) => l !== null)
    .join('\n');

  writeFileSync(join(OUT_DIR, `${slug}.md`), frontmatter, 'utf8');
  console.log(`  ✓ ${slug}.md  (${title})`);
  count++;
}

console.log(`\nImported ${count} posts into src/content/blog/.`);
