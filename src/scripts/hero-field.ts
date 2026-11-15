// Hero graphic: a sheet of dots moves like loose fabric, pulls flat into an
// ordered grid, holds, and lets go again. Canvas 2D, no dependencies. It stops
// when off screen and draws one still frame for visitors who ask for reduced
// motion.

const canvas = document.getElementById('hero-field') as HTMLCanvasElement | null;
const ctx = canvas?.getContext('2d');

if (canvas && ctx) {
  const COLS = 24;
  const ROWS = 13;
  const LOOSE = [196, 181, 253]; // --purple
  const SET = [62, 207, 142]; // --green

  // Timeline, in seconds.
  const DRIFT = 4;
  const GATHER = 2.4;
  const HOLD = 3.8;
  const RELEASE = 2.4;
  const CYCLE = DRIFT + GATHER + HOLD + RELEASE;
  const TRAVEL = 1.3; // how long one dot takes to settle
  const SPREAD = GATHER - TRAVEL; // stagger across the field

  // Small seeded generator so the dim dots are the same on every visit.
  let seed = 7;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // The sheet settles as a sweep from one corner, not all at once.
  const dots = Array.from({ length: COLS * ROWS }, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return { col, row, blink: rand(), delay: ((col + row * 0.6) / (COLS + ROWS * 0.6)) * SPREAD };
  });

  let w = 0;
  let h = 0;
  let dpr = 1;
  const resize = () => {
    const box = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = box.width;
    h = box.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  };

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

  const pointer = { x: -999, y: -999 };

  const draw = (time: number) => {
    const t = time % CYCLE;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const pitch = Math.min(w / (COLS + 1), h / (ROWS + 1));
    const ox = (w - pitch * (COLS - 1)) / 2;
    const oy = (h - pitch * (ROWS - 1)) / 2;

    for (const d of dots) {
      // 0 = moving freely, 1 = set in the grid
      let p: number;
      if (t < DRIFT) p = 0;
      else if (t < DRIFT + GATHER) p = ease(clamp01((t - DRIFT - d.delay) / TRAVEL));
      else if (t < DRIFT + GATHER + HOLD) p = 1;
      else p = 1 - ease(clamp01((t - DRIFT - GATHER - HOLD - (SPREAD - d.delay) * 0.8) / TRAVEL));

      // Two crossing swells give the sheet its movement; `lift` is how high
      // this dot is riding, from -1 to 1.
      const a = Math.sin(time * 1.05 + d.col * 0.4 + d.row * 0.22);
      const b = Math.sin(time * 0.7 - d.col * 0.17 + d.row * 0.75);
      const lift = (a * 0.65 + b * 0.35) * (1 - p);
      const gx = ox + d.col * pitch;
      const gy = oy + d.row * pitch;
      let x = gx + Math.cos(time * 0.85 + d.row * 0.5 + d.col * 0.12) * pitch * 0.42 * (1 - p);
      let y = gy - lift * pitch * 1.15;

      // The pointer nudges nearby dots aside.
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 70 && dist > 0.01) {
        const push = (1 - dist / 70) ** 2 * 14;
        x += (dx / dist) * push;
        y += (dy / dist) * push;
      }

      // Loose: dots swell and brighten as they rise. Set: a pulse runs
      // through the rows, with the odd dot staying dim, like activity lights.
      const base = Math.max(1.1, pitch * 0.1);
      const looseAlpha = 0.28 + 0.55 * ((lift + 1) / 2);
      const pulse = 0.5 + 0.5 * Math.sin(time * 1.6 - d.col * 0.32 - d.row * 0.9);
      const setAlpha = d.blink < 0.12 ? 0.22 : 0.42 + 0.5 * pulse;
      const alpha = looseAlpha + (setAlpha - looseAlpha) * p;
      const radius = base * (1 + 0.75 * lift);
      const c = LOOSE.map((v, i) => Math.round(v + (SET[i] - v) * p));

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha.toFixed(3)})`;
      ctx.fill();
    }
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let raf = 0;
  const still = DRIFT + GATHER + 1; // a frame with the grid set
  const frame = (ms: number) => {
    draw(ms / 1000);
    raf = visible && !reduceMotion.matches ? requestAnimationFrame(frame) : 0;
  };
  const start = () => {
    cancelAnimationFrame(raf);
    if (reduceMotion.matches) draw(still);
    else if (visible) raf = requestAnimationFrame(frame);
  };

  new ResizeObserver(() => {
    resize();
    if (reduceMotion.matches || !visible) draw(reduceMotion.matches ? still : 0);
  }).observe(canvas);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    start();
  }).observe(canvas);
  reduceMotion.addEventListener('change', start);

  canvas.addEventListener('pointermove', (e) => {
    const box = canvas.getBoundingClientRect();
    pointer.x = e.clientX - box.left;
    pointer.y = e.clientY - box.top;
  });
  canvas.addEventListener('pointerleave', () => {
    pointer.x = pointer.y = -999;
  });
}
