import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';
import autolinkTools from './src/lib/autolink.mjs';

export default defineConfig({
  site: 'https://rendoire.com',
  integrations: [sitemap()],

  markdown: {
    rehypePlugins: [autolinkTools],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});