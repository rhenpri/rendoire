// Savings calculator: reads the form, works out the two cumulative cost lines
// and draws them. No dependencies; the chart is plain SVG.

const HORIZON = 60;
const NS = 'http://www.w3.org/2000/svg';
const STORE = 'savings-inputs-v1';

interface Model {
  monthlySubs: number; // what the ticked subscriptions cost per month
  monthlyOwn: number; // running costs + media per month
  hardware: number; // one-off
}

const root = document.getElementById('savings');
const form = document.getElementById('sv-form') as HTMLFormElement | null;
const chartEl = document.getElementById('sv-chart');
const tip = document.getElementById('sv-tip');
const tableBody = document.getElementById('sv-table-body');

if (root && form && chartEl && tip && tableBody) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
  const num = (el: HTMLInputElement) => {
    const v = parseFloat(el.value);
    return Number.isFinite(v) && v > 0 ? v : 0;
  };

  const out = (id: string) => document.getElementById(id)!;
  const inputs = [...form.querySelectorAll<HTMLInputElement>('input')];

  // --- persistence: a convenience only; the page works without it ----------
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? 'null');
    if (saved && typeof saved === 'object') {
      for (const el of inputs) {
        if (!(el.name in saved)) continue;
        if (el.type === 'checkbox') el.checked = Boolean(saved[el.name]);
        else el.value = String(saved[el.name]);
      }
    }
  } catch {}
  const save = () => {
    try {
      const data: Record<string, unknown> = {};
      for (const el of inputs) data[el.name] = el.type === 'checkbox' ? el.checked : el.value;
      localStorage.setItem(STORE, JSON.stringify(data));
    } catch {}
  };

  // --- model -----------------------------------------------------------------
  const read = (): Model => {
    let monthlySubs = 0;
    for (const row of form.querySelectorAll<HTMLElement>('[data-sub]')) {
      const on = row.querySelector<HTMLInputElement>('input[type=checkbox]')!;
      const price = row.querySelector<HTMLInputElement>('input[type=number]')!;
      row.classList.toggle('is-off', !on.checked);
      price.disabled = !on.checked;
      if (on.checked) monthlySubs += num(price);
    }
    const cost = (name: string) => num(form.elements.namedItem(name) as HTMLInputElement);
    return { monthlySubs, monthlyOwn: cost('running') + cost('media'), hardware: cost('hardware') };
  };

  const subsAt = (m: Model, month: number) => m.monthlySubs * month;
  const ownAt = (m: Model, month: number) => m.hardware + m.monthlyOwn * month;
  /** Month at which owning has cost less in total, or null if it never does. */
  const breakEven = (m: Model): number | null => {
    const gap = m.monthlySubs - m.monthlyOwn;
    if (gap <= 0) return null;
    return m.hardware / gap;
  };

  // --- chart -------------------------------------------------------------------
  const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) => {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    return node;
  };

  const niceMax = (v: number) => {
    if (v <= 0) return 100;
    const pow = 10 ** Math.floor(Math.log10(v));
    for (const step of [1, 2, 2.5, 5, 10]) if (v <= step * pow) return step * pow;
    return 10 * pow;
  };

  let width = 0;
  let shown: Model = read(); // what is on screen (tweened towards the target)
  let reveal = 0; // 0..1 draw-in of the lines on first view
  let hoverMonth: number | null = null;

  const draw = () => {
    const m = shown;
    const W = width;
    const H = W < 520 ? 260 : 320;
    const narrow = W < 520;
    const pad = { l: 44, r: narrow ? 56 : 132, t: 18, b: 30 };
    const iw = Math.max(10, W - pad.l - pad.r);
    const ih = H - pad.t - pad.b;
    const yMax = niceMax(Math.max(subsAt(m, HORIZON), ownAt(m, HORIZON)));
    const x = (month: number) => pad.l + (month / HORIZON) * iw;
    const y = (v: number) => pad.t + ih - (v / yMax) * ih;

    const svg = el('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: 'img' });
    svg.setAttribute('aria-labelledby', 'sv-chart-title');

    // grid + y ticks
    for (let i = 0; i <= 4; i++) {
      const v = (yMax / 4) * i;
      svg.append(el('line', { x1: pad.l, x2: pad.l + iw, y1: y(v), y2: y(v), class: i === 0 ? 'sv-axis' : 'sv-grid' }));
      const t = el('text', { x: pad.l - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'sv-tick' });
      t.textContent = fmt.format(v);
      svg.append(t);
    }
    // x ticks: one per year
    for (let yr = 0; yr <= HORIZON / 12; yr++) {
      const t = el('text', { x: x(yr * 12), y: H - 8, 'text-anchor': yr === 0 ? 'start' : 'middle', class: 'sv-tick' });
      t.textContent = yr === 0 ? 'Now' : `Year ${yr}`;
      svg.append(t);
    }

    const end = HORIZON * reveal;
    const be = breakEven(m);

    // the saving: the wedge between the lines after they cross
    if (be !== null && be < end) {
      svg.append(
        el('path', {
          class: 'sv-wedge',
          d: `M${x(be)},${y(subsAt(m, be))} L${x(end)},${y(subsAt(m, end))} L${x(end)},${y(ownAt(m, end))} Z`,
        }),
      );
    }

    const line = (cls: string, at: (m: Model, month: number) => number) =>
      el('path', { class: `sv-line ${cls}`, d: `M${x(0)},${y(at(m, 0))} L${x(end)},${y(at(m, end))}` });
    svg.append(line('sv-subs', subsAt), line('sv-own', ownAt));

    if (reveal >= 1) {
      // direct labels at the line ends, nudged apart if they would collide
      let ys = y(subsAt(m, HORIZON));
      let yo = y(ownAt(m, HORIZON));
      if (Math.abs(ys - yo) < 30) {
        const mid = (ys + yo) / 2;
        const up = ys <= yo ? -1 : 1;
        ys = mid + up * 15;
        yo = mid - up * 15;
      }
      const label = (yy: number, name: string, value: number) => {
        const g = el('g');
        const v = el('text', { x: x(HORIZON) + 10, y: yy + (narrow ? 4 : -1), class: 'sv-end-value' });
        v.textContent = fmt.format(value);
        g.append(v);
        if (!narrow) {
          const n = el('text', { x: x(HORIZON) + 10, y: yy + 13, class: 'sv-end-name' });
          n.textContent = name;
          g.append(n);
        }
        return g;
      };
      svg.append(label(ys, 'Subscriptions', subsAt(m, HORIZON)), label(yo, 'Your own hardware', ownAt(m, HORIZON)));

      if (be !== null && be <= HORIZON) {
        const bx = x(be);
        const by = y(subsAt(m, be));
        svg.append(el('line', { x1: bx, x2: bx, y1: by, y2: y(0), class: 'sv-be-drop' }));
        svg.append(el('circle', { cx: bx, cy: by, r: 6, class: 'sv-be-dot' }));
        // Below and to the right of the crossing is the one empty corner: both
        // lines rise away from it. Near the baseline or the right edge there is
        // no room, so the label goes above and to the left instead.
        const below = by + 26 < y(0) - 4 && bx < pad.l + iw * 0.7;
        const anchor = below ? 'start' : 'end';
        const t = el('text', {
          x: bx + (below ? 12 : -12),
          y: below ? by + 22 : by - 14,
          'text-anchor': anchor,
          class: 'sv-be-label',
        });
        t.textContent = `Paid off in month ${Math.ceil(be)}`;
        svg.append(t);
      }
    }

    if (hoverMonth !== null) {
      const hx = x(hoverMonth);
      svg.append(el('line', { x1: hx, x2: hx, y1: pad.t, y2: y(0), class: 'sv-cross' }));
      svg.append(el('circle', { cx: hx, cy: y(subsAt(m, hoverMonth)), r: 4.5, class: 'sv-pt sv-subs-pt' }));
      svg.append(el('circle', { cx: hx, cy: y(ownAt(m, hoverMonth)), r: 4.5, class: 'sv-pt sv-own-pt' }));
    }

    chartEl.replaceChildren(svg);
    chartEl.dataset.padL = String(pad.l);
    chartEl.dataset.innerW = String(iw);

    // tooltip
    if (hoverMonth === null) {
      tip.hidden = true;
    } else {
      const s = subsAt(m, hoverMonth);
      const o = ownAt(m, hoverMonth);
      out('sv-tip-when').textContent = hoverMonth === 0 ? 'Today' : `Month ${hoverMonth}`;
      out('sv-tip-subs').textContent = fmt.format(s);
      out('sv-tip-own').textContent = fmt.format(o);
      out('sv-tip-diff').textContent =
        s === o ? 'Level' : s > o ? `${fmt.format(s - o)} ahead by owning` : `${fmt.format(o - s)} behind so far`;
      tip.hidden = false;
      const hx = x(hoverMonth);
      const flip = hx > W * 0.45;
      tip.style.left = `${hx + (flip ? -12 : 12)}px`;
      tip.style.transform = flip ? 'translateX(-100%)' : 'none';
    }
  };

  // --- headline numbers and table --------------------------------------------
  const describe = (m: Model) => {
    const be = breakEven(m);
    const total = subsAt(m, HORIZON) - ownAt(m, HORIZON);
    out('sv-now').textContent = fmt.format(m.monthlySubs);
    out('sv-after').textContent = fmt.format(m.monthlyOwn);
    out('sv-be').textContent = be === null ? 'Never' : be > HORIZON ? `${Math.ceil(be / 12)} yrs` : `${Math.ceil(be)} mo`;
    out('sv-be-note').textContent =
      be === null
        ? 'running it yourself costs as much per month'
        : be > HORIZON
          ? 'longer than the five years shown'
          : 'until the hardware has paid for itself';
    out('sv-total').textContent = `${total < 0 ? '−' : ''}${fmt.format(Math.abs(total))}`;
    out('sv-total-label').textContent = total < 0 ? 'Extra cost over 5 years' : 'Saved over 5 years';
    out('sv-total').closest('div')!.classList.toggle('is-loss', total < 0);
    const share = m.monthlySubs > 0 ? Math.round((1 - m.monthlyOwn / m.monthlySubs) * 100) : 0;
    out('sv-total-note').textContent =
      m.monthlySubs === 0
        ? 'tick at least one subscription'
        : share > 0
          ? `monthly spend falls by ${share}%`
          : 'monthly spend does not fall';
  };

  const fillTable = (m: Model) => {
    const rows: HTMLTableRowElement[] = [];
    for (let yr = 0; yr <= HORIZON / 12; yr++) {
      const month = yr * 12;
      const tr = document.createElement('tr');
      const cells = [
        yr === 0 ? 'Today' : `Year ${yr}`,
        fmt.format(subsAt(m, month)),
        fmt.format(ownAt(m, month)),
        fmt.format(subsAt(m, month) - ownAt(m, month)),
      ];
      cells.forEach((text, i) => {
        const cell = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) cell.scope = 'row';
        cell.textContent = text;
        tr.append(cell);
      });
      rows.push(tr);
    }
    tableBody.replaceChildren(...rows);
  };

  // --- animation: tween what is shown towards what was entered ----------------
  let raf = 0;
  const animateTo = (target: Model, alsoReveal: boolean) => {
    cancelAnimationFrame(raf);
    const from = { ...shown };
    const fromReveal = reveal;
    const toReveal = alsoReveal ? 1 : reveal;
    const dur = reduceMotion.matches ? 0 : alsoReveal && fromReveal < 1 ? 900 : 380;
    const start = performance.now();
    const ease = (t: number) => 1 - (1 - t) ** 3;
    const step = (now: number) => {
      const t = dur === 0 ? 1 : Math.min(1, (now - start) / dur);
      const k = ease(t);
      shown = {
        monthlySubs: from.monthlySubs + (target.monthlySubs - from.monthlySubs) * k,
        monthlyOwn: from.monthlyOwn + (target.monthlyOwn - from.monthlyOwn) * k,
        hardware: from.hardware + (target.hardware - from.hardware) * k,
      };
      reveal = fromReveal + (toReveal - fromReveal) * k;
      draw();
      describe(shown);
      if (t < 1) raf = requestAnimationFrame(step);
      else {
        shown = target;
        describe(target);
        fillTable(target);
      }
    };
    raf = requestAnimationFrame(step);
  };

  form.addEventListener('input', () => {
    save();
    animateTo(read(), false);
  });
  out('sv-reset').addEventListener('click', () => {
    form.reset();
    save();
    animateTo(read(), false);
  });

  // --- hover and keyboard on the plot -----------------------------------------
  const monthAt = (clientX: number) => {
    const box = chartEl.getBoundingClientRect();
    const padL = Number(chartEl.dataset.padL);
    const innerW = Number(chartEl.dataset.innerW);
    const ratio = (clientX - box.left - padL) / innerW;
    return Math.max(0, Math.min(HORIZON, Math.round(ratio * HORIZON)));
  };
  const setHover = (month: number | null) => {
    if (month === hoverMonth) return;
    hoverMonth = month;
    draw();
  };
  chartEl.addEventListener('pointermove', (e) => reveal >= 1 && setHover(monthAt(e.clientX)));
  chartEl.addEventListener('pointerleave', () => setHover(null));
  chartEl.addEventListener('blur', () => setHover(null));
  chartEl.addEventListener('keydown', (e) => {
    const stepBy = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (e.key === 'Escape') return setHover(null);
    if (!stepBy) return;
    e.preventDefault();
    const jump = e.shiftKey ? 12 : 1;
    setHover(Math.max(0, Math.min(HORIZON, (hoverMonth ?? 0) + stepBy * jump)));
  });

  // --- size and first paint ----------------------------------------------------
  let started = false;
  new ResizeObserver((entries) => {
    const w = Math.floor(entries[0].contentRect.width);
    if (!w || w === width) return;
    width = w;
    draw();
  }).observe(chartEl);

  describe(shown);
  fillTable(shown);
  new IntersectionObserver(
    (entries, io) => {
      if (started || !entries.some((e) => e.isIntersecting)) return;
      started = true;
      io.disconnect();
      animateTo(read(), true);
    },
    { threshold: 0.25 },
  ).observe(chartEl);
}
