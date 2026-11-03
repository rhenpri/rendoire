export type Status = 'tried' | 'recommended' | 'explore';

export interface Item {
  name: string;
  tagline: string;
  why: string;
  link: string;
  status: Status;
}

export interface Category {
  id: string;
  label: string;
  blurb: string;
  items: Item[];
}

// Curated, first-hand recommendations. `tried` = I run/ran it myself,
// `recommended` = solid pick, `explore` = worth a look.
export const categories: Category[] = [
  {
    id: 'os',
    label: 'Operating systems',
    blurb: 'Take the OS back. Linux for the desktop, and a de-Googled Android for the pocket.',
    items: [
      {
        name: 'Linux Mint',
        tagline: 'The friendliest way to leave Windows/macOS',
        why: 'The lowest-friction first Linux. Familiar desktop, sensible defaults, huge community. Start here if you are new.',
        link: 'https://linuxmint.com',
        status: 'recommended',
      },
      {
        name: 'Fedora',
        tagline: 'Modern, fast-moving, close to upstream',
        why: 'Polished and up-to-date without being bleeding edge. A great daily driver for developers who want recent kernels and toolchains.',
        link: 'https://fedoraproject.org',
        status: 'tried',
      },
      {
        name: 'NixOS',
        tagline: 'Your whole system, declared in one config file',
        why: 'Reproducible, rollback-able, and shareable. Steeper learning curve, but nothing else gives you this much control. Fascinating if you like systems.',
        link: 'https://nixos.org',
        status: 'explore',
      },
      {
        name: 'Pop!_OS',
        tagline: 'Linux tuned for creators and tinkerers',
        why: 'System76 builds it for their own hardware. Good out-of-the-box GPU and window management, with a clean spin on GNOME.',
        link: 'https://pop.system76.com',
        status: 'explore',
      },
      {
        name: 'GrapheneOS',
        tagline: 'A private, hardened Android without Google',
        why: 'The gold standard for a de-Googled phone. Sandboxed Google Play, hardened kernel, and long support windows. Pair it with a Pixel.',
        link: 'https://grapheneos.org',
        status: 'recommended',
      },
      {
        name: 'CalyxOS',
        tagline: 'Privacy-focused Android, easier entry',
        why: 'A softer landing than GrapheneOS if you want to keep some Google services in a controlled, privacy-respecting way.',
        link: 'https://calyxos.org',
        status: 'explore',
      },
      {
        name: 'LineageOS',
        tagline: 'Keep old Android hardware alive',
        why: 'The community ROM that outlives vendor support. Breath new life into phones the manufacturer abandoned.',
        link: 'https://lineageos.org',
        status: 'explore',
      },
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud & storage',
    blurb: 'Your own Dropbox, Photos, and sync — data stays on your hardware.',
    items: [
      {
        name: 'Nextcloud',
        tagline: 'Files, calendar, contacts, and more',
        why: 'The self-hosted productivity suite. The closest thing to a full replacement for Google Drive/Docs if you want one tool for everything.',
        link: 'https://nextcloud.com',
        status: 'recommended',
      },
      {
        name: 'Immich',
        tagline: 'A beautiful, self-hosted Google Photos',
        why: 'The best photo backup experience you can run yourself. Automatic backups, face/object search, shared albums.',
        link: 'https://immich.app',
        status: 'tried',
      },
      {
        name: 'Syncthing',
        tagline: 'Continuous, private file sync between devices',
        why: 'Peer-to-peer, no cloud in the middle. Sync folders across your machines without trusting a third party.',
        link: 'https://syncthing.net',
        status: 'tried',
      },
      {
        name: 'PhotoPrism',
        tagline: 'AI-powered photo management',
        why: 'Browse and search a large photo library with tagging and object detection. Lighter than Immich if you just want a catalogue.',
        link: 'https://photoprism.app',
        status: 'explore',
      },
      {
        name: 'Restic',
        tagline: 'Encrypted, deduplicated backups',
        why: 'The backup tool to build your whole strategy around. Fast, verifiable, and cloud-agnostic — pair it with Backblaze B2 or a NAS.',
        link: 'https://restic.net',
        status: 'recommended',
      },
      {
        name: 'Dawarich',
        tagline: 'Your own location history',
        why: 'Self-hosted Google Timeline — log where you\u2019ve been and own the data yourself. Pairs with a Home Assistant or OwnTracks setup.',
        link: 'https://dawarich.app',
        status: 'explore',
      },
    ],
  },
  {
    id: 'media',
    label: 'Media & home',
    blurb: 'Your own Netflix and smart-home, without the subscription or the spying.',
    items: [
      {
        name: 'Jellyfin',
        tagline: 'Your own streaming server',
        why: 'Free, open, and private. Stream your own movies and shows to any device with a polished interface. No accounts, no tracking.',
        link: 'https://jellyfin.org',
        status: 'tried',
      },
      {
        name: 'Home Assistant',
        tagline: 'The smart-home hub that runs locally',
        why: 'Connect and automate everything from one dashboard, with no cloud dependency. The biggest ecosystem in self-hosted automation.',
        link: 'https://www.home-assistant.io',
        status: 'recommended',
      },
      {
        name: 'Navidrome',
        tagline: 'Stream your own music collection',
        why: 'A lightweight, Subsonic-compatible music server. Pair with a client like Feishin or Symfonium and you have your own Spotify.',
        link: 'https://www.navidrome.org',
        status: 'explore',
      },
      {
        name: 'Audiobookshelf',
        tagline: 'Audiobooks and podcasts, self-hosted',
        why: 'Beautiful web player plus mobile apps. The nicest way to own and listen to your audiobook library.',
        link: 'https://www.audiobookshelf.org',
        status: 'explore',
      },
      {
        name: 'qBittorrent',
        tagline: 'A fast, open-source torrent client',
        why: 'Clean web UI that runs happily headless on a server. The reliable way to fetch Linux ISOs and legally shared media.',
        link: 'https://www.qbittorrent.org',
        status: 'tried',
      },
      {
        name: 'Emby',
        tagline: 'A polished media server with apps everywhere',
        why: 'Slick clients for every device and easy remote access. The commercial alternative to Jellyfin if you want less tinkering.',
        link: 'https://emby.media',
        status: 'explore',
      },
    ],
  },
  {
    id: 'security',
    label: 'Security & network',
    blurb: 'Passwords, DNS, VPN, and the reverse proxy that ties it together.',
    items: [
      {
        name: 'Vaultwarden',
        tagline: 'A self-hosted Bitwarden password manager',
        why: 'All the benefits of Bitwarden, running on your own box. The single highest-value self-host for most people.',
        link: 'https://github.com/dani-garcia/vaultwarden',
        status: 'tried',
      },
      {
        name: 'AdGuard Home',
        tagline: 'Network-wide ad and tracker blocking',
        why: 'DNS-level blocking for every device on your network, with a clean dashboard. The modern successor to Pi-hole.',
        link: 'https://adguard.com/adguard-home.html',
        status: 'recommended',
      },
      {
        name: 'Pi-hole',
        tagline: 'The original network-wide ad blocker',
        why: 'DNS-level blocking with a cult following and a tiny footprint. Pairs well with unbound for recursive DNS.',
        link: 'https://pi-hole.net',
        status: 'recommended',
      },
      {
        name: 'SearXNG',
        tagline: 'A self-hosted metasearch engine',
        why: 'Aggregate results from many search engines with zero tracking. Your own private Google replacement.',
        link: 'https://docs.searxng.org',
        status: 'recommended',
      },
      {
        name: 'Tailscale',
        tagline: 'Zero-config private networking',
        why: 'WireGuard with the hard parts handled. Get secure access to your machines from anywhere without opening ports. Genuinely delightful.',
        link: 'https://tailscale.com',
        status: 'tried',
      },
      {
        name: 'Caddy',
        tagline: 'A reverse proxy with automatic HTTPS',
        why: 'The easiest way to put your apps behind a domain with TLS, on by default. A great first reverse proxy.',
        link: 'https://caddyserver.com',
        status: 'recommended',
      },
      {
        name: 'CrowdSec',
        tagline: 'Crowdsourced intrusion prevention',
        why: 'Blocks bad actors across the network of everyone running it. A modern, open alternative to fail2ban.',
        link: 'https://www.crowdsec.net',
        status: 'explore',
      },
      {
        name: 'WireGuard',
        tagline: 'The fast, modern VPN protocol',
        why: 'Small codebase, excellent performance, built into the Linux kernel. The foundation under most modern private-networking tools.',
        link: 'https://www.wireguard.com',
        status: 'recommended',
      },
      {
        name: 'OpenVPN',
        tagline: 'The battle-tested self-hosted VPN',
        why: 'Ubiquitous, well-documented, and runs anywhere. A dependable classic if you want a traditional VPN server you control.',
        link: 'https://openvpn.net',
        status: 'explore',
      },
    ],
  },
  {
    id: 'infra',
    label: 'Infrastructure',
    blurb: 'The boxes, containers, and dashboards that hold it all together.',
    items: [
      {
        name: 'Docker',
        tagline: 'Run any app, isolated, in seconds',
        why: 'The lingua franca of self-hosting. Almost every project ships a container; knowing Docker unlocks all of them.',
        link: 'https://www.docker.com',
        status: 'tried',
      },
      {
        name: 'Proxmox VE',
        tagline: 'Virtual machines and containers on bare metal',
        why: 'Turn one server into many. The standard for a serious homelab — run VMs and LXCs side by side.',
        link: 'https://www.proxmox.com',
        status: 'tried',
      },
      {
        name: 'CasaOS',
        tagline: 'A friendly app store for a home server',
        why: 'The gentlest on-ramp to a homelab. A simple UI with one-click installs on top of Docker. Great first step.',
        link: 'https://casaos.io',
        status: 'recommended',
      },
      {
        name: 'Coolify',
        tagline: 'A self-hosted alternative to Vercel/Heroku',
        why: 'Deploy apps, databases, and services from Git with a PaaS-like experience — on your own server.',
        link: 'https://coolify.io',
        status: 'explore',
      },
      {
        name: 'TrueNAS',
        tagline: 'Turn disks into reliable, shared storage',
        why: 'ZFS-backed NAS with snapshots and shares. The heart of a lot of homelabs.',
        link: 'https://www.truenas.com',
        status: 'explore',
      },
      {
        name: 'Uptime Kuma',
        tagline: 'A self-hosted status dashboard',
        why: 'Know the moment something goes down. Simple monitoring with a friendly UI and plenty of alert channels.',
        link: 'https://uptime.kuma.pet',
        status: 'tried',
      },
      {
        name: 'Prometheus',
        tagline: 'The open standard for metrics',
        why: 'Scrape, store, and query metrics from everything you run. Pair with Grafana for dashboards and alerting.',
        link: 'https://prometheus.io',
        status: 'recommended',
      },
      {
        name: 'ZimaOS',
        tagline: 'A friendly NAS/home-server OS',
        why: 'Turns any machine into a private cloud with a polished app store on top of Docker. A strong beginner NAS path.',
        link: 'https://www.zimaspace.com',
        status: 'explore',
      },
    ],
  },
  {
    id: 'ai',
    label: 'Local AI',
    blurb: 'Run language and image models on your own hardware.',
    items: [
      {
        name: 'Ollama',
        tagline: 'Run Llama and friends locally',
        why: 'One command to pull and run open models. The easiest way to get a private LLM running on your own machine.',
        link: 'https://ollama.com',
        status: 'tried',
      },
      {
        name: 'Open WebUI',
        tagline: 'A polished chat interface for local models',
        why: 'The ChatGPT-style frontend for Ollama and other backends, with a great plugin ecosystem.',
        link: 'https://openwebui.com',
        status: 'recommended',
      },
      {
        name: 'ComfyUI',
        tagline: 'Node-based image generation',
        why: 'Run Stable Diffusion and friends with a visual workflow graph. Deep control for image gen on your own GPU.',
        link: 'https://www.comfy.org',
        status: 'explore',
      },
      {
        name: 'LocalAI',
        tagline: 'An OpenAI-compatible API on your hardware',
        why: 'A drop-in replacement for OpenAI endpoints, running entirely locally. Useful for wiring your own apps to open models.',
        link: 'https://localai.io',
        status: 'explore',
      },
    ],
  },
  {
    id: 'productivity',
    label: 'Productivity & automation',
    blurb: 'Documents, notes, tasks, and the glue that automates your life.',
    items: [
      {
        name: 'n8n',
        tagline: 'Workflow automation you can read',
        why: 'Visually connect apps and services. The self-hosted answer to Zapier, with full control over your data.',
        link: 'https://n8n.io',
        status: 'tried',
      },
      {
        name: 'Paperless-ngx',
        tagline: 'Scan, tag, and search all your documents',
        why: 'Turn a pile of paper into a searchable archive with automatic OCR. Remarkably useful.',
        link: 'https://docs.paperless-ngx.com',
        status: 'recommended',
      },
      {
        name: 'Forgejo',
        tagline: 'A lightweight, self-hosted Git forge',
        why: 'GitHub-like repositories and CI on your own server. The pragmatic pick for owning your code.',
        link: 'https://forgejo.org',
        status: 'explore',
      },
      {
        name: 'Gitea',
        tagline: 'The lightweight, self-hosted Git forge',
        why: 'Fast, single-binary Git hosting with issues and pull requests. Forgejo\u2019s upstream — the original community forge.',
        link: 'https://gitea.com',
        status: 'recommended',
      },
      {
        name: 'Actual Budget',
        tagline: 'Private, zero-based budgeting',
        why: 'Track your money without handing your transactions to a third party. Clean, local-first, and syncs end-to-end encrypted.',
        link: 'https://actualbudget.org',
        status: 'explore',
      },
    ],
  },
  {
    id: 'social',
    label: 'Social & feeds',
    blurb: 'Own your timeline and your reading list instead of renting them.',
    items: [
      {
        name: 'Mastodon',
        tagline: 'The federated social network you can run',
        why: 'Decentralized, open, and yours. Join any server or run your own instance and still talk to the whole fediverse.',
        link: 'https://joinmastodon.org',
        status: 'recommended',
      },
      {
        name: 'FreshRSS',
        tagline: 'A self-hosted RSS reader',
        why: 'Your own feed aggregator with a clean web UI and mobile apps. The private way to keep up with the sites you follow.',
        link: 'https://freshrss.org',
        status: 'recommended',
      },
    ],
  },
];

export const statusLabel: Record<Status, string> = {
  tried: 'Tried it',
  recommended: 'Recommended',
  explore: 'Worth exploring',
};
