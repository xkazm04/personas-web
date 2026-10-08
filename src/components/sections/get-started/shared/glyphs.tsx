/* Hand-drawn SVG glyphs for the get-started lab art. Each is centred on (x, y)
 * and `s` units across, stroked in `c` (a brand CSS variable). Gmail and Slack
 * are drawn as a generic envelope and hash mark, labelled in words beside them. */

type G = { x: number; y: number; s?: number; c: string; w?: number };

/** Rounded so server and browser trig agree to the digit (hydration). */
const r2 = (n: number) => Math.round(n * 100) / 100;
const fillOf = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

export function Envelope({ x, y, s = 40, c, w = 2.4 }: G) {
  const hw = s / 2;
  const hh = s * 0.36;
  return (
    <g stroke={c} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round">
      <rect x={x - hw} y={y - hh} width={s} height={hh * 2} rx={s * 0.1} fill={fillOf(c, 14)} />
      <path d={`M${x - hw + 3} ${y - hh + 4} L${x} ${y + hh * 0.15} L${x + hw - 3} ${y - hh + 4}`} fill="none" />
    </g>
  );
}

export function HashMark({ x, y, s = 40, c, w = 2.6 }: G) {
  const h = s / 2;
  const a = s * 0.16;
  const b = s * 0.3;
  return (
    <g stroke={c} strokeWidth={w} strokeLinecap="round">
      <rect x={x - h} y={y - h} width={s} height={s} rx={s * 0.24} fill={fillOf(c, 14)} />
      <path d={`M${x - a} ${y - b} L${x - a - 2} ${y + b} M${x + a + 2} ${y - b} L${x + a} ${y + b} M${x - b} ${y - a} L${x + b} ${y - a} M${x - b} ${y + a} L${x + b} ${y + a}`} />
    </g>
  );
}

export function Padlock({ x, y, s = 30, c, w = 2.4 }: G) {
  const bw = s * 0.8;
  const bh = s * 0.6;
  const top = y - s * 0.1;
  return (
    <g stroke={c} strokeWidth={w} strokeLinecap="round">
      <path d={`M${x - bw * 0.3} ${top} V${top - s * 0.18} a${bw * 0.3} ${bw * 0.3} 0 0 1 ${bw * 0.6} 0 V${top}`} fill="none" />
      <rect x={x - bw / 2} y={top} width={bw} height={bh} rx={s * 0.12} fill={fillOf(c, 22)} />
      <circle cx={x} cy={top + bh * 0.45} r={s * 0.06} fill={c} stroke="none" />
    </g>
  );
}

/** A clock face; `h`/`m` set the hands (default 8:00). */
export function ClockFace({ x, y, s = 40, c, w = 2.4, h = 8, m = 0 }: G & { h?: number; m?: number }) {
  const r = s / 2;
  const ang = (turn: number) => (turn * 360 - 90) * (Math.PI / 180);
  const ha = ang(((h % 12) + m / 60) / 12);
  const ma = ang(m / 60);
  return (
    <g stroke={c} strokeWidth={w} strokeLinecap="round">
      <circle cx={x} cy={y} r={r} fill={fillOf(c, 14)} />
      <line x1={x} y1={y} x2={r2(x + Math.cos(ha) * r * 0.5)} y2={r2(y + Math.sin(ha) * r * 0.5)} />
      <line x1={x} y1={y} x2={r2(x + Math.cos(ma) * r * 0.74)} y2={r2(y + Math.sin(ma) * r * 0.74)} />
    </g>
  );
}

export function Laptop({ x, y, s = 90, c, w = 2.4 }: G) {
  const sw = s * 0.76;
  const sh = s * 0.5;
  return (
    <g stroke={c} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round">
      <rect x={x - sw / 2} y={y - sh} width={sw} height={sh} rx={6} fill={fillOf(c, 10)} />
      <path d={`M${x - s / 2} ${y + 8} L${x - sw / 2} ${y} H${x + sw / 2} L${x + s / 2} ${y + 8} Z`} fill={fillOf(c, 18)} />
    </g>
  );
}

export function Bolt({ x, y, s = 30, c, w = 2.2 }: G) {
  const k = s / 30;
  return (
    <path
      d={`M${x + 3 * k} ${y - 15 * k} L${x - 8 * k} ${y + 2 * k} H${x} L${x - 3 * k} ${y + 15 * k} L${x + 8 * k} ${y - 2 * k} H${x} Z`}
      fill={fillOf(c, 30)}
      stroke={c}
      strokeWidth={w}
      strokeLinejoin="round"
    />
  );
}

/** A page of text lines with a small spark: "summarize". */
export function Digest({ x, y, s = 40, c, w = 2.2 }: G) {
  const pw = s * 0.7;
  const ph = s * 0.9;
  const l = x - pw / 2;
  const t = y - ph / 2;
  return (
    <g stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <rect x={l} y={t} width={pw} height={ph} rx={5} fill={fillOf(c, 12)} />
      {[0.28, 0.46, 0.64].map((f, i) => (
        <line key={f} x1={l + pw * 0.18} x2={l + pw * (i === 2 ? 0.55 : 0.82)} y1={t + ph * f} y2={t + ph * f} />
      ))}
      <path d={`M${x + pw * 0.5} ${t - 2} l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z`} fill={c} stroke="none" />
    </g>
  );
}
