// Build one self-contained HTML document for a deck. The same markup drives both outputs:
//   carousel: each scene is shown on its own at its finished state (1080x1350 stills)
//   reel:     scenes are stacked on a timeline and every animation is seeked per frame (1080x1920 video)

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { ROOT } from './post.mjs';
import { plain } from './post.mjs';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const pad = (n) => String(n).padStart(2, '0');
const fu = (p) => pathToFileURL(p).href;
const font = (pkg, file) => fu(join(ROOT, 'node_modules', pkg, 'files', file));

export const SIZES = { carousel: { w: 1080, h: 1350 }, reel: { w: 1080, h: 1920 } };

/** Words wrapped for staggered entrance. */
function words(text, start = 0, step = 55, cls = 'wd') {
  let i = 0;
  return esc(plain(text))
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `<span class="${cls}" style="--d:${start + step * i++}ms">${w}</span>`)
    .join(' ');
}
const d = (ms) => `style="--d:${ms}ms"`;
const count = (s) => plain(s ?? '').split(/\s+/).filter(Boolean).length;

const headSize = (t) => {
  const n = plain(t).length;
  return n <= 16 ? 112 : n <= 26 ? 96 : n <= 38 ? 84 : 72;
};
const titleSize = (t) => {
  const n = t.length;
  return n <= 22 ? 156 : n <= 34 ? 136 : n <= 46 ? 120 : 98;
};

const ICON = {
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M21 3 3 10.5l6.5 2.5L12 20z"/><path d="M21 3 9.5 13"/></svg>',
  follow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
  arrow: '<svg viewBox="0 0 40 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 8h36M30 1l7 7-7 7"/></svg>',
};

/** Seconds a scene stays up in the reel, from how much there is to read. */
function duration(s) {
  const w = count([s.body, s.text, s.heading].join(' '));
  const n = s.items?.length ?? 0;
  switch (s.type) {
    case 'cover': return 3.4;
    case 'cta': return 3.4;
    case 'quote': return Math.min(5, 2.2 + w * 0.12);
    case 'list': case 'steps': return 1.5 + n * 0.68;
    default: return Math.min(5.2, 1.9 + w * 0.085);
  }
}

