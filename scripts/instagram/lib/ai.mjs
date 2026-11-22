// Optional: have Claude write the carousel copy. Runs only when ANTHROPIC_API_KEY is set.
// Anything that goes wrong returns null and the caller falls back to the deterministic builder.

const MODEL = process.env.IG_AI_MODEL || 'claude-sonnet-5-5';

const SYSTEM = `You turn a blog post into Instagram carousel copy for the writer's own account.
Voice: first person, plain English, UK spelling, short declarative sentences, specific numbers and names over adjectives. Thoughtful, dry, never hype. No emoji, no hashtags inside slide text, no clickbait, no "game changer" or "delve" style filler.
Never use em dashes or en dashes. Use commas, full stops or colons.
Return ONLY a JSON object, no prose, no code fences.`;

const SCHEMA = `{
  "kicker": "2-3 word label for the cover, e.g. 'Kindle hacking'",
  "emphasis": "a 1-3 word phrase from the title to set in italics, or empty",
  "slides": [
    {"type":"text","heading":"max 7 words","body":"max 170 characters, wrap one key phrase in **bold**"},
    {"type":"list","heading":"max 7 words","items":[{"lead":"max 5 words","text":"max 80 chars"}]},
    {"type":"steps","heading":"max 7 words","items":[{"title":"max 4 words","text":"max 80 chars"}]},
    {"type":"quote","text":"max 160 chars, a line worth screenshotting","heading":""}
  ],
  "caption": "Instagram caption, 600-1200 chars: a hook line, short paragraphs, the takeaways, then 'Full post: rendoire.com/blog/<slug> (link in bio)'. No hashtags.",
  "hashtags": ["3 to 6 lowercase tags without #"]
}
Rules: 5 to 8 slides, each slide earns its place, first slide after the cover must hook, last content slide must land the point. At most 4 items per list or steps slide. Use steps only for real sequences.`;

const TYPES = new Set(['text', 'list', 'steps', 'quote']);

function validate(o) {
  if (!o || !Array.isArray(o.slides) || o.slides.length < 3) throw new Error('no slides');
  const slides = o.slides.slice(0, 8).map((s) => {
    if (!TYPES.has(s.type)) throw new Error(`bad slide type ${s.type}`);
    if (s.type === 'text' && !(s.heading && s.body)) throw new Error('text slide incomplete');
    if ((s.type === 'list' || s.type === 'steps') && !(Array.isArray(s.items) && s.items.length >= 2)) throw new Error('list slide incomplete');
    if (s.type === 'steps') s.items = s.items.slice(0, 4).map((i, n) => ({ n: n + 1, title: i.title ?? i.lead, text: i.text ?? '' }));
    if (s.type === 'list') s.items = s.items.slice(0, 5).map((i) => ({ lead: i.lead ?? i.title, text: i.text ?? '' }));
    if (s.type === 'quote' && !s.text) throw new Error('quote incomplete');
    return s;
  });
  return { slides, kicker: o.kicker, emphasis: o.emphasis, caption: o.caption, hashtags: (o.hashtags ?? []).map(String) };
}

export async function curate(post) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  console.log(`  asking ${MODEL} to write the carousel copy`);
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Schema:\n${SCHEMA}\n\nTitle: ${post.title}\nSlug: ${post.slug}\n\nPost (markdown):\n${post.plainText}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
  const data = await res.json();
  const text = data.content?.find((b) => b.type === 'text')?.text ?? '';
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  return validate(JSON.parse(json));
}
