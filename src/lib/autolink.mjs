// Auto-link tool/service names in Markdown content to their websites.
//
// A curated, unambiguous subset of the full directory in `src/data/*`.
// Common English words ("brave", "framework", "proton", "caddy", "matrix",
// "prometheus", "hermes", "signal", etc.) are intentionally excluded so we
// never wrap the wrong word.

const TOOLS = [
  // self-hosting directory
  ['Linux Mint', 'https://linuxmint.com'],
  ['NixOS', 'https://nixos.org'],
  ['GrapheneOS', 'https://grapheneos.org'],
  ['CalyxOS', 'https://calyxos.org'],
  ['LineageOS', 'https://lineageos.org'],
  ['Nextcloud', 'https://nextcloud.com'],
  ['Immich', 'https://immich.app'],
  ['Syncthing', 'https://syncthing.net'],
  ['PhotoPrism', 'https://photoprism.app'],
  ['Restic', 'https://restic.net'],
  ['Dawarich', 'https://dawarich.app'],
  ['Duplicati', 'https://duplicati.com'],
  ['Jellyfin', 'https://jellyfin.org'],
  ['Home Assistant', 'https://www.home-assistant.io'],
  ['Navidrome', 'https://www.navidrome.org'],
  ['Audiobookshelf', 'https://www.audiobookshelf.org'],
  ['qBittorrent', 'https://www.qbittorrent.org'],
  ['Emby', 'https://emby.media'],
  ['Kavita', 'https://www.kavitareader.com'],
  ['Vaultwarden', 'https://github.com/dani-garcia/vaultwarden'],
  ['AdGuard Home', 'https://adguard.com/adguard-home.html'],
  ['Pi-hole', 'https://pi-hole.net'],
  ['SearXNG', 'https://docs.searxng.org'],
  ['Tailscale', 'https://tailscale.com'],
  ['Nginx Proxy Manager', 'https://nginxproxymanager.com'],
  ['Authentik', 'https://goauthentik.io'],
  ['CrowdSec', 'https://www.crowdsec.net'],
  ['WireGuard', 'https://www.wireguard.com'],
  ['OpenVPN', 'https://openvpn.net'],
  ['Docker', 'https://www.docker.com'],
  ['Proxmox', 'https://www.proxmox.com'],
  ['CasaOS', 'https://casaos.io'],
  ['Coolify', 'https://coolify.io'],
  ['TrueNAS', 'https://www.truenas.com'],
  ['Uptime Kuma', 'https://uptime.kuma.pet'],
  ['Grafana', 'https://grafana.com'],
  ['Portainer', 'https://www.portainer.io'],
  ['ZimaOS', 'https://www.zimaspace.com'],
  ['Ollama', 'https://ollama.com'],
  ['Open WebUI', 'https://openwebui.com'],
  ['ComfyUI', 'https://www.comfy.org'],
  ['LocalAI', 'https://localai.io'],
  ['n8n', 'https://n8n.io'],
  ['Paperless-ngx', 'https://docs.paperless-ngx.com'],
  ['Forgejo', 'https://forgejo.org'],
  ['Gitea', 'https://gitea.com'],
  ['Actual Budget', 'https://actualbudget.org'],
  ['Wallabag', 'https://wallabag.org'],
  ['OnlyOffice', 'https://www.onlyoffice.com'],
  ['Mealie', 'https://mealie.io'],
  ['Firefly III', 'https://www.firefly-iii.org'],
  ['Mastodon', 'https://joinmastodon.org'],
  ['FreshRSS', 'https://freshrss.org'],
  ['Jitsi Meet', 'https://jitsi.org'],
  ['PeerTube', 'https://joinpeertube.org'],

  // tools I rate
  ['Mullvad VPN', 'https://mullvad.net'],
  ['Brave Browser', 'https://brave.com'],
  ['F-Droid', 'https://f-droid.org'],
  ['FUTO Keyboard', 'https://keyboard.futo.org'],
  ['Organic Maps', 'https://organicmaps.app'],
  ['LocalSend', 'https://localsend.org'],
  ['NewPipe', 'https://newpipe.net'],
  ['Obtainium', 'https://obtainium.imranr.dev'],
  ['Aurora Store', 'https://auroraoss.com'],
  ['Tuta Mail', 'https://tuta.com'],
  ['Tutanota', 'https://tuta.com'],
  ['Ecosia', 'https://www.ecosia.org'],
  ['OpenCode', 'https://opencode.ai'],
  ['OpenClaw', 'https://openclaw.ai'],
  ['LibreChat', 'https://www.librechat.ai'],
  ['Obsidian', 'https://obsidian.md'],
  ['Synology', 'https://www.synology.com'],
  ['UGREEN', 'https://nas.ugreen.com'],
  ['Raspberry Pi', 'https://www.raspberrypi.com'],
  ['Fairphone', 'https://www.fairphone.com'],

  // closely related tools that appear in posts
  ['Bitwarden', 'https://bitwarden.com'],
  ['LM Studio', 'https://lmstudio.ai'],
];

// Longest names first so "Home Assistant" wins over any shorter collision.
const sorted = [...TOOLS].sort((a, b) => b[0].length - a[0].length);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pattern = new RegExp(`\\b(${sorted.map(([n]) => escapeRe(n)).join('|')})\\b`, 'gi');
const urlByLower = new Map(sorted.map(([n, u]) => [n.toLowerCase(), u]));

function replaceText(value) {
  pattern.lastIndex = 0;
  let match;
  const nodes = [];
  let last = 0;
  let found = false;

  while ((match = pattern.exec(value)) !== null) {
    const url = urlByLower.get(match[0].toLowerCase());
    if (!url) continue;
    found = true;
    if (match.index > last) {
      nodes.push({ type: 'text', value: value.slice(last, match.index) });
    }
    nodes.push({
      type: 'element',
      tagName: 'a',
      properties: {
        href: url,
        target: '_blank',
        rel: ['noopener', 'noreferrer'],
        className: ['tool-link'],
      },
      children: [{ type: 'text', value: match[0] }],
    });
    last = match.index + match[0].length;
    if (match[0].length === 0) break;
  }

  if (!found) return [{ type: 'text', value }];
  if (last < value.length) nodes.push({ type: 'text', value: value.slice(last) });
  return nodes;
}

function walk(node, inCode, inLink) {
  if (node.type === 'text') {
    return inCode || inLink ? node : replaceText(node.value);
  }
  if (node.type === 'element') {
    const tag = String(node.tagName || '').toLowerCase();
    const nextCode = inCode || tag === 'code' || tag === 'pre' || tag === 'kbd';
    const nextLink = inLink || tag === 'a';
    if (Array.isArray(node.children)) {
      const out = [];
      for (const child of node.children) {
        const r = walk(child, nextCode, nextLink);
        if (Array.isArray(r)) out.push(...r);
        else out.push(r);
      }
      node.children = out;
    }
    return node;
  }
  return node;
}

export default function autolinkTools() {
  return (tree) => {
    const out = [];
    for (const child of tree.children) {
      const r = walk(child, false, false);
      if (Array.isArray(r)) out.push(...r);
      else out.push(r);
    }
    tree.children = out;
  };
}
