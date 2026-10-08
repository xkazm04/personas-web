/* ── Procedural persona emblems: one shape family per team ─────────
 *
 * Ported from the contest's `emblem.js`. Each team draws from its own motif
 * (coin-hexagon, headset, sprout, gear, pennant, scales, prism, paired heads,
 * tower); a callsign-seeded stream varies the details per agent. Shapes are
 * plain data so the small and the rich emblem can render them differently.
 */

export interface Shape {
  el: "line" | "circle" | "polygon" | "path" | "rect";
  a: Record<string, string | number>;
  /** Filled body part (otherwise stroke only). */
  fill?: boolean;
}

type Rng = () => number;
const f1 = (n: number) => Math.round(n * 10) / 10;
const line = (x1: number, y1: number, x2: number, y2: number): Shape => ({ el: "line", a: { x1: f1(x1), y1: f1(y1), x2: f1(x2), y2: f1(y2) } });
const path = (d: string, fill = false): Shape => ({ el: "path", a: { d }, fill });
const circle = (cx: number, cy: number, r: number, fill = false): Shape => ({ el: "circle", a: { cx, cy, r }, fill });

function poly(cx: number, cy: number, r: number, n: number, rot: number): string {
  const p: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i * Math.PI * 2) / n;
    p.push(`${f1(cx + r * Math.cos(a))},${f1(cy + r * Math.sin(a))}`);
  }
  return p.join(" ");
}

