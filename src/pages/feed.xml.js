import rss from '@astrojs/rss';

export async function GET(context) {
  const RSS_URL = 'https://medium.com/feed/@rendoire';
  const API = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(RSS_URL);
  
  let items = [];
  try {
    const res = await fetch(API);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok') {
        items = data.items.map((item) => {
          const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          return {
            title: item.title,
            pubDate: new Date(item.pubDate),
            description: item.description,
            link: `/article?id=${slug}`,
          };
        });
      }
    }
  } catch (err) {
    console.warn('Failed to fetch RSS feed during build:', err);
  }

  return rss({
    title: 'rendoire',
    description: 'Software & AI Engineer for the past 7 years. Business & Technology since childhood. Creativity for a lifetime.',
    site: context.site || 'https://rendoire.com',
    items: items,
    customData: `<language>en-us</language>`,
  });
}
