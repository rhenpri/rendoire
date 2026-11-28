# Security

This is a fully static site with **no server, no database, and no user input**. That
already removes most of the traditional web attack surface (SQLi, auth bypass, RCE via
untrusted uploads, etc.). On top of that, the following hardening is applied.

## What's already in place

| Control | Where | Notes |
| --- | --- | --- |
| Self-hosted content | `src/content/blog/` | No third-party CMS or API; posts are Markdown built at deploy time. |
| No third-party runtime calls | — | Removed the `api.rss2json.com` proxy and Google Fonts (both leaked reader data to third parties). |
| Self-hosted fonts | `@fontsource/*` | Served from your own domain. |
| Content Security Policy | `BaseLayout.astro` (meta) | This origin only; no inline scripts (`script-src 'self'`). See below for the edge-header version. |
| Self-hosted images | `src/assets/blog/` | Post images are built from the repo; nothing loads from Medium's CDN, and its tracking pixel is stripped on import. |
| Referrer policy | `BaseLayout.astro` (meta) | `strict-origin-when-cross-origin`. |
| `security.txt` | `public/.well-known/security.txt` | Served at `/.well-known/security.txt`. Renew `Expires:` before November 2027. |
| Repository protections | GitHub settings | Secret scanning, push protection and Dependabot security updates on; `main` cannot be force-pushed or deleted. |
| Least-privilege CI | `.github/workflows/deploy.yml` | `contents: read`, pinned action SHAs, `npm ci`. |
| Dependency updates | `.github/dependabot.yml` | Weekly npm + monthly Actions updates. |
| Locked Node | `.nvmrc` + `engines` | Node 24. |
| Dependency audit | — | `npm audit` reports **0 vulnerabilities** as of 15 November 2026. |

## Edge and DNS (resolved 28 November 2026)

The site is served directly by GitHub Pages. There is no proxy any more.

- **DNS (Namecheap):** four `A @` records (185.199.108–111.153), four `AAAA @` records
  (2606:50c0:8000–8003::153) and `CNAME www → rhenpri.github.io`. The **HTTPS toggle
  on every record must stay OFF.** That toggle is Namecheap's own TLS proxy (it answered
  as `server: APISIX` from 159.198.67.129), and new records default to ON.
- **TLS:** Let's Encrypt certificate issued by GitHub Pages, with "Enforce HTTPS" on.
  `www` and `http://` redirect to `https://rendoire.com/`.
- **Mail:** DMARC on `_dmarc` (`p=quarantine`, reports to security@). CAA allows only
  `letsencrypt.org`, with iodef to security@. Email forwarding MX and SPF unchanged.
  Move DMARC to `p=reject` once a few weeks of reports look clean.
- **Not possible on Pages:** custom response headers (HSTS, X-Frame-Options,
  frame-ancestors). The `<meta>` CSP in `BaseLayout.astro` still applies.
  `Access-Control-Allow-Origin: *` is sent by GitHub Pages itself and is harmless
  for a public static site.

To re-check:

```bash
curl -sI http://www.rendoire.com | grep -i location      # expect https://rendoire.com/
dig +short A rendoire.com                                 # expect only 185.199.x.153
dig +short TXT _dmarc.rendoire.com; dig +short CAA rendoire.com
```

If the certificate ever gets stuck, remove and re-add the custom domain:
`gh api -X PUT repos/rhenpri/rendoire/pages -F cname=null` then `-f cname=rendoire.com`.

## The one thing GitHub Pages can't do: HTTP headers

GitHub Pages does not let you set custom HTTP response headers (it ignores `_headers`,
`vercel.json`, and `netlify.toml`). A `<meta>` CSP is a useful fallback, but the
strongest headers — `Strict-Transport-Security`, `X-Frame-Options`, `frame-ancestors`,
`X-Content-Type-Options`, and a strict CSP — must be set **at the edge**, in front of
GitHub Pages.

These snippets apply only if the site ever moves behind a proxy you control again.
The GoatCounter origin must match `analytics.goatcounter` in `src/config.ts`, or the
header will block page counts.

### APISIX (response-rewrite)

```yaml
# In your APISIX route/global-rule for rendoire.com
plugins:
  response-rewrite:
    headers:
      set:
        Strict-Transport-Security: "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options: "nosniff"
        X-Frame-Options: "DENY"
        Referrer-Policy: "strict-origin-when-cross-origin"
        Permissions-Policy: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
        Content-Security-Policy: >-
          default-src 'self'; script-src 'self';
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: https://rendoire.goatcounter.com;
          font-src 'self' data:;
          connect-src 'self' https://rendoire.goatcounter.com;
          object-src 'none'; base-uri 'self'; form-action 'self';
          frame-ancestors 'none'
```

> Also remove any `cors` plugin that sets `Access-Control-Allow-Origin: *` — a static
> site never needs to allow cross-origin reads.

### Caddy (alternative, if you ever move the proxy)

```caddyfile
rendoire.com {
    reverse_proxy rhenpri.github.io  # or the Pages host

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://rendoire.goatcounter.com; font-src 'self' data:; connect-src 'self' https://rendoire.goatcounter.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
        -Server
    }
}
```

## Cross-posting to Medium

Your posts live here first (canonical), then get cross-posted to Medium. The publish
script sets Medium's `canonicalUrl` back to `rendoire.com`, so search engines treat
your domain as the original and you avoid a duplicate-content penalty.

```bash
export MEDIUM_TOKEN=<integration token from medium.com/me/settings>
node scripts/publish-medium.mjs some-post-slug            # creates a draft
node scripts/publish-medium.mjs some-post-slug --public   # publishes immediately
```

## Incident response

If you believe you've found a vulnerability in this site, please report it via the
contact in `/.well-known/security.txt`. Because the site is static, a rebuild + redeploy
resolves most issues quickly.
