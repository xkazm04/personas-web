import { Activity, BookOpen, Brain, CheckCircle2, MessageCircle, Radio, ShieldAlert, XCircle, type LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";
import type { AgentId } from "@/components/feature-sections/observability-deck/types";
import { seeded } from "../shared/motion";

/* V1 "Lit deck": geometry (viewBox units) and the stylised span schedule. Every
 * lane repeats one lap of spans; a span's x on screen is its start time, so it
 * is born at the "now" seam and drifts left as the lap turns. */

export const W = 1200;
export const H = 600;

export const DECK = { x: 214, y: 0, w: 772, h: 600 } as const;
export const CHROME_H = 44;
export const METRICS = { y: 44, h: 104 } as const;
export const AXIS_Y = 160;
export const LANE = { y0: 182, h: 61 } as const;
export const FOOT_Y = 550;
export const NAME_X = 234;
export const TRACK = { x0: 384, x1: 896 } as const; // x1 is the "now" seam
export const TOTALS_X = 908;
/** Strip length of one lap: the track shows half a lap (15 s of a 30 s lap). */
export const LAP_LEN = (TRACK.x1 - TRACK.x0) * 2;
export const LAP_S = 30;
export const REST = 0.62;
export const BAR_H = 28;

export type SpanType =
  | "execution.completed"
  | "execution.failed"
  | "message.sent"
  | "event.emitted"
  | "memory.stored"
  | "review.requested"
  | "knowledge.indexed"
  | "health.checked";

export const TYPE_META: Record<SpanType, { icon: LucideIcon; brand: BrandKey }> = {
  "execution.completed": { icon: CheckCircle2, brand: "emerald" },
  "execution.failed": { icon: XCircle, brand: "rose" },
  "message.sent": { icon: MessageCircle, brand: "cyan" },
  "event.emitted": { icon: Radio, brand: "purple" },
  "memory.stored": { icon: Brain, brand: "amber" },
  "review.requested": { icon: ShieldAlert, brand: "rose" },
  "knowledge.indexed": { icon: BookOpen, brand: "amber" },
  "health.checked": { icon: Activity, brand: "blue" },
};

export const AGENTS: { id: AgentId; brand: BrandKey; mix: SpanType[]; base: number; baseCost: number }[] = [
  { id: "prReviewer", brand: "emerald", mix: ["execution.completed", "message.sent", "review.requested", "execution.completed", "memory.stored"], base: 41, baseCost: 4.12 },
  { id: "emailTriage", brand: "cyan", mix: ["message.sent", "execution.completed", "message.sent", "event.emitted"], base: 128, baseCost: 1.86 },
  { id: "slackDigest", brand: "purple", mix: ["event.emitted", "message.sent", "execution.completed"], base: 22, baseCost: 0.94 },
  { id: "deployMonitor", brand: "amber", mix: ["health.checked", "execution.failed", "execution.completed", "health.checked", "event.emitted"], base: 64, baseCost: 2.37 },
  { id: "docIndexer", brand: "rose", mix: ["knowledge.indexed", "memory.stored", "execution.completed"], base: 36, baseCost: 3.05 },
  { id: "meetingNotes", brand: "blue", mix: ["execution.completed", "memory.stored", "message.sent", "review.requested"], base: 17, baseCost: 1.48 },
];

export interface Span {
  key: string;
  lane: number;
  type: SpanType;
  /** Start, in laps (0..1). */
  at: number;
  /** Length, in laps. */
  dur: number;
  cost: number;
}

const LONG: SpanType[] = ["execution.completed", "execution.failed", "knowledge.indexed"];

function buildLane(lane: number): Span[] {
  const rnd = seeded(lane * 7919 + 13);
  const { mix } = AGENTS[lane];
  const out: Span[] = [];
  let at = rnd() * 0.06;
  let i = 0;
  while (at < 0.97) {
    const type = mix[i % mix.length];
    const long = LONG.includes(type);
    const dur = long ? 0.05 + rnd() * 0.07 : 0.014 + rnd() * 0.012;
    if (at + dur > 0.995) break;
    out.push({ key: `${lane}-${i}`, lane, type, at, dur, cost: long ? 0.04 + Math.round(rnd() * 20) / 100 : 0 });
    at += dur + 0.025 + rnd() * 0.07;
    i += 1;
  }
  return out;
}

export const SPANS: Span[][] = AGENTS.map((_, lane) => buildLane(lane));

/** Spans started up to `seconds` on the clock, and their spend (monotonic). */
export function tally(lane: number, seconds: number): { count: number; cost: number } {
  const laps = Math.floor(seconds / LAP_S);
  const lap = seconds / LAP_S - laps;
  let count = laps * SPANS[lane].length;
  let cost = laps * SPANS[lane].reduce((sum, s) => sum + s.cost, 0);
  for (const s of SPANS[lane]) {
    if (s.at <= lap) {
      count += 1;
      cost += s.cost;
    }
  }
  return { count, cost };
}

/** The latest span to cross the seam, and how fresh it is (1 = just now). */
export function latest(lane: number, lap: number): { span: Span | null; fresh: number } {
  let best: Span | null = null;
  let age = Infinity;
  for (const s of SPANS[lane]) {
    const d = (((lap - s.at) % 1) + 1) % 1;
    if (d < age) {
      age = d;
      best = s;
    }
  }
  return { span: best, fresh: Math.max(0, 1 - age / 0.03) };
}

export const laneY = (lane: number) => LANE.y0 + lane * LANE.h + LANE.h / 2;
