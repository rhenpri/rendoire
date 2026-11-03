// Central site configuration. Edit in one place, used everywhere.

export const site = {
  url: 'https://rendoire.com',
  name: 'rendoire',
  tagline: 'Writing on AI, software, and owning your own tools.',
  medium: 'https://rendoire.medium.com',
  github: 'https://github.com/rhenpri',
  linkedin: 'https://www.linkedin.com/in/rhenderson832/',
  youtube: 'https://www.youtube.com/@rendoire',
  instagram: 'https://instagram.com/rendoire',
};

// Affiliate / referral links.
// Drop your O'Reilly affiliate/partner tracking parameter here and every
// book link on /ai picks it up automatically. Leave empty for plain links.
export const referral = {
  // e.g. '?ref=rendoire' or '?utm_source=rendoire&utm_medium=referral'
  oreilly: '',
};

export const withRef = (url: string): string =>
  referral.oreilly ? `${url}${url.includes('?') ? '&' : '?'}${referral.oreilly.replace(/^\?/, '')}` : url;
