import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';
import autolinkTools from './src/lib/autolink.mjs';

export default defineConfig({
  site: 'https://rendoire.com',
  integrations: [
    sitemap({
      // /tools/ only redirects to /self-hosting/ now.
      filter: (page) => !page.endsWith('/tools/'),
    }),
  ],

  markdown: {
    rehypePlugins: [autolinkTools],
  },

  vite: {
    plugins: [tailwindcss()],
    // Never inline a script into the HTML: the CSP only allows script files
    // from this origin, so an inlined one would be blocked.
    build: { assetsInlineLimit: 0 },
  },
});