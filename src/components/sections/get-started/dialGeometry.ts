/* V3 "Your day, its day": a 24-hour dial, in viewBox units (1200 x 640).
 *
 * Noon at the top, midnight at the bottom. The outer band is your day; the cyan
 * sliver at 09:00 is the only time you give it: install, describe, connect, on
 * day one. The inner ring is the agent's day: runs at 11:20 and 15:45 (a new
 * email), 02:10 overnight, and the 08:00 digest. The hand sweeps the clock: the
 * intro plays the setup minutes slowly (09:00 -> 09:20), then the day loops. */

export const W = 1200;
export const H = 640;
export const C = { x: 600, y: 322 } as const;
export const R = { dayIn: 228, dayOut: 262, label: 296, agent: 176, tickIn: 204, tickOut: 214 } as const;

/** Clock hour -> degrees (0 = right, 90 = down): noon at the top, clockwise. */
export const degOf = (h: number) => 90 + h * 15;
export function polar(deg: number, r: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  // Rounded: server and browser Math.cos can differ in the last digit (hydration).
  return [Math.round((C.x + Math.cos(a) * r) * 100) / 100, Math.round((C.y + Math.sin(a) * r) * 100) / 100];
}

/** An annular sector from hour h0 to h1 (wrapping past midnight). */
export function band(h0: number, h1: number, r0: number = R.dayIn, r1: number = R.dayOut): string {
  const span = (((h1 - h0) % 24) + 24) % 24;
  const d0 = degOf(h0);
  const d1 = degOf(h0 + span);
  const large = span * 15 > 180 ? 1 : 0;
  const [ax, ay] = polar(d0, r1);
  const [bx, by] = polar(d1, r1);
  const [cx, cy] = polar(d1, r0);
  const [dx, dy] = polar(d0, r0);
  const f = (n: number) => n.toFixed(1);
  return `M${f(ax)} ${f(ay)} A${r1} ${r1} 0 ${large} 1 ${f(bx)} ${f(by)} L${f(cx)} ${f(cy)} A${r0} ${r0} 0 ${large} 0 ${f(dx)} ${f(dy)} Z`;
}

export type DayPart = "coffee" | "meetings" | "lunch" | "focus" | "home" | "asleep";
export const DAY: { key: DayPart; from: number; to: number; night?: boolean }[] = [
  { key: "asleep", from: 23, to: 7, night: true },
  { key: "coffee", from: 7, to: 8 },
  { key: "meetings", from: 10, to: 12 },
  { key: "lunch", from: 12.5, to: 13.5 },
  { key: "focus", from: 14, to: 17.5 },
  { key: "home", from: 18.5, to: 22.5 },
];
export const SETUP = { from: 9, to: 9 + 1 / 3 } as const;

export type RunKey = "client" | "invoice" | "overnight" | "digest";
/** The agent's runs in the order a lap meets them (a lap starts at 09:20). */
export const RUNS: { key: RunKey; h: number; time: string; trigger: "email" | "schedule" }[] = [
  { key: "client", h: 11 + 20 / 60, time: "11:20", trigger: "email" },
  { key: "invoice", h: 15.75, time: "15:45", trigger: "email" },
  { key: "overnight", h: 2 + 10 / 60, time: "02:10", trigger: "email" },
  { key: "digest", h: 8, time: "08:00", trigger: "schedule" },
];

/** Hours since 09:00 on day one: the intro covers the setup minutes, then a lap is a day. */
export const LAP_START = SETUP.to;
export const hourAt = (p: number, v: number) => (p < 1 ? SETUP.from + p * (SETUP.to - SETUP.from) : LAP_START + v * 24);
/** Lap progress at which a run (or midnight) is reached. */
export const lapAt = (h: number) => ((((h - LAP_START) % 24) + 24) % 24) / 24;
export const MIDNIGHT = lapAt(24);
/** The resting frame (server render, reduced motion): 08:15 the next morning. */
export const REST = lapAt(8.25);

export const clock = (h: number) => {
  const m = Math.floor((((h % 24) + 24) % 24) * 60);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
