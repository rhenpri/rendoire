// In-post diagrams and charts, drawn in the site's style (dark ground, green
// for "good", dashed red for "bad", Fraunces titles, Plex Mono labels) and
// rendered to WebP at 2x. Same look as the Kindle post's hand-made diagrams.
//
// Usage: node scripts/diagrams.mjs              # all
//        node scripts/diagrams.mjs <slug> [...]  # only these posts
//
// Each figure is { slug, name, alt, html }. Embed with
// ![alt](../../assets/blog/<slug>/<name>.webp)

import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(join(root, 'node_modules', pkg, 'files', file)).toString('base64')}`;

const CSS = `
@font-face { font-family: F; src: url(${font('@fontsource-variable/fraunces', 'fraunces-latin-wght-normal.woff2')}); font-weight: 100 900; }
@font-face { font-family: F; font-style: italic; src: url(${font('@fontsource-variable/fraunces', 'fraunces-latin-wght-italic.woff2')}); font-weight: 100 900; }
@font-face { font-family: M; src: url(${font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2')}); }
@font-face { font-family: M; font-weight: 600; src: url(${font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff2')}); }
:root { --bg:#0a0a0a; --card:#141414; --line:rgba(255,255,255,.16); --text:#ececec; --muted:#b0b0b0; --mid:#8a8a8a; --g:#3ecf8e; --p:#c4b5fd; --r:#f87171; }
* { box-sizing: border-box; margin: 0; }
body { background: var(--bg); color: var(--text); font-family: F, Georgia, serif; font-weight: 350; }
.fig { width: 1600px; padding: 56px 64px 52px; background: var(--bg); }
.t { font-size: 46px; font-weight: 420; text-align: center; letter-spacing: -0.01em; }
.s { font-size: 27px; font-style: italic; font-weight: 300; color: var(--mid); text-align: center; margin-top: 10px; }
.foot { font-size: 26px; font-style: italic; font-weight: 300; text-align: center; margin-top: 44px; color: var(--text); }
.src { font-family: M; font-size: 17px; color: var(--mid); text-align: center; margin-top: 16px; letter-spacing: .04em; }
.body { margin-top: 52px; }
.card { background: var(--card); border: 2px solid var(--line); border-radius: 18px; padding: 28px; }
.card.g { border-color: var(--g); } .card.p { border-color: var(--p); }
.card.r { border: 2px dashed var(--r); }
.k { font-family: M; font-size: 21px; letter-spacing: .1em; text-transform: uppercase; color: var(--g); }
.k.r { color: var(--r); } .k.p { color: var(--p); } .k.m { color: var(--mid); }
.h { font-size: 34px; font-weight: 600; margin-top: 8px; }
.d { font-size: 24px; color: var(--muted); line-height: 1.45; margin-top: 8px; }
.row { display: flex; gap: 28px; align-items: stretch; }
.col { display: flex; flex-direction: column; gap: 20px; }
.arrow { color: var(--g); font-size: 44px; align-self: center; }
.mono { font-family: M; }
svg text { font-family: M; }
`;

const page = (inner, { t, s, foot, src }) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
<body><div class="fig" id="fig"><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ''}
<div class="body">${inner}</div>${foot ? `<div class="foot">${foot}</div>` : ''}${src ? `<div class="src">${src}</div>` : ''}</div></body></html>`;

/* ---------- small helpers ---------- */
const grid = (cols, rows, colour, size = 16, gap = 9) => {
  let c = '';
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) c += `<rect x="${x * (size + gap)}" y="${y * (size + gap)}" width="${size}" height="${size}" rx="3" fill="${colour}"/>`;
  return `<svg width="${cols * (size + gap)}" height="${rows * (size + gap)}">${c}</svg>`;
};
const flow = (steps, colour = 'var(--g)', fs = 25) =>
  `<div class="row" style="gap:${fs < 25 ? 8 : 14}px;justify-content:center;flex-wrap:nowrap">${steps
    .map((st, i) => `${i ? `<span class="arrow" style="color:${colour};font-size:${fs + 8}px">→</span>` : ''}<div class="card" style="padding:${fs < 25 ? '14px 14px' : '18px 22px'};border-color:${i === steps.length - 1 ? colour : 'var(--line)'}"><div style="font-size:${fs}px;white-space:nowrap">${st}</div></div>`)
    .join('')}</div>`;

/* ---------- figures ---------- */
const FIGS = [
  // 1. Read Before You Write
  {
    slug: 'read-before-you-write', name: 'empty-means-everything',
    alt: 'Two panels. Left: one rack whose remaining machines to wipe is an empty list. Right: the same empty list read as everything, with every machine in the content network marked for wiping in red.',
    html: page(`<div class="row" style="justify-content:center;gap:40px">
      <div class="card" style="flex:0 0 420px;text-align:center"><div class="k m">What was left to wipe</div><div class="h" style="margin:14px 0 22px">One rack</div>${grid(4, 8, '#2a2a2a')}<div class="d" style="margin-top:20px">Already wiped. Still to do: <span class="mono" style="color:var(--g)">[ ]</span></div></div>
      <span class="arrow" style="font-size:56px">→</span>
      <div class="card r" style="flex:1;text-align:center"><div class="k r">What the automation heard</div><div class="h" style="margin:14px 0 22px">Every machine in the CDN</div>${grid(26, 8, 'var(--r)')}<div class="d" style="margin-top:20px">An empty list was a special value. It meant <em>everything</em>.</div></div>
    </div>`, { t: 'Empty means everything', s: 'One restarted job, one special value, minutes to wipe a global network', foot: 'Nothing malicious. A reasonable system did exactly what it was told, at machine speed.', src: 'Source: Beyer et al., Site Reliability Engineering (O’Reilly, 2016), ch. 7. Illustrative.' }),
  },
  {
    slug: 'read-before-you-write', name: 'the-ladder',
    alt: 'A five-step staircase rising left to right: Observe, Recommend, Prepare, Act with approval, Act alone. Each step shows what the agent does and what the human still does. The top step is outlined in green.',
    html: page(`<div style="display:flex;align-items:flex-end;gap:18px;height:640px">${[
      ['1', 'Observe', 'reads, summarises, explains', 'everything else'],
      ['2', 'Recommend', 'proposes actions with evidence', 'picks and acts'],
      ['3', 'Prepare', 'writes the change, dry-runs it', 'presses the button'],
      ['4', 'Act with approval', 'acts after sign-off, reports', 'approves each action'],
      ['5', 'Act alone', 'acts within limits, reports after', 'reviews, can revoke'],
    ].map(([n, name, agent, human], i) => `<div class="card ${i === 4 ? 'g' : ''}" style="flex:1;height:${340 + i * 72}px;display:flex;flex-direction:column;justify-content:flex-start">
        <div class="k">Rung ${n}</div><div class="h" style="font-size:31px">${name}</div>
        <div class="d" style="margin-top:14px"><span class="mono" style="color:var(--g);font-size:18px">AGENT</span><br>${agent}</div>
        <div class="d" style="margin-top:10px"><span class="mono" style="color:var(--p);font-size:18px">HUMAN</span><br>${human}</div></div>`).join('')}</div>`,
      { t: 'The autonomy ladder', s: 'Earned one rung at a time, with evidence', foot: 'The ladder belongs to a task, not to the agent. One incident and the task drops a rung.' }),
  },

  // 2. Nobody Budgets for Evals
  {
    slug: 'nobody-budgets-for-evals', name: 'three-layers',
    alt: 'Three stacked layers of AI evaluation, widening downwards: Components (retrieval, faithfulness, format), Operations (cost per run, steps, human interventions) and Outcomes (faster fixes, fewer repeat problems, less toil). The outcomes layer is outlined in green and labelled as the one leadership pays for.',
    html: page(`<div class="col" style="align-items:center;gap:18px">
      ${[
        ['Components', 'Does retrieval find the right document? Is the answer faithful to it? Is the format right?', 'engineers measure this, because it is interesting', 760, ''],
        ['Operations', 'Cost per run. Steps per task. How often a human has to step in.', 'platform teams measure this, because it is on a dashboard', 1080, ''],
        ['Outcomes', 'Faster fixes. Fewer repeat problems. Less soul-destroying work.', 'leadership only ever pays for this one', 1440, 'g'],
      ].map(([h, d, who, w, c]) => `<div class="card ${c}" style="width:${w}px;text-align:center"><div class="h">${h}</div><div class="d">${d}</div><div class="k ${c ? '' : 'm'}" style="margin-top:12px;font-size:18px">${who}</div></div>`).join('')}
    </div>`, { t: 'Three layers of measurement', s: 'Most evaluations stop at the top', foot: '“The answers look good” is a component, not a result.' }),
  },
  {
    slug: 'nobody-budgets-for-evals', name: 'one-page-scorecard',
    alt: 'A mock one-page monthly scorecard for an AI feature, with illustrative numbers: time to first correct action down from 25 to 9 minutes against baseline, human-sampled quality at 94 percent, cost per problem solved 18 pence, incidents caused by the AI zero, and one autonomy change with evidence.',
    html: page(`<div class="card" style="max-width:1180px;margin:0 auto;padding:40px 48px">
      <div style="display:flex;justify-content:space-between;align-items:baseline"><div class="h" style="margin:0">Triage assistant · monthly scorecard</div><div class="k m">illustrative</div></div>
      ${[
        ['Outcome vs baseline', 'Time to first correct action', '25 → 9 min', 'var(--g)'],
        ['Quality (human sample)', 'Correct, safe, cited, useful', '94%', 'var(--text)'],
        ['Cost per outcome', 'Per problem solved, not per call', '18p', 'var(--text)'],
        ['Harms', 'Incidents the AI caused or worsened', '0', 'var(--g)'],
        ['Autonomy', '“Known pattern” field promoted to default', '+1 rung', 'var(--p)'],
      ].map(([k, d, v, c]) => `<div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding:22px 0;margin-top:${k.startsWith('Outcome') ? 24 : 0}px">
        <div><div class="k" style="font-size:18px">${k}</div><div class="d" style="margin-top:4px">${d}</div></div>
        <div style="font-size:52px;font-weight:500;color:${c}">${v}</div></div>`).join('')}
    </div>`, { t: 'One page, once a month', s: 'Outcomes, quality, cost, harms, trust', foot: 'The harms line is what makes the rest believable.' }),
  },

  // 3. AI on Call
  {
    slug: 'ai-on-call', name: 'first-look',
    alt: 'A vague ticket reading “users are being logged out since lunchtime” turned by the triage assistant into a structured first look with illustrative values: likely pattern session cookie at 71 percent confidence, suggested severity medium with evidence, owner identity team, three first checks cheapest first, a linked runbook, and a recent change. A note says it closes nothing and decides nothing.',
    html: page(`<div class="row" style="align-items:center">
      <div class="card r" style="flex:0 0 430px"><div class="k r">The ticket</div><div class="h" style="font-size:32px;font-style:italic;font-weight:400;margin-top:14px">“users are being logged out since lunchtime”</div><div class="d" style="margin-top:16px">No numbers. No error. 03:30.</div></div>
      <span class="arrow" style="font-size:60px">→</span>
      <div class="card g" style="flex:1"><div style="display:flex;justify-content:space-between"><div class="k">The first look</div><div class="k m">illustrative</div></div>
        ${[
          ['Summary', 'Session loss for web users since ~12:40'],
          ['Likely pattern', 'session-cookie-domain · 71% · verified 3 months ago'],
          ['Severity (suggested)', 'medium · login success down 3 points'],
          ['Probable owner', 'identity team'],
          ['First checks', '1. cookie domain config  2. token service latency  3. yesterday’s deploys'],
          ['Fixed before by', 'runbook: session-cookie-domain.md'],
        ].map(([a, b]) => `<div style="display:flex;gap:20px;border-top:1px solid var(--line);padding:12px 0;margin-top:8px"><div class="mono" style="flex:0 0 270px;font-size:19px;color:var(--mid);text-transform:uppercase;letter-spacing:.06em">${a}</div><div style="font-size:24px">${b}</div></div>`).join('')}
      </div></div>`, { t: 'The blank page, filled in', s: 'What a triage assistant hands the person on call', foot: 'It closes nothing and decides nothing. It just means nobody starts from scratch.' }),
  },
  {
    slug: 'ai-on-call', name: 'rollout',
    alt: 'A four-stage rollout timeline. Shadow: the assistant writes privately while engineers triage as usual, and the two are compared. Suggest: suggestions appear on the real ticket and edits are measured. Trusted fields: fields that keep agreeing become defaults, while severity and owner stay human. Propose fixes: later, with evidence, the assistant proposes actions from an approved catalogue.',
    html: page(`<div class="row">${[
      ['Weeks 1–4', 'Shadow', 'Writes its analysis privately. Engineers triage as usual. Compare afterwards.', 'humans own everything', ''],
      ['Next', 'Suggest', 'Suggestions appear on the real ticket. Measure time to first correct action and edit rate.', 'humans confirm every field', ''],
      ['Earned', 'Trusted fields', 'Fields that keep agreeing become the default. “Which known pattern” usually first.', 'severity and owner stay human', ''],
      ['Later, with evidence', 'Propose fixes', 'Picks a mitigation from an approved catalogue, with a confidence attached.', 'a human approves the action', 'g'],
    ].map(([when, h, d, own, c], i) => `${i ? '<span class="arrow">→</span>' : ''}<div class="card ${c}" style="flex:1"><div class="k ${c ? '' : 'm'}">${when}</div><div class="h">${h}</div><div class="d">${d}</div><div class="mono" style="margin-top:16px;font-size:18px;color:var(--p);text-transform:uppercase;letter-spacing:.06em">${own}</div></div>`).join('')}</div>`,
      { t: 'Shadow first', s: 'Each stage is earned with numbers, not vibes', foot: 'Track severity under-calls separately. An average will hide the dangerous ones.' }),
  },

  // 4. The Token Bill
  {
    slug: 'the-token-bill', name: 'tokens-per-question',
    alt: 'Horizontal bar chart of tokens per question for 120 pages of documentation. Send everything: about 144,000 tokens. Index then three pages: about 10,800. Filter then three pages: about 4,300. The last bar is over thirty times shorter than the first.',
    html: page((() => {
      const rows = [['Send everything', 144000, 'var(--r)'], ['Index, then 3 pages', 10800, 'var(--p)'], ['Filter, then 3 pages', 4300, 'var(--g)']];
      const W = 880;
      return `<div class="col" style="gap:34px">${rows.map(([l, v, c]) => `<div style="display:flex;align-items:center;gap:28px"><div style="flex:0 0 330px;font-size:30px;text-align:right">${l}</div>
        <div style="flex:1;display:flex;align-items:center;gap:20px"><div style="height:64px;width:${Math.max(8, (v / 144000) * W)}px;background:${c};border-radius:6px"></div><div class="mono" style="font-size:28px">${v.toLocaleString('en-GB')}</div></div></div>`).join('')}</div>`;
    })(), { t: 'Tokens per question', s: '120 pages of documentation at about 1,200 tokens each', foot: 'More than thirty times cheaper, and the gap widens every time someone writes something down.', src: 'Round numbers. Swap in your own.' }),
  },
  {
    slug: 'the-token-bill', name: 'when-it-breaks',
    alt: 'Line chart of tokens per question as documentation grows from 0 to 250 pages. Sending everything rises in a straight line and crosses a 200,000-token context window limit at about 167 pages, where it stops working. Index-then-three-pages and filter-then-three-pages stay close to the bottom of the chart.',
    html: page((() => {
      const W = 1300, H = 560, P = 90, maxX = 250, maxY = 320000; // svg is drawn H+50 tall
      const x = (n) => P + (n / maxX) * (W - P - 30), y = (t) => H - 60 - (t / maxY) * (H - 110);
      const line = (f, c, dash = '') => `<polyline fill="none" stroke="${c}" stroke-width="6" ${dash} points="${Array.from({ length: 51 }, (_, i) => i * 5).map((n) => `${x(n)},${y(f(n))}`).join(' ')}"/>`;
      const ticksY = [0, 100000, 200000, 300000].map((t) => `<line x1="${P}" x2="${W - 30}" y1="${y(t)}" y2="${y(t)}" stroke="rgba(255,255,255,.08)"/><text x="${P - 14}" y="${y(t) + 7}" fill="#8a8a8a" font-size="20" text-anchor="end">${t ? t / 1000 + 'k' : '0'}</text>`).join('');
      const ticksX = [0, 50, 100, 150, 200, 250].map((n) => `<text x="${x(n)}" y="${H - 22}" fill="#8a8a8a" font-size="20" text-anchor="middle">${n}</text>`).join('');
      const brk = 200000 / 1200;
      return `<svg width="${W}" height="${H + 50}" style="display:block;margin:0 auto">${ticksY}${ticksX}
        <line x1="${P}" x2="${W - 30}" y1="${y(200000)}" y2="${y(200000)}" stroke="#c4b5fd" stroke-width="3" stroke-dasharray="10 8"/>
        <text x="${W - 34}" y="${y(200000) - 14}" fill="#c4b5fd" font-size="21" text-anchor="end">200k-token context window</text>
        ${line((n) => Math.min(n, brk) * 1200, '#f87171')}
        <line x1="${x(brk)}" x2="${x(250)}" y1="${y(200000)}" y2="${y(200000)}" stroke="#f87171" stroke-width="6" stroke-dasharray="4 10"/>
        <circle cx="${x(brk)}" cy="${y(200000)}" r="12" fill="#0a0a0a" stroke="#f87171" stroke-width="5"/>
        <text x="${x(brk) + 22}" y="${y(200000) + 44}" fill="#f87171" font-size="22">~167 pages: stops fitting</text>
        ${line((n) => n * 60 + 3600, '#c4b5fd')}${line(() => 4300, '#3ecf8e')}
        <text x="${x(250) - 6}" y="${y(250 * 60 + 3600) - 16}" fill="#c4b5fd" font-size="21" text-anchor="end">index, then 3 pages</text>
        <text x="${x(250) - 6}" y="${y(250 * 60 + 3600) - 46}" fill="#3ecf8e" font-size="21" text-anchor="end">filter, then 3 pages (flat)</text>
        <text x="${x(95)}" y="${y(95 * 1200) - 22}" fill="#f87171" font-size="21" text-anchor="end">send everything</text>
        <text x="${(W + P) / 2}" y="${H + 30}" fill="#8a8a8a" font-size="20" text-anchor="middle">pages of documentation</text></svg>`;
    })(), { t: 'Expensive, then broken', s: 'Tokens per question as the knowledge base grows', foot: 'Retrieval is not an optimisation you add later. It is what makes the thing work.' }),
  },

  // 5. The Prompt Whisperer
  {
    slug: 'the-prompt-whisperer', name: 'two-ways-in',
    alt: 'Two ways to write a prompt. Top, the linear way: write what you want, see what comes back, tweak the wording, repeat. Bottom, the other end: design the answer’s shape, plan the exit for when it does not know, and hold three framings at once, all feeding into the prompt, which is written last.',
    html: page(`<div class="col" style="gap:34px">
      <div class="card"><div class="k m">The usual way · in a line</div><div style="margin-top:22px">${flow(['Write what you want', 'See what comes back', 'Tweak the wording', 'Repeat'], 'var(--mid)')}</div></div>
      <div class="card g"><div class="k">The other end · whole system first</div>
        <div class="row" style="margin-top:22px;align-items:center">
          <div class="col" style="flex:1;gap:14px">${['Design the answer’s shape', 'Plan the exit: “not covered”', 'Hold three framings at once'].map((t) => `<div class="card" style="padding:16px 22px;font-size:25px">${t}</div>`).join('')}</div>
          <span class="arrow" style="font-size:56px">→</span>
          <div class="card g" style="flex:0 0 360px;text-align:center"><div class="h">The prompt</div><div class="d">written last</div></div>
        </div></div>
    </div>`, { t: 'Two ways in', s: 'Same model, different starting point', foot: 'Prompting is not a writing problem. It is predicting how a black box will misread you.' }),
  },
  {
    slug: 'the-prompt-whisperer', name: 'answer-first',
    alt: 'An output contract written before the instruction, shown as a card of fields: summary in one plain line, up to three likely causes ranked with the evidence that would confirm each, first checks cheapest first, the fix with its source, and a not covered flag with who to ask when nothing matches.',
    html: page(`<div class="row" style="align-items:center">
      <div class="card p" style="flex:1;font-family:M;font-size:23px;line-height:1.75">
        <div class="k p" style="margin-bottom:12px">Output contract · written first</div>
        <span style="color:#8a8a8a">{</span><br>
        &nbsp;&nbsp;<span style="color:var(--g)">"summary"</span>: <span style="color:#b0b0b0">"one plain line"</span>,<br>
        &nbsp;&nbsp;<span style="color:var(--g)">"likely_causes"</span>: <span style="color:#b0b0b0">[ up to 3, ranked, each with the evidence that proves or rules it out ]</span>,<br>
        &nbsp;&nbsp;<span style="color:var(--g)">"first_checks"</span>: <span style="color:#b0b0b0">[ cheapest first ]</span>,<br>
        &nbsp;&nbsp;<span style="color:var(--g)">"fix"</span>: <span style="color:#b0b0b0">"with a link to where it came from"</span>,<br>
        &nbsp;&nbsp;<span style="color:var(--r)">"not_covered"</span>: <span style="color:#b0b0b0">true → say so, and who to ask</span><br>
        <span style="color:#8a8a8a">}</span></div>
      <div class="col" style="flex:0 0 430px">
        <div class="card"><div class="k">Whole before parts</div><div class="d">The shape comes before the instruction.</div></div>
        <div class="card"><div class="k r">Edge before middle</div><div class="d">The exit is the first line, not the last.</div></div>
        <div class="card"><div class="k p">Several answers alive</div><div class="d">Ranked causes, not <em>the</em> cause.</div></div>
      </div></div>`, { t: 'Answer first', s: 'Three habits, one contract', foot: 'A model told exactly what shape to fill beats one told to be “detailed”.' }),
  },

  // 6. The Side Door
  {
    slug: 'the-side-door', name: 'two-routes',
    alt: 'Two routes into tech. The front door, drawn faintly: A-levels, university and debt, then a graduate job. The side door, in green, with years: leaving school at 16 in 2016 for a BTEC at North West Regional College, a degree apprenticeship from 2019 working four days and studying one, a 2:1 with no debt in 2023, live services, AI, and technology manager in 2025.',
    html: page(`<div class="col" style="gap:40px">
      <div><div class="k m" style="margin-bottom:16px">The front door</div>${flow(['A-levels', 'University (and debt)', 'Graduate job'], 'var(--mid)')}</div>
      <div><div class="k" style="margin-bottom:16px">The side door · mine</div>
        <div class="row" style="gap:12px">${[
          ['2016', 'Left school at 16', 'BTEC in IT, NWRC'],
          ['2018', 'Triple Distinction*', 'top grade, ahead of the class'],
          ['2019', 'Degree apprentice', '4 days work, 1 day uni'],
          ['2022 →', 'Live services, then AI', 'learning in context'],
          ['2023', '2:1, no debt', 'Business Technology, Ulster'],
          ['2025', 'Technology manager', 'in my own city'],
        ].map(([y, h, d], i) => `<div class="card ${i === 5 ? 'g' : ''}" style="flex:1;padding:20px"><div class="k">${y}</div><div style="font-size:27px;font-weight:600;margin-top:8px">${h}</div><div class="d" style="font-size:21px">${d}</div></div>`).join('')}</div></div>
    </div>`, { t: 'Two ways in', s: 'Both work. Only one gets talked about in schools.', foot: 'The standard route is a ladder someone else designed. It is not the building.' }),
  },
  {
    slug: 'the-side-door', name: 'kind-and-wicked',
    alt: 'Two cards comparing kind and wicked fields from David Epstein’s Range. Kind fields like chess and golf have clear rules and instant feedback, so specialising early pays. Wicked fields like most careers and technology have fuzzy rules and slow feedback, so sampling widely and finding a good fit wins.',
    html: page(`<div class="row">
      <div class="card" style="flex:1"><div class="k m">Kind fields</div><div class="h">Chess. Golf.</div><div class="d" style="font-size:27px;margin-top:18px">Clear rules. Instant feedback.<br>The ball went in or it didn’t.</div><div class="k" style="margin-top:28px;color:var(--text)">→ specialise early</div></div>
      <div class="card g" style="flex:1"><div class="k">Wicked fields</div><div class="h">Most careers. Technology.</div><div class="d" style="font-size:27px;margin-top:18px">Fuzzy rules. Slow feedback.<br>Nobody at 16 knows what the job looks like at 26.</div><div class="k" style="margin-top:28px">→ sample widely, find the fit</div></div>
    </div>`, { t: 'Kind and wicked', s: 'Why the side door worked', src: 'After David Epstein, Range (2019).' }),
  },

  // 7. Collecting Is Not Learning
  {
    slug: 'collecting-is-not-learning', name: 'the-funnel',
    alt: 'A narrowing funnel of what happens to saved ideas: hundreds of highlights captured, far fewer read again, fewer still actually used, and only a handful expressed in my own words. The last stage, Express, is outlined in green as the step almost everyone skips.',
    html: page(`<div class="col" style="align-items:center;gap:16px">${[
      ['Captured', 'hundreds of highlights, filed automatically', 1300, 'var(--line)', ''],
      ['Read again', 'a fraction', 900, 'var(--line)', ''],
      ['Used', 'changed something I actually did', 560, 'var(--line)', ''],
      ['Expressed', 'written in my own words, shared', 300, 'var(--g)', 'the step almost everyone skips'],
    ].map(([h, d, w, c, note]) => `<div class="card" style="width:${w}px;text-align:center;border-color:${c};padding:22px"><div style="font-size:32px;font-weight:600">${h}</div><div class="d" style="font-size:22px">${d}</div>${note ? `<div class="k" style="margin-top:8px;font-size:17px">${note}</div>` : ''}</div>`).join('')}</div>`,
      { t: 'Where saved ideas go', s: 'Capturing is the fun part. Expressing is the work.', src: 'Stages after Tiago Forte’s CODE method, Building a Second Brain (2022). Illustrative.' }),
  },
  {
    slug: 'collecting-is-not-learning', name: 'forgetting-curve',
    alt: 'Two forgetting curves. A red curve drops steeply within days when an idea is saved and never revisited. A green curve drops more slowly and is lifted back up each time the idea is used, written about or taught, staying high.',
    html: page((() => {
      const W = 1300, H = 520, P = 80, days = 30;
      const x = (d) => P + (d / days) * (W - P - 40), y = (r) => H - 60 - r * (H - 120);
      let red = [], green = [], s = 2.2, last = 0;
      const reviews = [2, 6, 14];
      for (let d = 0; d <= days; d += 0.25) {
        red.push(`${x(d)},${y(Math.exp(-d / 2.2))}`);
        if (reviews.includes(d)) { last = d; s *= 2.6; }
        green.push(`${x(d)},${y(Math.exp(-(d - last) / s))}`);
      }
      return `<svg width="${W}" height="${H}" style="display:block;margin:0 auto">
        <line x1="${P}" y1="${H - 60}" x2="${W - 40}" y2="${H - 60}" stroke="rgba(255,255,255,.2)"/><line x1="${P}" y1="40" x2="${P}" y2="${H - 60}" stroke="rgba(255,255,255,.2)"/>
        <text x="${P - 16}" y="${y(1) + 8}" fill="#8a8a8a" font-size="20" text-anchor="end">all</text><text x="${P - 16}" y="${y(0) + 6}" fill="#8a8a8a" font-size="20" text-anchor="end">none</text>
        ${[0, 7, 14, 21, 28].map((d) => `<text x="${x(d)}" y="${H - 24}" fill="#8a8a8a" font-size="20" text-anchor="middle">day ${d}</text>`).join('')}
        <polyline fill="none" stroke="#f87171" stroke-width="6" points="${red.join(' ')}"/>
        <polyline fill="none" stroke="#3ecf8e" stroke-width="6" points="${green.join(' ')}"/>
        ${reviews.map((d, i) => `<circle cx="${x(d)}" cy="${y(1)}" r="10" fill="#3ecf8e"/><text x="${x(d) + 16}" y="${y(1) - 14}" fill="#3ecf8e" font-size="20">${['used it', 'wrote about it', 'taught it'][i]}</text>`).join('')}
        <text x="${x(17)}" y="${y(0.02) - 22}" fill="#f87171" font-size="22">saved, never revisited</text></svg>`;
    })(), { t: 'Forgetting is a filter', s: 'How much of an idea you keep, over a month', foot: 'You keep what you use. Everything else was only ever collected.', src: 'Curve shape after Ebbinghaus (1885). Illustrative, not measured.' }),
  },

  // 8. The System Is Not the Work
  {
    slug: 'the-system-is-not-the-work', name: 'complexity-moves',
    alt: 'Before and after a productivity system. Before: the work holds all of its complexity. After: the work looks simpler, but a new box called the system now holds the complexity that moved into it, and needs looking after. Larry Tesler’s law of conservation of complexity.',
    html: page(`<div class="row" style="align-items:center;justify-content:center;gap:44px">
      <div class="card" style="flex:0 0 470px;text-align:center"><div class="k m">Before</div><div class="h">The work</div>${grid(9, 6, 'var(--p)', 26, 10)}<div class="d" style="margin-top:14px">All of the complexity, in one place</div></div>
      <span class="arrow" style="font-size:60px">→</span>
      <div class="col" style="flex:0 0 560px">
        <div class="card g" style="text-align:center"><div class="k">After</div><div class="h">The work</div>${grid(9, 3, 'var(--p)', 26, 10)}<div class="d" style="margin-top:10px">Looks simpler</div></div>
        <div class="card r" style="text-align:center"><div class="h" style="margin-top:0">The system</div>${grid(9, 3, 'var(--r)', 26, 10)}<div class="d" style="margin-top:10px">Now holds the rest. And it needs looking after.</div></div>
      </div></div>`, { t: 'Complexity moves. It does not vanish.', s: 'What an elaborate setup really does to your work', src: 'After Larry Tesler’s law of conservation of complexity.' }),
  },
  {
    slug: 'the-system-is-not-the-work', name: 'thoreau',
    alt: 'A quote card: “The cost of a thing is the amount of what I will call life which is required to be exchanged for it, immediately or in the long run.” Henry David Thoreau, Walden, 1854.',
    html: page(`<div style="max-width:1200px;margin:10px auto 0;border-left:6px solid var(--g);padding:8px 0 8px 56px">
      <div style="font-size:64px;line-height:1.28;font-style:italic;font-weight:330">“The cost of a thing is the amount of what I will call <span style="color:var(--g)">life</span> which is required to be exchanged for it, immediately or in the long run.”</div>
      <div class="k m" style="margin-top:36px;font-size:22px">Henry David Thoreau · Walden · 1854</div></div>`, { t: '', foot: 'The price of a productivity app is not the subscription. It is the hours it asks for.' }),
  },

  // 9. The Light Switch Wins
  {
    slug: 'the-light-switch-wins', name: 'the-gulf',
    alt: 'Two flows from wanting light to getting it. The light switch takes one step: press the switch. The smart home takes five: unlock the phone, open the app, check it is the right home, find the room, and hope the hub is awake. The second flow is drawn with a dashed red border.',
    html: page(`<div class="col" style="gap:40px">
      <div class="card g"><div class="k">The light switch · 1 step</div><div style="margin-top:20px">${flow(['Want light', 'Press the thing on the wall', 'Light'])}</div></div>
      <div class="card r"><div class="k r">The smart home · 5 steps</div><div style="margin-top:20px">${flow(['Want light', 'Unlock phone', 'Open the app', 'Right home?', 'Find the room', 'Hope the hub’s awake', 'Light'], 'var(--r)', 21)}</div></div>
    </div>`, { t: 'The gulf of execution', s: 'The distance between what you want and what you have to do to get it', src: 'After Don Norman, The Design of Everyday Things.' }),
  },
  {
    slug: 'the-light-switch-wins', name: 'what-lasts',
    alt: 'A timeline from 1880 to 2026. The wall light switch runs the whole way and is still working. The Revolv smart home hub runs from 2013 to 2016, when its servers were switched off. Insteon runs from 2005 to 2022, when it shut down with almost no warning.',
    html: page((() => {
      const from = 1880, to = 2026, W = 1340, x = (yr) => ((yr - from) / (to - from)) * W;
      const bar = (a, b, c, label, sub, dashed) => `<div style="position:relative;height:96px;margin-top:18px">
        <div style="position:absolute;left:${x(a)}px;width:${Math.max(14, x(b) - x(a))}px;top:24px;height:40px;border-radius:8px;${dashed ? `border:3px dashed ${c};` : `background:${c};`}"></div>
        <div style="position:absolute;left:${Math.min(x(a), W - 560)}px;top:-10px;font-size:26px;font-weight:600;white-space:nowrap">${label} <span class="mono" style="font-size:19px;color:var(--mid);font-weight:400">${sub}</span></div></div>`;
      return `<div style="width:${W}px;margin:0 auto">
        ${bar(1884, 2026, 'var(--g)', 'Wall light switch', '1880s → still working')}
        ${bar(2005, 2022, 'var(--r)', 'Insteon', '2005 → servers off, April 2022')}
        ${bar(2013, 2016, 'var(--r)', 'Revolv hub', '2013 → switched off by Nest, 2016')}
        <div style="position:relative;height:40px;margin-top:20px;border-top:1px solid var(--line)">${[1880, 1920, 1960, 2000, 2026].map((y) => `<div class="mono" style="position:absolute;left:${x(y) - 30}px;top:10px;font-size:19px;color:var(--mid)">${y}</div>`).join('')}</div></div>`;
    })(), { t: 'What lasts', s: 'The Lindy effect, in your hallway', foot: 'The longer something has already lasted, the longer it is likely to keep lasting.', src: 'Lindy effect as popularised by Nassim Nicholas Taleb, Antifragile (2012).' }),
  },

  // 10. Your Network Has a Landlord
  {
    slug: 'your-network-has-a-landlord', name: 'wheel-and-mesh',
    alt: 'Two network shapes. Left, the wheel: six devices all connected to one central server in red, labelled single point of failure. Right, the mesh: the same six devices connected directly to each other in green, with no centre.',
    html: page((() => {
      const R = 200, cx = 260, cy = 250;
      const pts = Array.from({ length: 6 }, (_, i) => [cx + R * Math.cos((i * Math.PI) / 3 - Math.PI / 2), cy + R * Math.sin((i * Math.PI) / 3 - Math.PI / 2)]);
      const labels = ['phone', 'laptop', 'tablet', 'desktop', 'Deck', 'TV'];
      const nodes = (c) => pts.map(([a, b], i) => `<circle cx="${a}" cy="${b}" r="44" fill="#141414" stroke="${c}" stroke-width="4"/><text x="${a}" y="${b + 6}" fill="#ececec" font-size="16" text-anchor="middle">${labels[i]}</text>`).join('');
      const wheel = `<svg width="520" height="500">${pts.map(([a, b]) => `<line x1="${cx}" y1="${cy}" x2="${a}" y2="${b}" stroke="#f87171" stroke-width="3"/>`).join('')}<circle cx="${cx}" cy="${cy}" r="58" fill="#141414" stroke="#f87171" stroke-width="5" stroke-dasharray="8 6"/><text x="${cx}" y="${cy + 7}" fill="#f87171" font-size="20" text-anchor="middle">server</text>${nodes('rgba(255,255,255,.3)')}</svg>`;
      let edges = '';
      for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) edges += `<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[j][0]}" y2="${pts[j][1]}" stroke="#3ecf8e" stroke-width="2.5" opacity=".75"/>`;
      const mesh = `<svg width="520" height="500">${edges}${nodes('#3ecf8e')}</svg>`;
      return `<div class="row" style="justify-content:center;gap:80px">
        <div class="card r" style="text-align:center"><div class="k r">The wheel</div>${wheel}<div class="d">Everything through the middle. One single point of failure.</div></div>
        <div class="card g" style="text-align:center"><div class="k">The mesh</div>${mesh}<div class="d">Devices talk directly. No centre to fail.</div></div></div>`;
    })(), { t: 'Every network has a shape', s: 'And the shape decides who is in charge', foot: 'The original internet was a mesh. The cloud turned it back into a wheel.' }),
  },
  {
    slug: 'your-network-has-a-landlord', name: 'who-does-the-introductions',
    alt: 'How a managed mesh VPN works. A coordination server at the top, drawn in lavender, hands out keys and tells devices where each other are, shown with dashed lines. Below, the devices send their actual traffic directly to each other over encrypted WireGuard links, shown in green, without passing through the coordinator.',
    html: page(`<div style="position:relative;height:640px">
      <div class="card p" style="position:absolute;left:50%;transform:translateX(-50%);top:0;width:560px;text-align:center"><div class="k p">Control plane</div><div class="h">Coordination server</div><div class="d">Hands out keys. Says who is where. Run by the company, or by you.</div></div>
      <svg width="1472" height="640" style="position:absolute;left:0;top:0">
        ${[260, 736, 1212].map((xx) => `<line x1="736" y1="190" x2="${xx}" y2="380" stroke="#c4b5fd" stroke-width="3" stroke-dasharray="10 9"/>`).join('')}
        <line x1="330" y1="470" x2="666" y2="470" stroke="#3ecf8e" stroke-width="6"/><line x1="806" y1="470" x2="1142" y2="470" stroke="#3ecf8e" stroke-width="6"/>
        <path d="M 260 482 Q 736 640 1212 482" fill="none" stroke="#3ecf8e" stroke-width="6"/>
        <text x="736" y="598" fill="#3ecf8e" font-size="20" text-anchor="middle">direct, encrypted</text>
        <text x="498" y="455" fill="#3ecf8e" font-size="20" text-anchor="middle">direct, encrypted</text><text x="974" y="455" fill="#3ecf8e" font-size="20" text-anchor="middle">direct, encrypted</text>
        <text x="470" y="252" fill="#c4b5fd" font-size="20" text-anchor="end">introductions only</text></svg>
      ${[['Phone', 260], ['Laptop', 736], ['Home server', 1212]].map(([l, xx]) => `<div class="card g" style="position:absolute;top:410px;left:${xx - 130}px;width:260px;text-align:center;padding:18px"><div style="font-size:28px;font-weight:600">${l}</div></div>`).join('')}
    </div>`, { t: 'Who does the introductions?', s: 'Your traffic goes direct. Your network still depends on whoever runs the coordinator.', foot: 'Host the coordinator yourself and you hold the keys. Run it on one box and you are the landlord with no spare.' }),
  },

  // 11. The Pocket Terminal
  {
    slug: 'the-pocket-terminal', name: 'the-job-changed',
    alt: 'How the work changed. Before: typing, which needs a big keyboard, a big screen and a tuned environment. Now, with an agent: describe by voice, read on a seven-inch screen, approve with a button. Each new job is mapped to a part of the Steam Deck.',
    html: page(`<div class="row" style="align-items:stretch">
      <div class="card" style="flex:0 0 430px"><div class="k m">Before</div><div class="h">Typing</div><div class="d" style="margin-top:16px">A proper keyboard.<br>A big screen.<br>An environment tuned over years.</div></div>
      <span class="arrow" style="font-size:60px">→</span>
      <div class="row" style="flex:1;gap:20px">${[
        ['Describe', 'hold a button, talk', 'voice in'],
        ['Read', 'every proposed change', '7-inch screen'],
        ['Approve', 'or say no', 'one button'],
      ].map(([h, d, deck]) => `<div class="card g" style="flex:1;text-align:center"><div class="h">${h}</div><div class="d">${d}</div><div class="k" style="margin-top:20px;font-size:18px">${deck}</div></div>`).join('')}</div>
    </div>`, { t: 'The job changed', s: 'With an agent doing the typing, the human explains, reads and decides', foot: 'The work moved from my fingers to my judgement, and judgement fits in your hands.' }),
  },
  {
    slug: 'the-pocket-terminal', name: 'controller-map',
    alt: 'A stylised handheld console with a terminal on its screen and labels around it: hold to talk sends voice to the session, A is enter and approve, B is escape, the right stick scrolls, a back button opens the on-screen keyboard, and the session survives sleep.',
    html: page(`<div style="position:relative;width:1300px;height:600px;margin:0 auto">
      <div style="position:absolute;left:230px;top:120px;width:840px;height:360px;border-radius:120px;background:#161616;border:3px solid rgba(255,255,255,.22)"></div>
      <div style="position:absolute;left:420px;top:165px;width:460px;height:270px;border-radius:10px;background:#050505;border:3px solid var(--g);padding:18px;font-family:M;font-size:17px;line-height:1.6;color:var(--g)">› add a retry to the sync job<br><span style="color:#8a8a8a">● reading sync.py…</span><br><span style="color:#ececec">proposed change: 3 lines</span><br><span style="color:var(--p)">approve? (A) · reject (B)</span></div>
      <svg width="1300" height="600" style="position:absolute;left:0;top:0">
        <circle cx="330" cy="240" r="34" fill="#222" stroke="#555" stroke-width="3"/><circle cx="970" cy="360" r="34" fill="#222" stroke="#555" stroke-width="3"/>
        ${[[960, 220, 'A'], [1010, 270, 'B'], [910, 270, 'X'], [960, 170, 'Y']].map(([a, b, l]) => `<circle cx="${a}" cy="${b}" r="20" fill="#222" stroke="${l === 'A' ? '#3ecf8e' : l === 'B' ? '#f87171' : '#555'}" stroke-width="3"/><text x="${a}" y="${b + 7}" fill="#ececec" font-size="18" text-anchor="middle">${l}</text>`).join('')}
        <line x1="296" y1="240" x2="150" y2="150" stroke="#8a8a8a" stroke-width="2"/><line x1="985" y1="220" x2="1150" y2="140" stroke="#3ecf8e" stroke-width="2"/>
        <line x1="1030" y1="270" x2="1150" y2="300" stroke="#f87171" stroke-width="2"/><line x1="1004" y1="360" x2="1150" y2="440" stroke="#8a8a8a" stroke-width="2"/>
        <line x1="650" y1="480" x2="650" y2="540" stroke="#c4b5fd" stroke-width="2"/></svg>
      <div style="position:absolute;left:0;top:96px;width:260px;text-align:right"><div class="k m" style="font-size:18px">Left stick click</div><div style="font-size:24px">hold to talk</div></div>
      <div style="position:absolute;left:1160px;top:112px;width:160px"><div class="k" style="font-size:18px">A</div><div style="font-size:24px">enter · approve</div></div>
      <div style="position:absolute;left:1160px;top:276px;width:160px"><div class="k r" style="font-size:18px">B</div><div style="font-size:24px">escape</div></div>
      <div style="position:absolute;left:1160px;top:416px;width:160px"><div class="k m" style="font-size:18px">Right stick</div><div style="font-size:24px">scroll</div></div>
      <div style="position:absolute;left:470px;top:548px;width:360px;text-align:center"><div class="k p" style="font-size:18px">Session</div><div style="font-size:24px">survives sleep</div></div>
    </div>`, { t: 'A games console as a terminal', s: 'Everything a coding session needs, in two hands', src: 'Stylised. Button mapping simplified.' }),
  },
];

const only = process.argv.slice(2);
const todo = only.length ? FIGS.filter((f) => only.includes(f.slug)) : FIGS;
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
for (const f of todo) {
  await tab.setContent(f.html);
  await tab.evaluate(() => document.fonts.ready);
  const png = await tab.locator('#fig').screenshot();
  const out = join(root, 'src/assets/blog', f.slug, `${f.name}.webp`);
  mkdirSync(dirname(out), { recursive: true });
  await sharp(png).webp({ quality: 84 }).toFile(out);
  console.log(`  ✓ ${f.slug}/${f.name}`);
}
await browser.close();

export const figures = FIGS.map(({ slug, name, alt }) => ({ slug, name, alt }));
