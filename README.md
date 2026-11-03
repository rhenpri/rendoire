# rendoire

The blog and digital home of **rendoire** — essays on artificial intelligence, software
engineering, and owning your own tools.

[Visit rendoire.com →](https://rendoire.com)

## Stack

- **Framework:** [Astro](https://astro.build) 7 — fully static output
- **Styling:** Tailwind CSS 4 + a custom editorial design system (white/black/grey + green/purple)
- **Content:** Markdown in `src/content/blog/` (Astro content collections)
- **Interactions:** React islands (reading progress, cursor) + Framer Motion + pure-CSS/SVG animation
- **Fonts:** Self-hosted via Fontsource (no third-party CDNs)
- **Deploy:** GitHub Actions → GitHub Pages (domain fronted by an APISIX proxy)

## Structure

```
src/
  config.ts                Site constants + O'Reilly referral tag
  content.config.ts        Content collection schema
  content/blog/*.md        Posts (frontmatter + Markdown)
  data/
    self-hosting.ts        Curated self-hosting recommendations
    ai.ts                  Books, learning path, glossary
  lib/blog.ts              Post helpers (sorting, reading time, tags)
  pages/
    index.astro            Home — pillars + featured + latest posts
    blog/index.astro       All posts (with tag filter)
    blog/[...slug].astro   Single post
    self-hosting.astro     Recommendations directory (search + categories)
    ai.astro               Learning path, books, glossary + visualization
    about.astro            About
    feed.xml.js            RSS (built from local content)
scripts/
  import-medium.mjs        Import posts from a Medium RSS feed
  publish-medium.mjs       Cross-post a post to Medium (canonical → this site)
docs/
  SECURITY.md              Security hardening + edge-header config
  SELF-HOSTING.md          Self-hosting options and recipes
```

## Local development

```bash
nvm use            # Node 24 (see .nvmrc)
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
```

## Writing

Posts are Markdown files with YAML frontmatter:

```yaml
---
title: "Example post"
description: "A short summary for cards and SEO."
pubDate: 2026-11-03
tags: ["ai", "self-hosting"]
cover: "https://..."
medium: "https://rendoire.medium.com/..."   # optional, links "Also on Medium"
draft: false
---
```

### Importing from Medium

```bash
npm run import:medium          # pulls the @rendoire RSS feed into src/content/blog/
```

### Cross-posting to Medium

```bash
export MEDIUM_TOKEN=<integration token>
node scripts/publish-medium.mjs example-post --public
```

See `docs/SECURITY.md` for details on how the Medium canonical link keeps your site as
the source of truth.

## Self-hosting & AI recommendations

Both pages are data-driven and easy to edit:

- **Self-hosting** — `src/data/self-hosting.ts` (categories → items with links and a
  `tried` / `recommended` / `explore` status).
- **AI resources** — `src/data/ai.ts` (books, learning path, glossary).

To add your O'Reilly **affiliate/referral** tag, set `referral.oreilly` in `src/config.ts` —
every book link on `/ai` picks it up automatically.

## Deploy

Push to `main`. GitHub Actions builds and deploys to GitHub Pages automatically.
