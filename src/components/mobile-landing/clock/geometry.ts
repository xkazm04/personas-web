/**
 * Pure geometry and timeline math for the /m2 "Around the Clock" landing.
 *
 * The page is one day: scrolling turns a 24-hour dial. These functions map a scroll offset to
 * the hour the dial shows, to each chapter's opacity and to the sky's grade. They hold no DOM,
 * so the scroll engine (useClockEngine) stays a thin writer and this file is unit-tested.
 */

/** Dial centre in its 600x600 viewBox. */
export const C = 300;

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Smoothstep from a to b. */
export function sstep(a: number, b: number, x: number): number {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
export const p2 = (n: number) => (n < 10 ? "0" : "") + n;
export const f1 = (n: number) => n.toFixed(1);

/** "09:30" for 9.5. */
export function hhmm(hour: number): string {
  const h24 = ((hour % 24) + 24) % 24;
  const hh = Math.floor(h24);
  const mm = Math.floor((h24 - hh) * 60 + 1e-6);
  return `${p2(hh)}:${p2(mm)}`;
}

/** A point at radius r for hour h on the dial (00 at the top, clockwise). */
export function P(r: number, h: number): [number, number] {
  const a = (h * Math.PI) / 12;
  return [C + r * Math.sin(a), C - r * Math.cos(a)];
}

/** An SVG arc path along radius r from hour h0 to h1, clockwise. */
export function arcD(r: number, h0: number, h1: number): string {
  const a = P(r, h0);
  const b = P(r, h1);
  return `M${f1(a[0])} ${f1(a[1])}A${r} ${r} 0 ${h1 - h0 > 12 ? 1 : 0} 1 ${f1(b[0])} ${f1(b[1])}`;
}

/** How much of each sky layer shows at a 24h hour. */
export function skyAt(h24: number) {
  const dawn = sstep(4.0, 6.6, h24) * (1 - sstep(6.6, 9.2, h24));
  const day = sstep(7.0, 9.5, h24) * (1 - sstep(16.0, 18.5, h24));
  const dusk = sstep(16.0, 18.8, h24) * (1 - sstep(18.8, 22.0, h24));
  return { dawn, day, dusk, night: clamp(1 - Math.max(day, dawn * 0.95, dusk * 0.6), 0, 1) };
}

/** A chapter's scroll window, in scroller pixels: where its spacer starts and ends being pinned. */
export interface Win {
  s: number;
  e: number;
}

/** Fraction of each beat the value holds before it eases to the next one. */
export const HOLD = 0.55;

export interface Timeline {
  /** Scroller height (one screen). */
  H: number;
  /** One window per spacer: 0 hero, 1 tools, 2 gap, 3 Athena, 4 gap, 5 pricing. */
  win: Win[];
  faqTop: number;
  ctaTop: number;
  ctaHeight: number;
  max: number;
}

/** The hour the FAQ and the call to action read: their big clocks say 21:00 and 23:00. */
export const FAQ_HOUR = 45;
export const CTA_HOUR = 47;

/** Keyframes [scrollY, hour] for the whole day, sorted by scroll. */
export function buildKeys(tl: Timeline, toolHours: number[], momentHours: number[], priceHours: number[]): [number, number][] {
  const K: [number, number][] = [];
  const { win: w, H } = tl;
  const add = (x: number, h: number) => K.push([x, h]);
  add(0, 9);
  add(w[1].s - 0.1 * H, 9);
  const beats = (win: Win, hours: number[]) => {
    const n = hours.length;
    const B = (win.e - win.s) / n;
    hours.forEach((h, i) => {
      const s = win.s + i * B;
      add(s, h);
      add(i === n - 1 ? win.e : s + B * HOLD, h);
    });
  };
  beats(w[1], toolHours);
  beats(w[3], momentHours);
  add(w[5].s, 32);
  beats(w[5], priceHours);
  // The FAQ's clock reads 21:00 and the CTA's 23:00: the dial and the sky agree with them.
  const fq = tl.faqTop - 0.1 * H;
  const ct = tl.ctaTop + (tl.ctaHeight - H) / 2;
  add(Math.max(w[5].e + 1, fq), FAQ_HOUR);
  add(Math.max(fq + 2, tl.ctaTop - H * 0.25), FAQ_HOUR + 0.5);
  add(Math.max(tl.ctaTop, ct), CTA_HOUR);
  add(tl.max + 1, CTA_HOUR + 0.4);
  K.sort((a, b) => a[0] - b[0]);
  return K;
}

/** The hour at scroll offset x, eased between keyframes. */
export function hourAt(K: [number, number][], x: number): number {
  const n = K.length;
  if (!n) return 9;
  if (x <= K[0][0]) return K[0][1];
  for (let i = 1; i < n; i++) {
    if (x <= K[i][0]) {
      const a = K[i - 1];
      const b = K[i];
      if (b[0] === a[0]) return b[1];
      return lerp(a[1], b[1], sstep(a[0], b[0], x));
    }
  }
  return K[n - 1][1];
}

/** Which of n beats inside a window is current at x, and how far into it. */
export function beatAt(win: Win, n: number, x: number) {
  const len = Math.max(1, win.e - win.s);
  const B = len / n;
  const t = clamp((x - win.s) / B, 0, n - 0.0001);
  const i = Math.floor(t);
  const f = t - i;
  const g = i < n - 1 ? sstep(HOLD, 1, f) : 0;
  return { i, f, idx: i + g, shown: i < n - 1 && g > 0.5 ? i + 1 : i };
}

/** Opacity of the four pinned chapters (hero, tools, Athena, pricing) at x. */
export function chapterOpacity(w: Win[], H: number, x: number): [number, number, number, number] {
  return [
    1 - sstep(w[1].s - 0.5 * H, w[1].s - 0.16 * H, x),
    sstep(w[1].s - 0.12 * H, w[1].s + 0.1 * H, x) * (1 - sstep(w[1].e - 0.12 * H, w[1].e + 0.06 * H, x)),
    sstep(w[3].s - 0.2 * H, w[3].s, x) * (1 - sstep(w[3].e - 0.12 * H, w[3].e + 0.04 * H, x)),
    sstep(w[5].s - 0.2 * H, w[5].s, x),
  ];
}

/** The chapter that owns the stage at x (0 hero, 1 tools, 2 Athena, 3 pricing). */
export function dominantChapter(w: Win[], H: number, x: number): 0 | 1 | 2 | 3 {
  if (x < w[1].s - 0.3 * H) return 0;
  if (x < (w[2].s + w[2].e) / 2) return 1;
  if (x < (w[4].s + w[4].e) / 2) return 2;
  return 3;
}

/**
 * How much of the pinned stage still shows as it hands over to the FAQ. The stage used to scroll
 * away at full strength while the FAQ rose under it, so one frame stacked "Free." and the dial over
 * the FAQ's 21:00. It now fades out across the unpin, gone before the FAQ reaches mid-screen.
 */
export function stageLeave(w: Win[], H: number, x: number): number {
  const unpin = w[5].e;
  return 1 - sstep(unpin - 0.15 * H, unpin + 0.22 * H, x);
}

/**
 * Whether a label on the turning dial should hide: on the lower half of the face (it would read
 * upside down), past the column's edge, or (while Athena's portrait sits over the dial) under it.
 * `scale` is screen px per viewBox unit; `half` is half the column width.
 */
export function cullLabel(hour: number, rot: number, r: number, pad: number, scale: number, half: number, portrait: boolean): boolean {
  const aa = hour * 15 + rot;
  const ca = ((aa % 360) + 360) % 360;
  if (ca > 112 && ca < 248) return true;
  const rad = (aa * Math.PI) / 180;
  if (Math.abs(scale * r * Math.sin(rad)) > half - pad) return true;
  if (portrait) {
    const dx = 0.25 * r * Math.sin(rad);
    const dy = -0.25 * r * Math.cos(rad) + 51;
    return dx * dx + dy * dy < 31 * 31;
  }
  return false;
}
