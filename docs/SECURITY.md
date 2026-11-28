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

## Open items (need the proxy or DNS, not this repo)

Audited 15 November 2026. Everything that lives in this repository or in GitHub's
settings is done. These four are outside it:

1. **Send security headers from the proxy.** None are sent today (no HSTS, no
   `X-Content-Type-Options`, no `X-Frame-Options`). The snippet is in the next section.
2. **Fix the `www` redirect.** `https://www.rendoire.com` answers with a 301 to
   `http://rendoire.com/`, a plain-HTTP hop. It should go straight to
   `https://rendoire.com/`. See `docs/SELF-HOSTING.md`.
3. **Remove `Access-Control-Allow-Origin: *`** from the proxy's responses.
4. **Add DNS records** at the registrar (Namecheap):

   | Type | Host | Value |
   | --- | --- | --- |
   | TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:security@rendoire.com` |
   | CAA | `@` | `0 issue "sectigo.com"` |
   | CAA | `@` | `0 iodef "mailto:security@rendoire.com"` |

   Without DMARC anyone can send mail that appears to come from `@rendoire.com`. Move
   to `p=reject` once a few weeks of reports look clean. The CAA value must name the CA
   your proxy's certificate comes from (Sectigo today); change it if you switch CA, or
   renewals will fail.

Also confirm that mail to `security@rendoire.com` reaches you: send it a test message.

To re-check after changing the proxy or DNS:

```bash
curl -sI https://rendoire.com | grep -iE 'strict-transport|x-content-type|x-frame|access-control'
curl -sI https://www.rendoire.com | grep -i location     # expect https://rendoire.com/
dig +short TXT _dmarc.rendoire.com; dig +short CAA rendoire.com
```

## The one thing GitHub Pages can't do: HTTP headers

GitHub Pages does not let you set custom HTTP response headers (it ignores `_headers`,
`vercel.json`, and `netlify.toml`). A `<meta>` CSP is a useful fallback, but the
strongest headers — `Strict-Transport-Security`, `X-Frame-Options`, `frame-ancestors`,
`X-Content-Type-Options`, and a strict CSP — must be set **at the edge**, in front of
GitHub Pages.

Your domain fronts GitHub Pages through a reverse proxy (APISIX on a Namecheap IP,
159.198.67.129). Add these headers there. The GoatCounter origin must match
`analytics.goatcounter` in `src/config.ts`, or the header will block page counts.

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
