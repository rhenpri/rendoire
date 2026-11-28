// Central site configuration. Edit in one place, used everywhere.

export const site = {
  url: 'https://rendoire.com',
  name: 'rendoire',
  tagline: 'Essays on putting AI to work in the real world, and a guide to self-hosting.',
  description:
    'Essays by Ry Henderson on putting AI to work in the real world, plus an AI learning path and self-hosting recommendations.',
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

/**
 * Who writes this. One place for the byline, the About page and the JSON-LD.
 * Keep `role` to the job, never the infrastructure: the site does not say what
 * is running where.
 */
export const author = {
  name: 'Ry Henderson',
  role: 'Technology manager',
  location: 'Derry',
  short: 'Technology manager in Derry. I run live services and build and teach generative AI in the public sector.',
  /**
   * Where "Reply by email" sends readers. Leave empty to hide the link; set it
   * once the address forwards (Namecheap → Email Forwarding).
   */
  replyEmail: '',
};

/**
 * Cookieless page counts via GoatCounter (goatcounter.com). The script is a
 * local copy in public/js/count.js (ISC), so the CSP only has to allow sending
 * counts to the endpoint. Empty string turns analytics off.
 * Skip your own visits: open any page with #toggle-goatcounter once per browser.
 */
export const analytics = {
  goatcounter: 'rendoire',
};
export const goatcounterOrigin = analytics.goatcounter ? `https://${analytics.goatcounter}.goatcounter.com` : '';

/** schema.org description of the author, shared by every page's JSON-LD. */
export const person = {
  '@type': 'Person',
  name: author.name,
  jobTitle: author.role,
  url: `${site.url}/about/`,
  homeLocation: { '@type': 'Place', name: author.location },
  sameAs: [site.medium, site.github, site.linkedin],
};

export const withRef = (url: string): string =>
  referral.oreilly ? `${url}${url.includes('?') ? '&' : '?'}${referral.oreilly.replace(/^\?/, '')}` : url;
