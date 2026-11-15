// Subscriptions the calculator can replace. Prices are example figures with no
// currency: the reader overwrites them with what they actually pay.

export interface Subscription {
  id: string;
  label: string;
  /** What kind of service this is, as the reader knows it. */
  examples: string;
  /** Example monthly price. */
  price: number;
  /** What replaces it. Names match the self-hosting and tools pages. */
  replacement: string;
  /** What you give up or still pay for. Shown under the row. */
  caveat: string;
}

export const subscriptions: Subscription[] = [
  {
    id: 'storage',
    label: 'Cloud storage and photos',
    examples: 'iCloud+, Google One, Dropbox',
    price: 10,
    replacement: 'Nextcloud, Immich',
    caveat: 'You become the backup. Budget for a second copy somewhere else.',
  },
  {
    id: 'video',
    label: 'Film and TV streaming',
    examples: 'all services combined',
    price: 26,
    replacement: 'Jellyfin',
    caveat: 'You still pay for what you watch: discs, downloads, the odd rental.',
  },
  {
    id: 'music',
    label: 'Music streaming',
    examples: 'Spotify, Apple Music',
    price: 11,
    replacement: 'Navidrome',
    caveat: 'Works if you own your music. No algorithmic discovery.',
  },
  {
    id: 'youtube',
    label: 'YouTube Premium',
    examples: 'ad-free video',
    price: 13,
    replacement: 'NewPipe, a feed reader',
    caveat: 'No account sync or official background play on every device.',
  },
  {
    id: 'ai',
    label: 'AI assistant',
    examples: 'one chat subscription',
    price: 20,
    replacement: 'Ollama, Open WebUI',
    caveat: 'Local models are smaller than hosted ones and need a strong GPU or a lot of memory. Raise the hardware figure if you include this.',
  },
];

export interface Cost {
  id: string;
  label: string;
  hint: string;
  value: number;
}

export const costs: Cost[] = [
  { id: 'hardware', label: 'Hardware, once', hint: 'a small server and drives', value: 500 },
  { id: 'running', label: 'Running costs, per month', hint: 'electricity, a domain, off-site backup', value: 8 },
  { id: 'media', label: 'Media you buy, per month', hint: 'films, albums, books', value: 10 },
];

/** How far ahead the chart looks, in months. */
export const HORIZON = 60;
