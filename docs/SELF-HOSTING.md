# Self-hosting recommendations

`rendoire.com` is a static site, so "hosting" just means serving a folder of HTML/CSS/JS.
That keeps your options wide open. Here's the honest landscape.

## Where it runs today

- **Build & primary host:** GitHub Pages (free, automatic deploys from `main`).
- **Edge proxy:** APISIX on a DigitalOcean host, in front of GitHub Pages (your DNS
  `A` record points at it).

This is already a solid setup — GitHub Pages handles the build/deploy/availability, and
your proxy lets you add security headers (see `docs/SECURITY.md`).

## The spectrum of options

| Option | Effort | Cost | Control | Best for |
| --- | --- | --- | --- | --- |
| **1. GitHub Pages (current)** | None | Free | Low | Keeping it simple, zero maintenance. |
| **2. VPS (Docker + Caddy)** | ~1h setup | ~$6–12/mo | High | Full control, custom headers, analytics-free. |
| **3. Homelab (your own hardware)** | A weekend | ~power only | Total | You already run Proxmox/Tailscale; serving a static site is trivial. |
| **4. Cloudflare Pages/Tunnel** | ~30 min | Free | Medium | Global CDN + DDoS protection without opening ports. |

## Recommendation

Given you **already have a homelab and a VPS**, I'd suggest a two-stage approach:

1. **Keep GitHub Pages as the source of truth** for now (you're here, it works, it's free).
2. **If you want full control later**, run it as a Docker container behind Caddy —
   either on your DigitalOcean VPS or on the Proxmox box (exposed via Tailscale or a
   Cloudflare Tunnel so you don't open ports to the internet).

### Option 2 — VPS with Docker + Caddy

```yaml
# docker-compose.yml
services:
  caddy:
    image: caddy:2
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - ./dist:/srv:ro

volumes:
  caddy_data:
```

```caddyfile
# Caddyfile
rendoire.com, www.rendoire.com {
    root * /srv
    encode gzip zstd
    file_server

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    }
}
```

Deploy with:

```bash
npm run build
rsync -avz dist/ user@vps:/srv/rendoire/
# Caddy auto-provisions TLS via Let's Encrypt on first request.
```

### Option 3 — Homelab via Cloudflare Tunnel

If you want to serve from your own Proxmox box **without** opening ports:

```bash
# On the homelab, run the built site and a tunnel:
docker run -d --name rendoire \
  -v "$PWD/dist:/usr/share/caddy" \
  caddy:2 caddy file-server --root /usr/share/caddy

docker run -d cloudflare/cloudflared tunnel --no-autoupdate run \
  --token "$CLOUDFLARE_TUNNEL_TOKEN"
```

Point the tunnel at `http://rendoire:80`, set the `rendoire.com` DNS to Cloudflare,
and you get HTTPS, a global CDN, and DDoS protection — all from hardware you own.

## Checklist when moving off GitHub Pages

- [ ] Point DNS (and remove the GitHub Pages `CNAME` if you go fully self-hosted).
- [ ] Move the security headers from the proxy to your new edge (Caddy above has them).
- [ ] Re-run `npm run build` and copy `dist/` (or automate with the existing GitHub
      Action pointed at a deploy target instead of Pages).
- [ ] Set up uptime monitoring (Uptime Kuma runs nicely on your homelab).

---

**Bottom line:** you don't *need* to self-host this — a static site is the single most
portable thing you can deploy, and GitHub Pages + your APISIX proxy already cover you.
But if control/privacy is the goal, "Docker + Caddy on the VPS or homelab" is the
highest-leverage upgrade, and the site is ready to drop into either.
