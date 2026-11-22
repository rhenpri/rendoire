// Turn a parsed post into a slide model. Deterministic by default; an optional
// AI pass (see ai.mjs) or hand-written `instagram:` frontmatter can replace the copy.

import { resolve, dirname } from 'node:path';
import { plain, clean } from './post.mjs';
import { curate } from './ai.mjs';

export const MAX_CONTENT_SLIDES = 8; // cover + 8 + cta = 10, Instagram's carousel limit

/** House style: no em or en dashes anywhere in generated copy. */
export function sanitize(s) {
  return String(s ?? '')
    .replace(/[ \t]*[\u2014\u2013][ \t]*/g, ', ')
    .replace(/\u2026/g, '...')
    .replace(/,\s*,/g, ',')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .trim();
}

const sentences = (t) => t.split(/(?<=[.!?])\s+(?=[A-Z"'*“(])/).filter(Boolean);

/** Cut to a length at a word boundary, preferring a sentence end. */
export function clip(text, max) {
  const t = text.trim();
  if (plain(t).length <= max) return t;
  let out = '';
  for (const s of sentences(t)) {
    if (plain(out + ' ' + s).trim().length > max) break;
    out = (out + ' ' + s).trim();
  }
  if (out) return out;
  const cut = t.slice(0, max).replace(/\s+\S*$/, '').replace(/[,;:*\s]+$/, '');
  return cut.replace(/\*\*/g, '') + '...';
}

const stripEnd = (s) => s.replace(/[.:;,\s]+$/, '');

/** "**Lead.** rest" to {lead, text}. */
function leadSplit(item) {
  const m = item.match(/^\*\*(.+?)\*\*[\s.:,]*(.*)$/);
  if (m) return { lead: stripEnd(m[1]), text: m[2].trim() };
  const [first, ...rest] = sentences(item);
  if (first && plain(first).length <= 60) return { lead: stripEnd(first), text: rest.join(' ') };
  const colon = item.indexOf(':');
  if (colon > 0 && colon < 60) return { lead: item.slice(0, colon), text: item.slice(colon + 1).trim() };
  return { lead: clip(item, 56), text: '' };
}

/** Pick the emphasised tail of a title (rendered italic lavender, like the site's hero). */
export function splitTitle(title, emphasis) {
  if (emphasis && title.includes(emphasis)) {
    const i = title.indexOf(emphasis);
    return { lead: title.slice(0, i).trim(), em: emphasis, tail: title.slice(i + emphasis.length) };
  }
  const m = title.match(/^(.*?)(\s*[&:,]\s*)(.+)$/);
  if (m) return { lead: m[1] + m[2].replace(/\s+$/, ' '), em: m[3], tail: '' };
  const w = title.split(' ');
  if (w.length <= 3) return { lead: '', em: title, tail: '' };
  const n = Math.min(2, Math.floor(w.length / 3) || 1);
  return { lead: w.slice(0, -n).join(' ') + ' ', em: w.slice(-n).join(' '), tail: '' };
}

const SKIP = /^(links?|credits?|image credits?|sources?|references?|further reading|resources?)$/i;

/** Heuristic: one slide (or two) per section. */
function fromSections(post) {
  const cands = [];
  post.sections.forEach((sec, idx) => {
    if (!sec.heading || SKIP.test(sec.heading)) return;
    const paras = sec.items.filter((i) => i.kind === 'p');
    const lists = sec.items.filter((i) => i.kind === 'list');
    const quote = sec.items.find((i) => i.kind === 'quote');
    const image = sec.items.find((i) => i.kind === 'image' && i.src);

    // Numbered bold paragraphs: "**1. Check.** text"
    const numbered = paras
      .map((p) => p.text.match(/^\*\*(\d+)\.\s*(.+?)\*\*\s*(.*)$/))
      .filter(Boolean)
      .map((m) => ({ n: +m[1], title: stripEnd(m[2]), text: clip(m[3], 92) }));
    if (numbered.length >= 2) {
      for (let i = 0; i < numbered.length; i += 3) {
        const chunk = numbered.slice(i, i + 3);
        const part = numbered.length > 3 ? ` (${i / 3 + 1}/${Math.ceil(numbered.length / 3)})` : '';
        cands.push({ score: 3, slide: { type: 'steps', heading: sec.heading + part, items: chunk } });
      }
      return;
    }
    const list = lists.find((l) => l.items.length >= 2);
    if (list) {
      const items = list.items.slice(0, list.ordered ? 3 : 5).map(leadSplit).map((x) => ({ ...x, text: clip(x.text, 84) }));
      cands.push({
        score: 3,
        slide: list.ordered
          ? { type: 'steps', heading: sec.heading, items: items.map((x, i) => ({ n: i + 1, title: x.lead, text: x.text })) }
          : { type: 'list', heading: sec.heading, items },
      });
      return;
    }
    if (quote && plain(quote.text).length <= 180) {
      cands.push({ score: 2, slide: { type: 'quote', text: quote.text, heading: sec.heading } });
      return;
    }
    const body = paras.find((p) => plain(p.text).length > 40) ?? paras[0];
    if (!body) return;
    cands.push({
      score: image ? 2 : 1,
      slide: { type: 'text', heading: sec.heading, body: clip(body.text, 200), image: image?.src ?? null, imageAlt: image?.alt ?? '' },
    });
  });

  // Keep the best MAX_CONTENT_SLIDES, preserving reading order.
  let kept = cands;
  if (cands.length > MAX_CONTENT_SLIDES) {
    const ranked = cands.map((c, i) => ({ ...c, i })).sort((a, b) => b.score - a.score || a.i - b.i);
    const keep = new Set(ranked.slice(0, MAX_CONTENT_SLIDES).map((c) => c.i));
    kept = cands.filter((_, i) => keep.has(i));
  }
  return kept.map((c) => c.slide);
}

const hashtag = (t) => '#' + t.toLowerCase().replace(/[^a-z0-9]+/g, '');
const DEFAULT_TAGS = ['rendoire'];

export function buildCaption(post, slides, { reel = false } = {}) {
  const hook = post.standfirst || post.description || '';
  const tags = [...new Set([...(post.meta?.instagram?.hashtags ?? post.tags).map(hashtag), ...DEFAULT_TAGS.map(hashtag)])].slice(0, 6);
  const points = slides
    .filter((s) => s.heading && s.type !== 'cta')
    .slice(0, 6)
    .map((s) => `• ${plain(s.heading).replace(/\s*\(\d\/\d\)$/, '')}`);
  const uniq = [...new Set(points)];
  const link = `rendoire.com/blog/${post.slug}`;
  const lines = reel
    ? [post.title, '', hook, '', `Full post: ${link} (link in bio)`, '', tags.join(' ')]
    : [post.title, '', hook, '', "What's inside:", ...uniq, '', `Full post: ${link} (link in bio)`, 'Save this for later and send it to someone who needs it.', '', tags.join(' ')];
  return sanitize(lines.join('\n')).slice(0, 2200);
}

/** Build the full model: cover, content slides, call to action. */
export async function buildDeck(post, { ai = true } = {}) {
  const ov = post.meta?.instagram ?? {};
  let content = null;
  let kicker = ov.kicker ?? null;
  let emphasis = ov.emphasis ?? null;
  let caption = ov.caption ?? null;
  let source = 'heuristic';

  if (Array.isArray(ov.slides) && ov.slides.length) {
    const base = dirname(post.file);
    content = ov.slides.map((x) => (x.image && !x.image.startsWith('/') ? { ...x, image: resolve(base, x.image) } : x));
    source = 'frontmatter';
  } else if (ai) {
    const res = await curate(post).catch((e) => {
      console.warn('  AI curation failed, using heuristics:', e.message);
      return null;
    });
    if (res) {
      content = res.slides;
      kicker ??= res.kicker;
      emphasis ??= res.emphasis;
      caption ??= res.caption;
      if (res.hashtags?.length) post.meta = { ...post.meta, instagram: { ...ov, hashtags: res.hashtags } };
      source = 'ai';
    }
  }
  content ??= fromSections(post);

  // Clean every string.
  const walk = (v) =>
    typeof v === 'string' ? sanitize(v) : Array.isArray(v) ? v.map(walk) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'image' ? x : walk(x)])) : v;
  content = walk(content.slice(0, MAX_CONTENT_SLIDES));

  const sub = sanitize(clip(post.standfirst || post.description, 150));
  const slides = [
    {
      type: 'cover',
      kicker: sanitize(kicker ?? (post.tags[0] ? post.tags[0].replace(/-/g, ' ') : 'new post')),
      title: sanitize(post.title),
      ...splitTitle(sanitize(post.title), emphasis),
      sub,
      image: ov.coverImage ? resolve(dirname(post.file), ov.coverImage) : post.cover,
      focus: ov.coverFocus ?? null,
    },
    ...content,
    { type: 'cta', heading: 'Read the full post', title: sanitize(post.title), url: `rendoire.com/blog/${post.slug}` },
  ];

  return {
    slug: post.slug,
    url: post.url,
    source,
    slides,
    caption: caption ? sanitize(caption).slice(0, 2200) : buildCaption(post, content),
    reelCaption: ov.reelCaption ? sanitize(ov.reelCaption).slice(0, 2200) : buildCaption(post, content, { reel: true }),
    alt: slides.map((s) => sanitize(plain([s.title, s.heading, s.body, s.text, ...(s.items ?? []).map((i) => [i.lead ?? i.title, i.text].join(': '))].filter(Boolean).join('. ')))),
  };
}
