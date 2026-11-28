// Essay series. A post joins one with `series: <id>` in its frontmatter.

export interface Series {
  id: string;
  title: string;
  /** One line under the title on post pages. */
  blurb: string;
}

export const series: Record<string, Series> = {
  'the-layer': {
    id: 'the-layer',
    title: 'Between the model and the real world',
    blurb:
      'Essays from deploying AI inside real organisations: where it breaks, what holds, and what nobody budgets for.',
  },
  'owning-it': {
    id: 'owning-it',
    title: 'Taking my devices back',
    blurb: 'Experiments in running my phone, my reading and my data on my own terms.',
  },
};