function sceneBody(s, i, n, imgFits) {
  switch (s.type) {
    case 'cover': {
      const ts = titleSize(s.title);
      const lead = s.lead ? words(s.lead, 120, 70) : '';
      const emStart = 120 + 70 * count(s.lead);
      return `
      <div class="main main-cover">
        <div class="kicker a" ${d(0)}><i class="pulse"></i>New post<b>/</b>${esc(s.kicker)}</div>
        <h1 class="title" style="--ts:${ts}px">${lead}${lead ? ' ' : ''}<em>${words(s.em, emStart, 70)}</em>${s.tail ? ' ' + words(s.tail, emStart + 70 * count(s.em), 70) : ''}</h1>
        <p class="sub a" ${d(emStart + 70 * count(s.em) + 160)}>${rich(s.sub)}</p>
        ${s.image ? `<div class="card cover-card a" ${d(emStart + 70 * count(s.em) + 360)}><img class="kb" src="${fu(s.image)}" alt="" style="object-position:${esc(s.focus || '50% 50%')}"></div>` : ''}
      </div>`;
    }
    case 'text': {
      const hs = headSize(s.heading);
      const img = s.image
        ? `<div class="card a ${imgFits.get(s.image) ?? 'cover'}" ${d(420 + 55 * count(s.heading))}><img src="${fu(s.image)}" alt=""></div>`
        : '';
      return `
      <div class="main ${s.image ? 'has-img' : 'center'}">
        <div class="eyebrow a" ${d(0)}>${pad(i)}</div>
        <h2 class="h" style="--hs:${hs}px">${words(s.heading, 80)}</h2>
        <div class="rule a" ${d(260)}></div>
        <p class="body a ${!s.image && plain(s.body).length < 170 ? 'xl' : ''}" ${d(340 + 55 * count(s.heading))}>${rich(s.body)}</p>
        ${img}
      </div>`;
    }
    case 'list': {
      const hs = headSize(s.heading);
      const rows = s.items
        .map(
          (it, k) => `
        <div class="li a" ${d(420 + k * 150)}>
          <i class="tick"></i>
          <div><div class="lead">${rich(it.lead)}</div>${it.text ? `<div class="txt">${rich(it.text)}</div>` : ''}</div>
        </div>`,
        )
        .join('');
      return `
      <div class="main center">
        <div class="eyebrow a" ${d(0)}>${pad(i)}</div>
        <h2 class="h" style="--hs:${hs}px">${words(s.heading, 80)}</h2>
        <div class="rule a" ${d(260)}></div>
        <div class="rows">${rows}</div>
      </div>`;
    }
    case 'steps': {
      const hs = headSize(s.heading);
      const rows = s.items
        .map(
          (it, k) => `
        <div class="st a" ${d(420 + k * 190)}>
          <span class="badge pop" ${d(480 + k * 190)}>${it.n ?? k + 1}</span>
          <div><div class="lead">${rich(it.title)}</div>${it.text ? `<div class="txt">${rich(it.text)}</div>` : ''}</div>
        </div>`,
        )
        .join('');
      return `
      <div class="main center">
        <div class="eyebrow a" ${d(0)}>${pad(i)}</div>
        <h2 class="h" style="--hs:${hs}px">${words(s.heading, 80)}</h2>
        <div class="rule a" ${d(260)}></div>
        <div class="rows steps">${rows}</div>
      </div>`;
    }
    case 'quote':
      return `
      <div class="main center quote">
        <div class="qmark a" ${d(0)}>&ldquo;</div>
        <p class="qtext">${words(s.text, 160, 60)}</p>
        <div class="rule a" ${d(160 + 60 * count(s.text) + 200)}></div>
        ${s.heading ? `<div class="qwho a" ${d(160 + 60 * count(s.text) + 320)}>${esc(s.heading)}</div>` : ''}
      </div>`;
    case 'cta':
      return `
      <div class="main center cta">
        <div class="kicker a" ${d(0)}><i class="pulse"></i>That&rsquo;s the post</div>
        <h2 class="h big" style="--hs:112px">${words('Read the', 80)} <em>${words('full post', 220)}</em></h2>
        <p class="ctitle a" ${d(520)}>${esc(s.title)}</p>
        <div class="url a" ${d(680)}><b>${esc(s.url.split('/')[0])}</b><span>link in bio</span></div>
        <div class="actions">
          <div class="act a" ${d(860)}>${ICON.save}<span>Save it</span></div>
          <div class="act a" ${d(1000)}>${ICON.send}<span>Send it</span></div>
          <div class="act a" ${d(1140)}>${ICON.follow}<span>Follow</span></div>
        </div>
        <div class="wordmark a" ${d(1320)}>rendoire<i>.</i></div>
      </div>`;
  }
  return '';
}

