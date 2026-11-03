export interface Tool {
  name: string;
  note: string;
  link: string;
}

export interface ToolGroup {
  id: string;
  label: string;
  items: Tool[];
}

// A shortlist of apps, services, and hardware worth reaching for.
// Framed as recommendations rather than a personal stack.
export const toolGroups: ToolGroup[] = [
  {
    id: 'privacy',
    label: 'Privacy & mobile',
    items: [
      {
        name: 'Proton',
        note: 'Encrypted email, calendar, drive, VPN and password manager — one suite, no ads, no data mining.',
        link: 'https://proton.me',
      },
      {
        name: 'Mullvad VPN',
        note: 'The no-account VPN. Pay anonymously, open-source clients, audited and refreshingly honest.',
        link: 'https://mullvad.net',
      },
      {
        name: 'Tailscale',
        note: 'Zero-config private networking — your machines reachable from anywhere, without opening ports.',
        link: 'https://tailscale.com',
      },
      {
        name: 'Brave Browser',
        note: 'A Chromium browser with built-in ad and tracker blocking, and a strong privacy posture out of the box.',
        link: 'https://brave.com',
      },
      {
        name: 'GrapheneOS',
        note: 'A hardened, de-Googled Android. The gold standard if you want a phone that answers to you.',
        link: 'https://grapheneos.org',
      },
      {
        name: 'F-Droid',
        note: 'An open-source app store with no trackers. The front door to a whole ecosystem of clean Android apps.',
        link: 'https://f-droid.org',
      },
      {
        name: 'FUTO Keyboard',
        note: 'A privacy-respecting keyboard with genuinely good swipe typing — no telemetry.',
        link: 'https://keyboard.futo.org',
      },
      {
        name: 'Organic Maps',
        note: 'Offline, privacy-respecting navigation built on OpenStreetMap. No accounts, no ads, no tracking.',
        link: 'https://organicmaps.app',
      },
      {
        name: 'LocalSend',
        note: 'AirDrop-style file sharing across devices on your own network — no cloud, no accounts, cross-platform.',
        link: 'https://localsend.org',
      },
      {
        name: 'NewPipe',
        note: 'A lightweight, private YouTube client for Android — no ads, no Google account. PipePipe is a popular fork.',
        link: 'https://newpipe.net',
      },
      {
        name: 'Obtainium',
        note: 'Install and update Android apps straight from their source — GitHub, GitLab, or F-Droid — bypassing app stores.',
        link: 'https://obtainium.imranr.dev',
      },
      {
        name: 'Aurora Store',
        note: 'Browse and install Google Play apps without a Google account, with a clean privacy-respecting client.',
        link: 'https://auroraoss.com',
      },
    ],
  },
  {
    id: 'ai-dev',
    label: 'AI & dev',
    items: [
      {
        name: 'OpenCode',
        note: 'An open-source terminal coding agent that stays out of your way and works where you already do.',
        link: 'https://opencode.ai',
      },
      {
        name: 'OpenClaw',
        note: 'An open-source personal AI agent that runs on your machine and chats wherever you already are.',
        link: 'https://openclaw.ai',
      },
      {
        name: 'Hermes',
        note: 'Nous Research\u2019s self-improving AI agent — the one with a built-in learning loop that grows skills from experience.',
        link: 'https://nousresearch.com',
      },
      {
        name: 'LibreChat',
        note: 'A self-hostable chat interface that talks to many models behind one clean, private UI.',
        link: 'https://www.librechat.ai',
      },
      {
        name: 'Obsidian',
        note: 'Local-first Markdown notes that you own as plain files. The note system that scales with a brain.',
        link: 'https://obsidian.md',
      },
    ],
  },
  {
    id: 'hardware',
    label: 'Hardware',
    items: [
      {
        name: 'Synology',
        note: 'The NAS everyone starts with — quiet, reliable, and supported for years. Great first home server.',
        link: 'https://www.synology.com',
      },
      {
        name: 'UGREEN',
        note: 'A newer NAS challenger with strong hardware-per-dollar and a clean OS. Worth a serious look.',
        link: 'https://nas.ugreen.com',
      },
      {
        name: 'Raspberry Pi',
        note: 'The tiny computer that powers a huge slice of the homelab world. Cheap, quiet, endlessly useful.',
        link: 'https://www.raspberrypi.com',
      },
      {
        name: 'Framework',
        note: 'A repairable, upgradeable laptop built to be opened — the anti-landfill choice for portable computing.',
        link: 'https://frame.work',
      },
    ],
  },
];
