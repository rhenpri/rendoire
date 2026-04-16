# rendoire

The technical portfolio, creative journal, and digital presence for **rendoire**.

[Visit rendoire.com →](https://rendoire.com)

## Architecture

This site is meticulously crafted to be fully static, fast, and elegantly minimal:
- **Framework:** Astro (Static HTML generation)
- **Styling:** Vanilla CSS (Zero-framework, custom design system)
- **Deployment:** Automated via GitHub Actions directly to GitHub Pages
- **Content:** Live Medium API syndication & infinite-scrolling book marquees

## Local Development

To run the site locally:

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

## Structure

- `/src/pages/index.html` — The massive single-page entry containing all styles, interaction logic, and content structure.
- `/public/` — Stores static assets (CNAME, project photography, and site favicons).
- `.github/workflows/deploy.yml` — The continuous deployment pipeline handling automated push-to-Pages.
