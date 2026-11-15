// Rows for the savings page. Prices are example figures with no currency:
// the reader overwrites them with what they actually pay.

export interface Subscription {
  id: string;
  label: string;
  hint: string;
  /** Example monthly price. */
  price: number;
}

export const subscriptions: Subscription[] = [
  { id: 'storage', label: 'Cloud storage', hint: 'photos, files, backups', price: 10 },
  { id: 'video', label: 'Film and TV', hint: 'every streaming service you pay for', price: 26 },
  { id: 'music', label: 'Music', hint: 'one streaming plan', price: 11 },
  { id: 'youtube', label: 'YouTube Premium', hint: 'ad-free video', price: 13 },
  { id: 'ai', label: 'AI assistant', hint: 'one chat subscription', price: 20 },
  { id: 'other', label: 'Anything else', hint: 'notes, passwords, VPN, news', price: 0 },
];

export const owning = [
  { id: 'hardware', label: 'Hardware', hint: 'paid once: a small server and drives', value: 500 },
  { id: 'running', label: 'Running costs', hint: 'per month: power, backups, media you buy', value: 18 },
];

export const horizons = [1, 3, 5, 10];
export const defaultHorizon = 5;
