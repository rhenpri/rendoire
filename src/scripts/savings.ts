// Savings page: every row is its own bar. Reads the form, sizes the bars on
// one shared scale and tweens numbers and widths together.

const STORE = 'savings-inputs-v2';

interface Model {
  years: number;
  subs: number[]; // monthly price per subscription row, 0 when unticked
  hardware: number;
  running: number;
}

const root = document.getElementById('savings');
const form = document.getElementById('sv-form') as HTMLFormElement | null;

if (root && form) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
  const $ = (id: string) => document.getElementById(id)!;
  const num = (el: HTMLInputElement) => {
    const v = parseFloat(el.value);
    return Number.isFinite(v) && v > 0 ? v : 0;
  };

  const inputs = [...form.querySelectorAll<HTMLInputElement>('input')];
  const subRows = [...form.querySelectorAll<HTMLElement>('[data-sub]')];
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;

  // Remembering what was typed is a convenience; the page works without it.
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? 'null');
    if (saved && typeof saved === 'object') {
      for (const el of inputs) {
        if (el.type === 'radio') el.checked = saved.years === el.value;
        else if (!(el.name in saved)) continue;
        else if (el.type === 'checkbox') el.checked = Boolean(saved[el.name]);
        else el.value = String(saved[el.name]);
      }
      if (!form.querySelector('input[name=years]:checked')) {
        form.querySelector<HTMLInputElement>('input[name=years][data-default]')!.checked = true;
      }
    }
  } catch {}
  const save = () => {
    try {
      const data: Record<string, unknown> = {};
      for (const el of inputs) {
        if (el.type === 'radio') {
          if (el.checked) data.years = el.value;
        } else data[el.name] = el.type === 'checkbox' ? el.checked : el.value;
      }
      localStorage.setItem(STORE, JSON.stringify(data));
    } catch {}
  };

  const read = (): Model => ({
    years: Number(form.querySelector<HTMLInputElement>('input[name=years]:checked')?.value ?? 5),
    subs: subRows.map((row) => {
      const on = row.querySelector<HTMLInputElement>('input[type=checkbox]')!;
      const price = row.querySelector<HTMLInputElement>('input[type=number]')!;
      row.classList.toggle('is-off', !on.checked);
      price.disabled = !on.checked;
      return on.checked ? num(price) : 0;
    }),
    hardware: num(field('hardware')),
    running: num(field('running')),
  });

  const bar = (el: Element, share: number) => {
    (el.querySelector('.sv-bar') as HTMLElement).style.width = `${Math.max(0, Math.min(1, share)) * 100}%`;
  };
  const val = (el: Element, v: number) => {
    el.querySelector('.sv-val')!.textContent = fmt.format(v);
  };

  let grow = 0; // 0..1: bars grow from nothing the first time they are seen

  const render = (m: Model) => {
    const months = m.years * 12;
    const subTotals = m.subs.map((p) => p * months);
    const subTotal = subTotals.reduce((a, b) => a + b, 0);
    const runTotal = m.running * months;
    const ownTotal = m.hardware + runTotal;
    const scale = Math.max(subTotal, ownTotal, 1) / grow || Infinity;

    subRows.forEach((row, i) => {
      bar(row, subTotals[i] / scale);
      val(row, subTotals[i]);
    });
    bar($('sv-row-hardware'), m.hardware / scale);
    val($('sv-row-hardware'), m.hardware);
    bar($('sv-row-running'), runTotal / scale);
    val($('sv-row-running'), runTotal);

    bar($('sv-total-subs'), subTotal / scale);
    val($('sv-total-subs'), subTotal);
    bar($('sv-total-own'), ownTotal / scale);
    val($('sv-total-own'), ownTotal);

    const saved = subTotal - ownTotal;
    const monthlySubs = m.subs.reduce((a, b) => a + b, 0);
    const gap = monthlySubs - m.running;
    const years = Math.round(m.years);
    const span = `${years} year${years === 1 ? '' : 's'}`;

    $('sv-saved').textContent = `${saved < 0 ? '−' : ''}${fmt.format(Math.abs(saved))}`;
    $('sv-result').classList.toggle('is-loss', saved < 0);
    $('sv-saved-label').textContent = saved < 0 ? `Extra cost over ${span}` : `Saved over ${span}`;

    let line: string;
    if (monthlySubs === 0) line = 'Tick at least one subscription.';
    else if (gap <= 0) line = 'Running it yourself costs as much each month, so the hardware never pays for itself.';
    else {
      const month = Math.ceil(m.hardware / gap);
      const pays =
        month <= 1 ? 'in the first month' : month <= 24 ? `in month ${month}` : `after about ${Math.round(month / 12)} years`;
      const pct = subTotal > 0 && saved > 0 ? ` That is ${Math.round((saved / subTotal) * 100)}% less.` : '';
      line = `The hardware pays for itself ${pays}.${pct}`;
    }
    $('sv-line').textContent = line;
  };

  // Tween what is shown towards what was entered.
  let shown = read();
  let raf = 0;
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const animateTo = (target: Model, growIn: boolean) => {
    cancelAnimationFrame(raf);
    const from = shown;
    const fromGrow = grow;
    const toGrow = growIn ? 1 : grow;
    const dur = reduceMotion.matches ? 0 : growIn && fromGrow < 1 ? 1100 : 450;
    const start = performance.now();
    const step = (now: number) => {
      const t = dur === 0 ? 1 : Math.min(1, (now - start) / dur);
      const k = 1 - (1 - t) ** 3;
      grow = lerp(fromGrow, toGrow, k);
      shown = {
        years: lerp(from.years, target.years, k),
        subs: target.subs.map((p, i) => lerp(from.subs[i], p, k)),
        hardware: lerp(from.hardware, target.hardware, k),
        running: lerp(from.running, target.running, k),
      };
      render(t < 1 ? shown : (shown = target));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  form.addEventListener('input', () => {
    save();
    animateTo(read(), false);
  });
  $('sv-reset').addEventListener('click', () => {
    form.reset();
    save();
    animateTo(read(), false);
  });

  render(shown);
  new IntersectionObserver(
    (entries, io) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      animateTo(read(), true);
    },
    { threshold: 0.15 },
  ).observe(root);
}
