// Central site configuration. Edit in one place, used everywhere.

export const site = {
  url: 'https://rendoire.com',
  name: 'rendoire',
  tagline: 'Writing on AI, software, and owning your own tools.',
  description:
    'Writing, AI knowledge, and self-hosting recommendations — building and owning your own tools.',
  medium: 'https://rendoire.medium.com',
  github: 'https://github.com/rhenpri',
  linkedin: 'https://www.linkedin.com/in/rhenderson832/',
  youtube: 'https://www.youtube.com/@rendoire',
  instagram: 'https://instagram.com/rendoire',
  // Tip jar. Branded as a pint of stout; hosted on Buy Me a Coffee.
  support: 'https://buymeacoffee.com/rendoire',
};

// Affiliate / referral links.
// Drop your O'Reilly affiliate/partner tracking parameter here and every
// book link on /ai picks it up automatically. Leave empty for plain links.
export const referral = {
  // e.g. '?ref=rendoire' or '?utm_source=rendoire&utm_medium=referral'
  oreilly: '',
};

/** True once a referral tag is configured, i.e. book links earn a commission. */
export const hasReferral = Boolean(referral.oreilly);

/** `rel` for a book link: paid links must be marked as sponsored. */
export const bookRel = hasReferral ? 'sponsored noopener' : 'noopener';

/** schema.org description of the author, shared by every page's JSON-LD. */
export const person = {
  '@type': 'Person',
  name: site.name,
  url: site.url,
  sameAs: [site.medium, site.github, site.linkedin],
};

export const withRef = (url: string): string =>
  referral.oreilly ? `${url}${url.includes('?') ? '&' : '?'}${referral.oreilly.replace(/^\?/, '')}` : url;