function flowPath(n, w, h) {
  const pts = [];
  for (let x = 0; x <= w * n; x += 60) {
    const y = h - 50 + 13 * Math.sin(x / 250 + 0.6) + 5 * Math.sin(x / 85 + 1.7);
    pts.push(`${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

export function buildHtml(deck, format, imgFits = new Map()) {
  const { w, h } = SIZES[format];
  const slides = deck.slides;
  const n = slides.length;
  const durs = slides.map(duration);
  const starts = [];
  let t = 0;
  for (const dur of durs) {
    starts.push(t);
    t += dur;
  }
  const total = t + 0.4;
  const reel = format === 'reel';

  const scenes = slides
    .map((s, i) => {
      const last = i === n - 1;
      const flow = reel
        ? ''
        : `<svg class="flow" style="left:${-i * w}px" width="${w * n}" height="${h}" viewBox="0 0 ${w * n} ${h}">
            <defs><linearGradient id="g${i}" x1="0" x2="1"><stop offset="0" stop-color="#3ecf8e"/><stop offset="1" stop-color="#c4b5fd"/></linearGradient></defs>
            <path d="${flowPath(n, w, h)}" fill="none" stroke="url(#g${i})" stroke-width="3" opacity=".55"/>
            <path d="${flowPath(n, w, h)}" fill="none" stroke="url(#g${i})" stroke-width="12" opacity=".10" transform="translate(0 0)"/>
          </svg>`;
      return `
    <section class="scene t-${s.type}" data-i="${i}">
      <div class="bg"><div class="orb o1"></div><div class="orb o2"></div><div class="grid"></div>${flow}</div>
      <div class="frame"></div>
      <div class="top"><span class="brand"><i class="dot"></i>rendoire.com</span><span class="count">${pad(i + 1)}<em>/</em>${pad(n)}</span></div>
      ${sceneBody(s, i, n, imgFits)}
      ${reel ? '' : `<div class="bottom"><span class="mark">rendoire<i>.</i></span>${last ? '<span class="handle">@rendoire</span>' : `<span class="swipe">swipe ${ICON.arrow}</span>`}</div>`}
    </section>`;
    })
    .join('\n');

  const css = `
@font-face{font-family:'Fraunces Variable';font-style:normal;font-weight:100 900;font-display:block;src:url(${font('@fontsource-variable/fraunces', 'fraunces-latin-wght-normal.woff2')}) format('woff2')}
@font-face{font-family:'Fraunces Variable';font-style:italic;font-weight:100 900;font-display:block;src:url(${font('@fontsource-variable/fraunces', 'fraunces-latin-wght-italic.woff2')}) format('woff2')}
@font-face{font-family:'Geist Variable';font-style:normal;font-weight:100 900;font-display:block;src:url(${font('@fontsource-variable/geist', 'geist-latin-wght-normal.woff2')}) format('woff2')}
@font-face{font-family:'IBM Plex Mono';font-weight:400;font-display:block;src:url(${font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2')}) format('woff2')}
@font-face{font-family:'IBM Plex Mono';font-weight:500;font-display:block;src:url(${font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff2')}) format('woff2')}
:root{--bg:#0a0a0a;--text:#ececec;--muted:#b0b0b0;--mid:#8f8f8f;--green:#3ecf8e;--purple:#c4b5fd;--line:rgba(255,255,255,.12);
  --fd:'Fraunces Variable',Georgia,serif;--fb:'Geist Variable',system-ui,sans-serif;--fm:'IBM Plex Mono',ui-monospace,monospace;
  --W:${w}px;--H:${h}px;--px:88px}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:var(--W);height:var(--H);background:var(--bg);overflow:hidden}
body{font-family:var(--fb);color:var(--text);-webkit-font-smoothing:antialiased;position:relative}
.scene{position:absolute;inset:0;overflow:hidden;display:none;--k:1;background:var(--bg)}
.scene.on{display:block}
.bg,.frame{position:absolute;inset:0;pointer-events:none}
.orb{position:absolute;border-radius:50%;filter:blur(90px)}
.o1{width:980px;height:780px;left:-300px;top:-260px;background:rgba(62,207,142,.17)}
.o2{width:900px;height:800px;right:-340px;bottom:-300px;background:rgba(196,181,253,.11)}
.grid{position:absolute;inset:0;background:radial-gradient(rgba(255,255,255,.07) 1.6px,transparent 1.8px) 0 0/54px 54px;
  -webkit-mask-image:radial-gradient(ellipse at 30% 20%,#000 0%,transparent 72%);mask-image:radial-gradient(ellipse at 30% 20%,#000 0%,transparent 72%)}
.flow{position:absolute;top:0}
.frame{inset:28px;border:1px solid rgba(255,255,255,.08);border-radius:30px}
.top,.bottom{position:absolute;left:var(--px);right:var(--px);display:flex;justify-content:space-between;align-items:center;font-family:var(--fm);font-size:25px;letter-spacing:.05em;color:var(--mid);z-index:3}
.top{top:84px}.bottom{bottom:84px}
.brand{display:inline-flex;align-items:center;gap:16px}
.dot{width:13px;height:13px;border-radius:50%;background:var(--green);box-shadow:0 0 18px var(--green);animation:pulse 2s ease-in-out infinite}
.count{color:var(--muted)}.count em{font-style:normal;color:var(--mid);padding:0 .3em}
.mark{font-family:var(--fd);font-weight:600;font-size:34px;letter-spacing:-.01em;color:var(--text)}
.mark i,.wordmark i{font-style:normal;color:var(--purple)}
.swipe{display:inline-flex;align-items:center;gap:16px;color:var(--green)}
.swipe svg{width:56px;height:22px;animation:nudge 1.6s ease-in-out infinite}
.handle{color:var(--green)}
.main{position:absolute;left:var(--px);right:var(--px);top:170px;bottom:170px;display:flex;flex-direction:column;z-index:2}
.main.center{justify-content:center}
.a,.wd{animation:rise .85s cubic-bezier(.16,1,.3,1) both;animation-delay:var(--d,0ms)}
.wd{display:inline-block}
.pop{animation:pop .6s cubic-bezier(.2,1.4,.4,1) both;animation-delay:var(--d,0ms)}
.kicker{font-family:var(--fm);font-weight:500;font-size:27px;letter-spacing:.16em;text-transform:uppercase;color:var(--green);display:flex;align-items:center;gap:18px;margin-bottom:calc(34px*var(--k))}
.kicker b{color:var(--mid);font-weight:400}
.pulse{width:14px;height:14px;border-radius:50%;background:var(--green);box-shadow:0 0 22px var(--green);animation:pulse 1.4s ease-in-out infinite}
.eyebrow{font-family:var(--fm);font-weight:500;font-size:calc(28px*var(--k));letter-spacing:.14em;color:var(--green);margin-bottom:calc(22px*var(--k))}
.eyebrow::before{content:'';display:inline-block;width:46px;height:2px;background:var(--green);vertical-align:middle;margin-right:18px}
.title{font-family:var(--fd);font-weight:600;font-size:calc(var(--ts)*var(--k));line-height:.98;letter-spacing:-.025em;text-wrap:balance}
.title em,.h em{font-style:italic;font-weight:400;color:var(--purple)}
.sub{margin-top:calc(34px*var(--k));font-size:calc(38px*var(--k));line-height:1.38;color:var(--muted);max-width:900px}
.card{margin-top:calc(38px*var(--k));border-radius:30px;overflow:hidden;border:1px solid var(--line);background:#101010;box-shadow:0 30px 80px rgba(0,0,0,.55)}
.card img{display:block;width:100%;height:100%;object-fit:cover}
.card.contain img{object-fit:contain}
.cover-card{flex:none;height:calc(400px*var(--k))}
.fmt-reel .cover-card{height:calc(560px*var(--k))}
.h{font-family:var(--fd);font-weight:600;font-size:calc(var(--hs)*var(--k));line-height:1.0;letter-spacing:-.022em;text-wrap:balance}
.rule{width:96px;height:4px;border-radius:2px;background:var(--green);margin:calc(34px*var(--k)) 0;transform-origin:left;animation:draw .7s cubic-bezier(.16,1,.3,1) both;animation-delay:var(--d,0ms)}
.body{font-size:calc(46px*var(--k));line-height:1.36;color:var(--muted);max-width:920px}
  .body.xl{font-size:calc(56px*var(--k));line-height:1.3;color:#cfcfcf}
strong{color:#fff;font-weight:600;background:linear-gradient(transparent 64%,rgba(62,207,142,.32) 64%)}
.has-img .card{flex:1;min-height:0}
.rows{display:flex;flex-direction:column}
.li,.st{display:flex;gap:calc(30px*var(--k));align-items:flex-start;padding:calc(26px*var(--k)) 0;border-top:1px solid var(--line)}
.li:last-child,.st:last-child{border-bottom:1px solid var(--line)}
.tick{flex:none;width:calc(18px*var(--k));height:calc(18px*var(--k));margin-top:calc(22px*var(--k));border:2px solid var(--green);border-radius:4px;transform:rotate(45deg);box-shadow:0 0 14px rgba(62,207,142,.45)}
.lead{font-family:var(--fd);font-weight:600;font-size:calc(50px*var(--k));line-height:1.1;letter-spacing:-.015em;color:var(--text)}
.txt{margin-top:calc(10px*var(--k));font-size:calc(33px*var(--k));line-height:1.36;color:var(--muted)}
.badge{flex:none;width:calc(88px*var(--k));height:calc(88px*var(--k));border-radius:50%;border:2px solid var(--green);display:grid;place-items:center;font-family:var(--fm);font-weight:500;font-size:calc(38px*var(--k));color:var(--green);box-shadow:0 0 26px rgba(62,207,142,.25) inset}
.qmark{font-family:var(--fd);font-size:420px;line-height:.7;color:var(--purple);opacity:.35;height:230px}
.qtext{font-family:var(--fd);font-style:italic;font-weight:400;font-size:calc(80px*var(--k));line-height:1.12;letter-spacing:-.015em;text-wrap:balance}
.qwho{font-family:var(--fm);font-size:27px;letter-spacing:.14em;text-transform:uppercase;color:var(--mid)}
.cta .big{font-size:calc(var(--hs)*var(--k))}
.ctitle{margin-top:calc(30px*var(--k));font-size:calc(36px*var(--k));line-height:1.3;color:var(--muted);max-width:860px}
.url{margin-top:calc(46px*var(--k));display:inline-flex;align-self:flex-start;align-items:center;gap:26px;padding:22px 34px;border:1.5px solid var(--green);border-radius:999px;background:rgba(62,207,142,.08)}
.url b{font-family:var(--fm);font-weight:500;font-size:40px;color:var(--green);letter-spacing:.02em}
.url span{font-family:var(--fm);font-size:25px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);padding-left:26px;border-left:1px solid var(--line)}
.actions{display:flex;gap:22px;margin-top:calc(44px*var(--k))}
.act{flex:1;display:flex;flex-direction:column;align-items:center;gap:16px;padding:30px 10px;border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.03);color:var(--text)}
.act svg{width:54px;height:54px;color:var(--green)}
.act span{font-family:var(--fm);font-size:25px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.wordmark{margin-top:calc(56px*var(--k));font-family:var(--fd);font-weight:600;font-size:96px;letter-spacing:-.03em}
.fmt-reel .top{top:250px}
.fmt-reel .main{top:350px;bottom:400px;right:150px}
.fmt-reel .scene{animation:wipe .65s cubic-bezier(.7,0,.2,1) both}
.fmt-reel .scene:first-child{animation:none}
.fmt-reel .kb{animation:kb 5s linear both}
.fmt-reel .o1{animation:drift 9s ease-in-out infinite}
.fmt-reel .o2{animation:drift 11s ease-in-out infinite reverse}
@keyframes rise{from{opacity:0;transform:translateY(46px);filter:blur(10px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes pop{from{opacity:0;transform:scale(.55)}to{opacity:1;transform:scale(1)}}
@keyframes draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes wipe{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(12px)}}
@keyframes kb{from{transform:scale(1)}to{transform:scale(1.14)}}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(70px,50px)}}
`;

  const js = `
const FORMAT=${JSON.stringify(format)};
const STARTS=${JSON.stringify(starts)};
const DURS=${JSON.stringify(durs)};
const TOTAL=${total};
const scenes=[...document.querySelectorAll('.scene')];
function fit(el){
  const main=el.querySelector('.main');
  let k=FORMAT==='reel'?1.32:1; el.style.setProperty('--k',k);
  while(main.scrollHeight>main.clientHeight+1 && k>0.6){k-=0.03;el.style.setProperty('--k',k.toFixed(2));}
}
function seek(el,ms){ el.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=ms;}); }
window.prepare=async()=>{ await document.fonts.ready; await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));
  scenes.forEach(s=>{s.classList.add('on'); seek(s,5000); fit(s); s.classList.remove('on');}); return {starts:STARTS,total:TOTAL}; };
// carousel: show one scene at its finished state
window.showStill=(i)=>{ scenes.forEach((s,k)=>s.classList.toggle('on',k===i)); seek(scenes[i],3200); };
// reel: paint the whole timeline at time T (seconds)
window.frame=(T)=>{
  scenes.forEach((s,i)=>{
    const local=T-STARTS[i];
    const covered=i<scenes.length-1 && T>STARTS[i+1]+0.7;
    const on=local>=0 && !covered;
    s.classList.toggle('on',on);
    if(on) seek(s,Math.max(0,local*1000));
  });
};
`;

  return {
    html: `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body class="fmt-${format}">${scenes}<script>${js}</script></body></html>`,
    starts,
    durs,
    total,
  };
}