const FAMILIES: Record<string, (r: Rng) => Shape[]> = {
  finance(r) {
    const rot = r() < 0.5 ? 0 : Math.PI / 6;
    const ticks = 6 + Math.floor(r() * 7);
    const out: Shape[] = [{ el: "polygon", a: { points: poly(50, 50, 37, 6, rot) }, fill: true }, circle(50, 50, 17)];
    for (let i = 0; i < ticks; i++) {
      const a = (i * Math.PI * 2) / ticks;
      out.push(line(50 + 21 * Math.cos(a), 50 + 21 * Math.sin(a), 50 + 25 * Math.cos(a), 50 + 25 * Math.sin(a)));
    }
    const bars = 2 + Math.floor(r() * 2);
    for (let i = 0; i < bars; i++) {
      const y = 44 + i * (12 / (bars - 1 || 1));
      out.push(line(42, y, 58, y));
    }
    return out;
  },
  support(r) {
    const arcs = 1 + Math.floor(r() * 3);
    const out: Shape[] = [
      path("M 22 56 A 28 28 0 0 1 78 56"),
      { el: "rect", a: { x: 16, y: 52, width: 13, height: 22, rx: 6 }, fill: true },
      { el: "rect", a: { x: 71, y: 52, width: 13, height: 22, rx: 6 }, fill: true },
      path("M 77 74 Q 74 86 58 86"),
      circle(55, 86, 4, true),
    ];
    for (let i = 0; i < arcs; i++) {
      const rr = 9 + i * 6;
      out.push(path(`M ${f1(70 + rr * 0.5)} ${f1(80 - rr * 0.9)} A ${rr} ${rr} 0 0 1 ${f1(70 + rr)} ${f1(80 - rr * 0.1)}`));
    }
    return out;
  },
  growth(r) {
    const leaves = 2 + Math.floor(r() * 3);
    const out: Shape[] = [path("M 50 84 C 46 66 54 46 50 22")];
    for (let i = 0; i < leaves; i++) {
      const y = 70 - i * (40 / leaves);
      const side = i % 2 ? -1 : 1;
      const len = 15 + r() * 9;
      out.push(path(`M 50 ${f1(y)} Q ${f1(50 + side * len * 0.4)} ${f1(y - 16)} ${f1(50 + side * len)} ${f1(y - 8)} Q ${f1(50 + side * len * 0.6)} ${f1(y + 4)} 50 ${f1(y)} Z`, true));
    }
    out.push(circle(50, 19, 5, true), line(28, 86, 72, 86));
    return out;
  },
  eng(r) {
    const teeth = 6 + Math.floor(r() * 5);
    const pts: string[] = [];
    for (let i = 0; i < teeth * 2; i++) {
      const a = (i * Math.PI) / teeth;
      const rr = i % 2 ? 29 : 37;
      const w = (Math.PI / teeth) * 0.35;
      pts.push(`${f1(50 + rr * Math.cos(a - w))},${f1(50 + rr * Math.sin(a - w))}`);
      pts.push(`${f1(50 + rr * Math.cos(a + w))},${f1(50 + rr * Math.sin(a + w))}`);
    }
    const chev = r() < 0.5 ? "M 40 40 L 30 50 L 40 60 M 60 40 L 70 50 L 60 60" : "M 42 38 L 56 50 L 42 62";
    return [{ el: "polygon", a: { points: pts.join(" ") }, fill: true }, circle(50, 50, 20), path(chev)];
  },
  sales(r) {
    const stripes = 1 + Math.floor(r() * 3);
    const out: Shape[] = [line(32, 16, 32, 86), { el: "polygon", a: { points: "32,20 80,32 32,46" }, fill: true }];
    for (let i = 0; i < stripes; i++) {
      const x = 46 + i * 9;
      out.push(line(x, 24 + (x - 34) * 0.27, x, 44 - (x - 34) * 0.27));
    }
    out.push(path("M 50 80 L 76 54 M 62 54 L 76 54 L 76 68"));
    return out;
  },
  legal(r) {
    const tilt = f1((r() - 0.5) * 8);
    const rot = (d: string, fill = false): Shape => ({ el: "path", a: { d, transform: `rotate(${tilt} 50 30)` }, fill });
    return [
      line(50, 18, 50, 80),
      circle(50, 15, 4, true),
      rot("M 20 30 L 80 30"),
      rot("M 20 30 L 12 54 M 20 30 L 28 54 M 80 30 L 72 54 M 80 30 L 88 54"),
      rot("M 10 54 Q 20 66 30 54 Z", true),
      rot("M 70 54 Q 80 66 90 54 Z", true),
      { el: "rect", a: { x: 34, y: 80, width: 32, height: 7, rx: 2 }, fill: true },
    ];
  },
  data(r) {
    const rays = 3 + Math.floor(r() * 3);
    const out: Shape[] = [line(8, 58, 38, 52), { el: "polygon", a: { points: "50,18 80,76 20,76" }, fill: true }];
    for (let i = 0; i < rays; i++) {
      const k = i - (rays - 1) / 2;
      out.push(line(66, 50 + k * 2, 90, 46 + k * 8));
    }
    out.push(circle(50, 56, 9));
    return out;
  },
  people(r) {
    const third = r() < 0.4;
    return [
      circle(37, 40, 11, true),
      circle(63, 40, 11, true),
      path("M 18 80 Q 20 58 37 58 Q 50 58 50 70 Q 50 58 63 58 Q 80 58 82 80"),
      third ? circle(50, 22, 7) : path("M 44 22 Q 50 16 56 22"),
    ];
  },
  infra(r) {
    const braces = 2 + Math.floor(r() * 3);
    const out: Shape[] = [line(50, 30, 32, 86), line(50, 30, 68, 86)];
    for (let i = 0; i < braces; i++) {
      const y1 = 36 + i * (44 / braces);
      const y2 = y1 + 44 / braces;
      out.push(line(50 - (y1 - 30) * 0.3, y1, 50 + (y2 - 30) * 0.3, y2));
    }
    out.push(circle(50, 28, 5, true));
    const arcs = 1 + Math.floor(r() * 2);
    for (let i = 0; i < arcs; i++) {
      const rr = 10 + i * 8;
      out.push(path(`M ${50 - rr} ${f1(30 - rr * 0.2)} A ${rr} ${rr} 0 0 1 ${f1(50 - rr * 0.5)} ${f1(30 - rr * 0.85)}`));
      out.push(path(`M ${50 + rr} ${f1(30 - rr * 0.2)} A ${rr} ${rr} 0 0 0 ${f1(50 + rr * 0.5)} ${f1(30 - rr * 0.85)}`));
    }
    return out;
  },
};

export function familyShapes(team: string, r: Rng): Shape[] {
  return (FAMILIES[team] ?? FAMILIES.data)(r);
}
