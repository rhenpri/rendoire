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
| Content Security Policy | `BaseLayout.astro` (meta) | Baseline CSP; see below for the edge-header version. |
| Referrer policy | `BaseLayout.astro` (meta) | `strict-origin-when-cross-origin`. |
| `security.txt` | `public/.well-known/security.txt` | Update the `Contact:` address below. |
| Least-privilege CI | `.github/workflows/deploy.yml` | `contents: read`, pinned action SHAs, `npm ci`. |
| Dependency updates | `.github/dependabot.yml` | Weekly npm + monthly Actions updates. |
| Locked Node | `.nvmrc` + `engines` | Node 24. |
| Dependency audit | — | `npm audit` reports **0 vulnerabilities** as of the last change. |

## Action needed: update your security contact

`public/.well-known/security.txt` currently points to `security@rendoire.com`. Replace
it with a real address you monitor (or remove `security.txt` if you don't want to publish one).

## The one thing GitHub Pages can't do: HTTP headers

GitHub Pages does not let you set custom HTTP response headers (it ignores `_headers`,
`vercel.json`, and `netlify.toml`). A `<meta>` CSP is a useful fallback, but the
strongest headers — `Strict-Transport-Security`, `X-Frame-Options`, `frame-ancestors`,
`X-Content-Type-Options`, and a strict CSP — must be set **at the edge**, in front of
GitHub Pages.

Your domain already fronts GitHub Pages through a reverse proxy (APISIX on a
DigitalOcean host). Add these headers there.

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
          default-src 'self'; script-src 'self' 'unsafe-inline';
          style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;
          font-src 'self' data:; connect-src 'self' https:;
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
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
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
