import rss from '@astrojs/rss';
import { getImage } from 'astro:assets';
import { getEntries, summarize, topicLabel } from '../lib/blog';
import { author, site } from '../config';

// Full essays in the feed, so feed readers show the whole piece. Image and link
// paths in the rendered HTML are site-relative; feed readers need them absolute.
const absolutize = (html) =>
  html.replace(/(src|href)="\/(?!\/)/g, `$1="${site.url}/`);

// Markdown images stay as __ASTRO_IMAGE_ placeholders in the raw HTML; the page
// resolves them at render time, so the feed has to do the same.
const assets = import.meta.glob('/src/assets/blog/**/*.{webp,png,jpg,jpeg,gif}', { eager: true });
const decode = (s) => s.replace(/&#x22;/g, '"').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

async function resolveImages(html) {
  const tags = [...html.matchAll(/<img __ASTRO_IMAGE_="([^"]*)"[^>]*>/g)];
  for (const [tag, raw] of tags) {
    const { src, alt = '' } = JSON.parse(decode(raw));
    const key = '/src/' + src.replace(/^(\.\.\/)+/, '');
    const meta = assets[key]?.default;
    if (!meta) {
      html = html.replace(tag, '');
      continue;
    }
    const img = await getImage({ src: meta, width: Math.min(1200, meta.width), format: 'webp' });
    html = html.replace(tag, `<img src="${img.src}" alt="${escAttr(alt)}" width="${img.attributes.width}" height="${img.attributes.height}">`);
  }
  return html;
}

export async function GET(context) {
  const entries = await getEntries();

  return rss({
    title: 'rendoire',
    description: `Essays by ${author.name} on putting AI to work in the real world, and on owning your own technology.`,
    site: context.site ?? site.url,
    items: await Promise.all(entries.map(async (entry) => {
      const post = summarize(entry);
      const html = entry.rendered?.html ? absolutize(await resolveImages(entry.rendered.html)) : undefined;
      // The cover as a 1200×630 JPEG, so newsletter emails can lead with it.
      const cover = post.cover
        ? (await getImage({ src: post.cover, width: 1200, height: 630, fit: 'cover', format: 'jpg' })).src
        : undefined;
      return {
        title: post.title,
        pubDate: post.pubDate,
        description: post.description ?? '',
        content: html,
        link: `/blog/${post.slug}/`,
        categories: post.tags.map(topicLabel),
        author: author.name,
        enclosure: cover ? { url: new URL(cover, site.url).href, length: 0, type: 'image/jpeg' } : undefined,
      };
    })),
    customData: `<language>en-gb</language>`,
  });
}
