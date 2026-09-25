/**
 * Geometry and beats for the "roster" team-canvas variant: one goal enters
 * Sonnet (the app's goal decomposition, commands/teams/assignments.rs), comes
 * out as four steps, and each step routes to the member of the SDLC Delivery
 * Team preset that runs it. Two members get nothing. The four busy members then
 * converge on Landed. Wide (desktop) and tall (phone) layouts, computed once.
 */

import type { BrandKey } from "@/lib/brand-theme";

export type Pt = [number, number];
export type Box = { x: number; y: number; w: number; h: number };

export type MemberKey = "architect" | "docs" | "dev" | "reviewer" | "security" | "qa";
/** Roster order as drawn; `step` is the index of the step routed to it, or null (idle). */
export const MEMBERS: { key: MemberKey; tone: BrandKey; step: number | null }[] = [
  { key: "architect", tone: "purple", step: 0 },
  { key: "docs", tone: "blue", step: null },
  { key: "dev", tone: "cyan", step: 1 },
  { key: "reviewer", tone: "amber", step: 2 },
  { key: "security", tone: "rose", step: null },
  { key: "qa", tone: "emerald", step: 3 },
];

type Cubic = [Pt, Pt, Pt, Pt];

export interface RosterLayout {
  w: number;
  h: number;
  dir: "h" | "v";
  goal: Box;
  splitter: Box;
  team: Box;
  teamLabel: Pt;
  cards: Box[];
  landed: Box;
  /** Where each member's route ends, and how far along it the step chip rests. */
  chipT: number;
  nameX: number;
  font: number;
  sub: number;
}

const rows = (x: number, y0: number, w: number, h: number, gap: number): Box[] =>
  MEMBERS.map((_, i) => ({ x, y: y0 + i * (h + gap), w, h }));

export const WIDE: RosterLayout = {
  w: 1000,
  h: 372,
  dir: "h",
  goal: { x: 6, y: 156, w: 180, h: 60 },
  splitter: { x: 222, y: 166, w: 96, h: 40 },
  team: { x: 530, y: 6, w: 258, h: 360 },
  teamLabel: [659, 30],
  cards: rows(546, 44, 226, 42, 10),
  landed: { x: 830, y: 154, w: 164, h: 64 },
  chipT: 0.72,
  nameX: 34,
  font: 16,
  sub: 14,
};

export const TALL: RosterLayout = {
  w: 380,
  h: 560,
  dir: "v",
  goal: { x: 30, y: 6, w: 290, h: 48 },
  splitter: { x: 142, y: 78, w: 96, h: 36 },
  team: { x: 10, y: 140, w: 360, h: 330 },
  teamLabel: [190, 164],
  cards: rows(26, 178, 328, 40, 8),
  landed: { x: 100, y: 500, w: 180, h: 54 },
  chipT: 1,
  nameX: 96,
  font: 15,
  sub: 13,
};

const cy = (b: Box) => b.y + b.h / 2;

/** Splitter to a member: leaves along the flow axis, arrives at the card. */
export function routeOf(l: RosterLayout, i: number): Cubic {
  const s = l.splitter;
  const c = l.cards[i];
  if (l.dir === "h") {
    const a: Pt = [s.x + s.w, cy(s)];
    return [a, [430, cy(s)], [440, cy(c)], [c.x, cy(c)]];
  }
  const a: Pt = [s.x + s.w / 2, s.y + s.h];
  return [a, [60, 130], [c.x + 10, cy(c)], [c.x + 44, cy(c)]];
}

/** A member to Landed. */
export function convergeOf(l: RosterLayout, i: number): Cubic {
  const c = l.cards[i];
  const d = l.landed;
  if (l.dir === "h") {
    const a: Pt = [c.x + c.w, cy(c)];
    return [a, [800, cy(c)], [800, cy(d)], [d.x - 6, cy(d)]];
  }
  const a: Pt = [c.x + c.w, cy(c)];
  return [a, [376, cy(c)], [376, d.y - 20], [d.x + d.w / 2, d.y - 6]];
}

/** The drawn route: the cubic on desktop; on the phone a bus down the team's
 *  left edge, so six routes do not cross the cards. */
export function routeD(l: RosterLayout, i: number): string {
  if (l.dir === "h") return cubicD(routeOf(l, i));
  const s = l.splitter;
  const c = l.cards[i];
  const y = c.y + c.h / 2;
  return `M${s.x + s.w / 2} ${s.y + s.h} V126 H18 V${y} H${c.x + 44}`;
}

/** The drawn converge line: the cubic on desktop, a bus down the right edge on the phone. */
export function convergeD(l: RosterLayout, i: number): string {
  if (l.dir === "h") return cubicD(convergeOf(l, i));
  const c = l.cards[i];
  const d = l.landed;
  return `M${c.x + c.w} ${c.y + c.h / 2} H364 V486 H${d.x + d.w / 2} V${d.y}`;
}

export const cubicD = ([a, b, c, d]: Cubic) => `M${a[0]} ${a[1]} C${b[0]} ${b[1]} ${c[0]} ${c[1]} ${d[0]} ${d[1]}`;

export function cubicAt([a, b, c, d]: Cubic, t: number): Pt {
  const u = 1 - t;
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return [k[0] * a[0] + k[1] * b[0] + k[2] * c[0] + k[3] * d[0], k[0] * a[1] + k[1] * b[1] + k[2] * c[1] + k[3] * d[1]];
}

export const splitD = (l: RosterLayout) =>
  l.dir === "h"
    ? `M${l.goal.x + l.goal.w} ${cy(l.goal)} H${l.splitter.x - 6}`
    : `M${l.goal.x + l.goal.w / 2} ${l.goal.y + l.goal.h} V${l.splitter.y - 6}`;

/** Beats on one progress value p:
 *  0.00-0.10  the goal enters Sonnet          0.62-0.80  each member finishes (check)
 *  0.10-0.18  four step chips appear          0.80-0.88  their lines converge
 *  0.18-0.58  chips travel: Scope, Build, then Review and Test together
 *  0.88-1.00  Landed lights */
export const SPLIT_AT = 0.04;
export const CHIPS_AT = 0.12;
export const TRAVEL: [number, number][] = [
  [0.18, 0.32],
  [0.28, 0.42],
  [0.42, 0.56],
  [0.42, 0.56],
];
export const DONE_AT = [0.36, 0.5, 0.66, 0.78];
export const CONVERGE_AT = 0.8;
export const LANDED_AT = 0.88;
