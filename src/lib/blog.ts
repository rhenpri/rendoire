import { getCollection } from 'astro:content';

export interface PostSummary {
  slug: string;
  title: string;
  description?: string;
  pubDate: Date;
  dateLabel: string;
  tags: string[];
  cover?: string;
  readingTime: string;
  featured: boolean;
  medium?: string;
}

const toDateLabel = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const toReadingTime = (words: number) => `${Math.max(1, Math.ceil(words / 200))} min read`;

export async function getPosts(): Promise<PostSummary[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const mapped = posts.map((post) => {
    const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
    return {
      slug: post.id,
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      dateLabel: toDateLabel(post.data.pubDate),
      tags: post.data.tags ?? [],
      cover: post.data.cover,
      readingTime: toReadingTime(words),
      featured: post.data.featured ?? false,
      medium: post.data.medium,
    };
  });

  return mapped.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}

export function allTags(posts: PostSummary[]): string[] {
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}
