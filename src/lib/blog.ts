import type { ImageMetadata } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

export interface PostSummary {
  slug: string;
  title: string;
  description?: string;
  pubDate: Date;
  updatedDate?: Date;
  dateLabel: string;
  tags: string[];
  cover?: ImageMetadata;
  coverAlt: string;
  readingTime: string;
  featured: boolean;
  medium?: string;
}

/** Display names for topic slugs. Anything not listed is shown as its slug. */
const TOPIC_LABELS: Record<string, string> = {
  ai: 'AI',
  'self-hosting': 'Self-hosting',
  privacy: 'Privacy',
  'digital-minimalism': 'Digital minimalism',
  software: 'Software',
  neurodiversity: 'Neurodiversity',
  culture: 'Culture',
};

export const topicLabel = (tag: string) => TOPIC_LABELS[tag] ?? tag;

export const formatDate = (d: Date, month: 'short' | 'long' = 'short') =>
  d.toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric', timeZone: 'UTC' });

const toReadingTime = (body: string) => {
  const words = body.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
};

export function summarize(post: CollectionEntry<'blog'>): PostSummary {
  return {
    slug: post.id,
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate,
    updatedDate: post.data.updatedDate,
    dateLabel: formatDate(post.data.pubDate),
    tags: post.data.tags ?? [],
    cover: post.data.cover,
    coverAlt: post.data.coverAlt ?? '',
    readingTime: toReadingTime(post.body ?? ''),
    featured: post.data.featured ?? false,
    medium: post.data.medium,
  };
}

/** Published posts, newest first. */
export async function getEntries(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPosts(): Promise<PostSummary[]> {
  return (await getEntries()).map(summarize);
}

/** Topics with how many posts carry each, most used first. */
export function topicCounts(posts: PostSummary[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count }));
}

/**
 * What to read after `post`: the posts sharing the most topics with it, topped
 * up with the newest others so there is always something to offer.
 */
export function relatedPosts(post: PostSummary, all: PostSummary[], limit = 2): PostSummary[] {
  const shared = (p: PostSummary) => p.tags.filter((t) => post.tags.includes(t)).length;
  return all
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => shared(b) - shared(a) || b.pubDate.valueOf() - a.pubDate.valueOf())
    .slice(0, limit);
}
