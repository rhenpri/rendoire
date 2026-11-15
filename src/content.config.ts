import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // Path relative to the post, e.g. ../../assets/blog/<slug>/cover.webp
    cover: image().optional(),
    // Describe the cover for screen readers; leave out if it is purely decorative.
    coverAlt: z.string().optional(),
    // Original Medium URL, used for the "Also published on Medium" link.
    medium: z.string().url().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog };
