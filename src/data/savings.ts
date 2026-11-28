// Rows for the savings page. Prices are example monthly figures; the reader
// picks a currency and overwrites them with what they actually pay.
//
// Only the rows that self-hosting genuinely replaces start ticked. The rest are
// listed so readers can count them, with a hint saying what the swap costs.

export interface Subscription {
  id: string;
  label: string;
  hint: string;
  /** Example monthly price. */
  price: number;
  /** Ticked by default: only like-for-like swaps. */
  on: boolean;
}

export const subscriptions: Subscription[] = [
  { id: 'storage', label: 'Cloud storage', hint: 'photos, files, backups', price: 10, on: true },
  { id: 'other', label: 'Passwords and notes', hint: 'a password manager, a notes app', price: 5, on: true },
  { id: 'video', label: 'Film and TV', hint: 'only if you would buy what you watch', price: 26, on: false },
  { id: 'music', label: 'Music', hint: 'only if you would buy what you play', price: 11, on: false },
  { id: 'youtube', label: 'YouTube Premium', hint: 'a private client blocks the ads', price: 13, on: false },
  { id: 'ai', label: 'AI assistant', hint: 'local models are smaller than hosted ones', price: 20, on: false },
];

export const owning = [
  { id: 'hardware', label: 'Hardware', hint: 'paid once: a small used PC and a drive', value: 300 },
  { id: 'running', label: 'Running costs', hint: 'per month: power and an off-site backup', value: 6 },
];

export const horizons = [1, 3, 5, 10];
export const defaultHorizon = 5;

/** Symbols the reader can pick. An empty symbol shows plain numbers. */
export const currencies = [
  { id: 'gbp', symbol: '£', label: 'GBP' },
  { id: 'eur', symbol: '€', label: 'EUR' },
  { id: 'usd', symbol: '$', label: 'USD' },
  { id: 'none', symbol: '', label: 'None' },
];
export const defaultCurrency = 'gbp';
