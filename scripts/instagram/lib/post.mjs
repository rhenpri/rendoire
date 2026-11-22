// Read a blog post from src/content/blog and turn it into structured sections
// that the slide builder can work with.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { marked } from 'marked';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, '..', '..', '..');
export const BLOG_DIR = join(ROOT, 'src', 'content', 'blog');
export const SITE = 'https://rendoire.com';

export function listSlugs() {
  return readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx?$/, ''));
}

/** Split `---\nyaml\n---\nbody`. */
function splitFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  return { meta: YAML.parse(m[1]) ?? {}, body: m[2] };
}

const resolveAsset = (file, rel) => (rel && !/^https?:/.test(rel) ? resolve(dirname(file), rel) : null);

/** Strip emoji and markdown noise from a string. */
export function clean(s) {
  return String(s ?? '')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Inline tokens to a string that keeps **bold** and drops everything else. */
export function inline(tokens = []) {
  let out = '';
  for (const t of tokens) {
    if (t.type === 'strong') out += `**${inline(t.tokens)}**`;
    else if (t.type === 'em') out += inline(t.tokens);
    else if (t.type === 'link') out += inline(t.tokens);
    else if (t.type === 'codespan') out += t.text;
    else if (t.type === 'image') out += '';
    else if (t.type === 'br') out += ' ';
    else if (t.tokens) out += inline(t.tokens);
    else out += t.text ?? t.raw ?? '';
  }
  return out.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

export const plain = (s) => String(s).replace(/\*\*/g, '');

/** Load a post. Throws if the slug does not exist. */
export function loadPost(slug) {
  const file = ['.md', '.mdx'].map((e) => join(BLOG_DIR, slug + e)).find(existsSync);
  if (!file) throw new Error(`No post called "${slug}" in ${BLOG_DIR}`);
  const { meta, body } = splitFrontmatter(readFileSync(file, 'utf8'));
  const tokens = marked.lexer(body);

  // Standfirst: a first paragraph made only of italic text.
  let standfirst = '';
  const firstPara = tokens.find((t) => t.type === 'paragraph');
  if (firstPara && firstPara.tokens.length === 1 && firstPara.tokens[0].type === 'em') {
    standfirst = inline(firstPara.tokens[0].tokens);
  }

  // Sections: split on h2/h3. Stop at the first horizontal rule (credits).
  const sections = [];
  let cur = { heading: '', blocks: [] };
  const push = () => {
    if (cur.blocks.length) sections.push(cur);
  };
  for (const t of tokens) {
    if (t.type === 'hr') break;
    if (t.type === 'heading' && t.depth >= 2 && t.depth <= 3) {
      push();
      cur = { heading: clean(inline(t.tokens)), blocks: [] };
      continue;
    }
    if (t.type === 'space' || t.type === 'heading') continue;
    if (t === firstPara && standfirst) continue;
    cur.blocks.push(t);
  }
  push();

  // Normalise blocks into a friendlier shape.
  for (const s of sections) {
    s.items = [];
    for (const b of s.blocks) {
      if (b.type === 'paragraph') {
        const img = b.tokens.find((x) => x.type === 'image');
        if (img && b.tokens.every((x) => x.type === 'image' || (x.type === 'text' && !x.text.trim()))) {
          s.items.push({ kind: 'image', alt: clean(img.text), src: resolveAsset(file, img.href) });
        } else {
          s.items.push({ kind: 'p', text: inline(b.tokens) });
        }
      } else if (b.type === 'list') {
        s.items.push({
          kind: 'list',
          ordered: b.ordered,
          items: b.items.map((i) => inline(i.tokens.flatMap((x) => x.tokens ?? [x]))),
        });
      } else if (b.type === 'blockquote') {
        s.items.push({ kind: 'quote', text: inline(b.tokens.flatMap((x) => x.tokens ?? [x])) });
      }
    }
  }

  const base = new URL(`/blog/${slug}/`, SITE).href;
  return {
    slug,
    file,
    meta,
    url: base,
    title: meta.title ?? slug,
    description: meta.description ?? '',
    tags: meta.tags ?? [],
    cover: resolveAsset(file, meta.cover),
    standfirst,
    sections,
    plainText: body,
  };
}
