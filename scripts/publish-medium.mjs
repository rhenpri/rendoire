// Cross-post a local Markdown post to Medium.
//
// Prerequisites:
//   1. Create a Medium integration token: https://medium.com/me/settings
//      → "Security and apps" → "Integration tokens".
//   2. Export it:  export MEDIUM_TOKEN=<token>
//
// Usage:
//   node scripts/publish-medium.mjs <slug> [--public]
//
//   <slug>     Filename without .md, e.g. "the-models-were-the-easy-part"
//   --public   Publish immediately (default is draft so you can review on Medium)
//
// The post is created with `canonicalUrl` pointing back to your own site, so
// Medium attributes the original to rendoire.com (good for SEO — no duplicate
// content penalty).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BLOG_DIR = join(ROOT, 'src', 'content', 'blog');
const SITE = 'https://rendoire.com';

const [slugArg, ...flags] = process.argv.slice(2);
const isPublic = flags.includes('--public');

if (!slugArg) {
  console.error('Usage: node scripts/publish-medium.mjs <slug> [--public]');
  process.exit(1);
}

const token = process.env.MEDIUM_TOKEN;
if (!token) {
  console.error('Missing MEDIUM_TOKEN. Export it first (see script header).');
  process.exit(1);
}

const file = join(BLOG_DIR, `${slugArg.replace(/\.md$/, '')}.md`);
let source;
try {
  source = readFileSync(file, 'utf8');
} catch {
  console.error(`Post not found: ${file}`);
  process.exit(1);
}

// --- tiny frontmatter parser for our known schema ----------------------
function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { body: md, data: {} };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, raw] = kv;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw.replace(/^"|"$/g, '');
    }
  }
  return { body: m[2].trim(), data };
}

const parsed = parseFrontmatter(source);
const { data } = parsed;
let { body } = parsed;

// Post images live in src/assets/ and only get a public URL once the site is
// built and deployed. Medium fetches images by URL, so swap each local image
// for the one on the live page (same order). Deploy the post before
// cross-posting it; if the live page is missing or out of step, stop instead
// of sending Medium a post with broken images.
const localImage = /!\[([^\]]*)\]\((\.{1,2}\/[^)\s]+)\)/g;
const localImages = [...body.matchAll(localImage)];
if (localImages.length > 0) {
  const pageUrl = `${SITE}/blog/${slugArg.replace(/\.md$/, '')}/`;
  const page = await fetch(pageUrl);
  const pageHtml = page.ok ? await page.text() : '';
  const article = pageHtml.split('class="article-body"')[1]?.split('</article>')[0] ?? '';
  const live = [...article.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map((m) => new URL(m[1], SITE).href);
  if (live.length !== localImages.length) {
    console.error(
      `This post has ${localImages.length} local image(s) but ${pageUrl} shows ${live.length}.\n` +
        'Deploy the post first, then run this again.',
    );
    process.exit(1);
  }
  let i = 0;
  body = body.replace(localImage, (_, alt) => `![${alt}](${live[i++]})`);
}

marked.setOptions({ gfm: true, breaks: false });
let html = marked.parse(body);
// Append attribution + original link so readers find the canonical source.
html += `\n<hr/>\n<p><em>Originally published at <a href="${SITE}/blog/${slugArg.replace(/\.md$/, '')}/">${SITE}/blog/${slugArg.replace(/\.md$/, '')}/</a>.</em></p>`;

// --- Medium API --------------------------------------------------------
const meRes = await fetch('https://api.medium.com/v1/me', {
  headers: { Authorization: `Bearer ${token}` },
});
if (!meRes.ok) {
  console.error(`Failed to authenticate with Medium: ${meRes.status} ${meRes.statusText}`);
  console.error(await meRes.text());
  process.exit(1);
}
const { data: me } = await meRes.json();

const payload = {
  title: data.title || slugArg,
  contentFormat: 'html',
  content: html,
  tags: (data.tags || []).slice(0, 5),
  canonicalUrl: `${SITE}/blog/${slugArg.replace(/\.md$/, '')}/`,
  publishStatus: isPublic ? 'public' : 'draft',
  license: 'cc-40-by',
};

const pubRes = await fetch(`https://api.medium.com/v1/users/${me.id}/posts`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

if (!pubRes.ok) {
  console.error(`Failed to publish to Medium: ${pubRes.status} ${pubRes.statusText}`);
  console.error(await pubRes.text());
  process.exit(1);
}

const { data: post } = await pubRes.json();
console.log(`✓ ${isPublic ? 'Published' : 'Draft created'} on Medium:`);
console.log(`  ${post.url}`);
console.log(`  canonical → ${payload.canonicalUrl}`);
