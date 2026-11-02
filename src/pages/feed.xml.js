import rss from '@astrojs/rss';
import { getPosts } from '../lib/blog';

export async function GET(context) {
  const posts = await getPosts();

  return rss({
    title: 'rendoire',
    description: 'Essays on artificial intelligence, software engineering, and self-hosting.',
    site: context.site ?? 'https://rendoire.com',
    items: posts.map((post) => ({
      title: post.title,
      pubDate: post.pubDate,
      description: post.description ?? '',
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
