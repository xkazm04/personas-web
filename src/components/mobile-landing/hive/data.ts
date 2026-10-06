/**
 * Static data and geometry for the /m "Hive Reels" landing (ported from the contest winner,
 * .contest/arena/mobile-landing/entries/claude-claude-sonnet-5-5_max/variant-1/app.js).
 *
 * Everything here is pure and computed once at module load, so the server and the client render
 * the same SVG. Words live in src/i18n/en.ts (`mobileLanding`, plus the translated
 * `useCasesSection` / `faqSection`); this module holds only shape, order and colour keys.
 */
import type { ToolKey } from "./toolIcons";

const SQ3 = Math.sqrt(3);

/** Points of a flat-topped hexagon, as an SVG `points` string. */
export function hexPts(cx: number, cy: number, r: number): string {
  const p: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    p.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return p.join(" ");
}

export const mod = (a: number, n: number) => ((a % n) + n) % n;

/* ------------------------------------------------------------------ 1 hero hive */

const R = 34;
const DX = 1.5 * R;
const DY = SQ3 * R;
const CX = 195;
const CY = 155;
/** The twelve agent slots around the hub, clockwise from the top. */
const RING: [number, number][] = [[0, -2], [1, -2], [2, -2], [2, -1], [2, 0], [1, 1], [0, 2], [-1, 2], [-2, 2], [-2, 1], [-2, 0], [-1, -1]];

export interface HiveCell {
  points: string;
  /** Hex distance from the hub: drives the ripple delay. */
  d: number;
  /** Fill opacity: full near the hub, fading towards the edge. */
  o: string;
  /** Index in RING when this cell is an agent slot, else -1. */
  slot: number;
  x: number;
  y: number;
}

export const HIVE_CELLS: HiveCell[] = (() => {
  const out: HiveCell[] = [];
  for (let q = -9; q <= 9; q++) {
    for (let r = -10; r <= 10; r++) {
      const x = CX + DX * q;
      const y = CY + DY * (r + q / 2);
      if (x < -80 || x > 470 || y < -150 || y > 470) continue;
      const d = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
      const slot = RING.findIndex(([rq, rr]) => rq === q && rr === r);
      let o = d <= 2 ? 1 : Math.max(0.1, 1 - (d - 2) * 0.16);
      if (y < 40) o *= 0.7;
      out.push({ points: hexPts(x, y, R - 1.6), d, o: o.toFixed(2), slot, x, y });
    }
  }
  return out;
})();

export const HUB_PLATE = hexPts(CX, CY, 62);

export type EventTone = "cy" | "em" | "am";

/**
 * The three hero events: which ring slots form the team, and the colour it lights in.
 * Owner adjustment (2026-10-06): the winner lit "New lead" purple and "Build failed" rose; both
 * now light in non-purple brand tones (emerald, amber) so no fill runs through purple or pink.
 */
export const HERO_EVENTS: { tone: EventTone; team: number[] }[] = [
  { tone: "cy", team: [0, 2, 4, 6, 8, 10] },
  { tone: "em", team: [10, 11, 0, 1, 2] },
  { tone: "am", team: [11, 1, 3, 5, 7, 9, 0] },
];

/* ------------------------------------------------------------------ 2 use-case reel */

export const TOOL_ORDER: ToolKey[] = ["gmail", "slack", "github", "drive", "jira", "notion", "stripe", "calendar", "figma"];

/** Six jobs; each lands the reel on `tool` with that tool's job `job` (index into its cases). */
export const NEEDS: { tool: ToolKey; job: number; deco: [ToolKey, ToolKey] }[] = [
  { tool: "gmail", job: 0, deco: ["slack", "drive"] },
  { tool: "notion", job: 0, deco: ["figma", "slack"] },
  { tool: "calendar", job: 1, deco: ["drive", "gmail"] },
  { tool: "jira", job: 2, deco: ["slack", "github"] },
  { tool: "github", job: 0, deco: ["figma", "jira"] },
  { tool: "stripe", job: 0, deco: ["gmail", "slack"] },
];

/** Which tool sits on each of the six drum faces once the reel lands on `need` with face `k` in front. */
export function deckFor(need: number, k: number): ToolKey[] {
  const n = NEEDS[need];
  const f0 = mod(k, 6);
  const rest = TOOL_ORDER.filter((t) => t !== n.tool && !n.deco.includes(t));
  const deck: ToolKey[] = new Array(6);
  deck[f0] = n.tool;
  deck[mod(f0 + 1, 6)] = n.deco[0];
  deck[mod(f0 - 1, 6)] = n.deco[1];
  deck[mod(f0 + 2, 6)] = rest[(need + 1) % rest.length];
  deck[mod(f0 - 2, 6)] = rest[(need + 3) % rest.length];
  deck[mod(f0 + 3, 6)] = rest[(need + 5) % rest.length];
  return deck;
}

/* ------------------------------------------------------------------ 3 Athena */

export const CAP_KEYS = ["always", "voice", "memory", "proactive"] as const;
export type CapKey = (typeof CAP_KEYS)[number];

/* ------------------------------------------------------------------ 4 the bill */

/** One hex segment of the pipe from Personas down to Anthropic. */
export interface PipeSeg {
  points: string;
  /** Which pipe: 140 = Personas -> Claude Code, 246 = Claude Code -> Anthropic. */
  pipe: 140 | 246;
}

export const BILL_SEGS: PipeSeg[] = (() => {
  const out: PipeSeg[] = [];
  const pipe = (x: number, y1: 140 | 246, y2: number) => {
    const n = Math.max(2, Math.round((y2 - y1) / 17));
    const sp = (y2 - y1) / n;
    const r = sp / SQ3;
    for (let i = 0; i < n; i++) out.push({ points: hexPts(x, y1 + sp * (i + 0.5), r - 0.8), pipe: y1 });
  };
  pipe(62, 140, 192);
  pipe(62, 246, 298);
  return out;
})();

export const BILL_SHAPES = {
  frame: "28,8 206,8 222,24 222,254 206,270 28,270 12,254 12,24",
  personas: hexPts(62, 92, 44),
  cli: hexPts(62, 218, 28),
  anthropic: hexPts(62, 330, 30),
  plan: "242,300 330,300 346,332 330,364 242,364 226,332",
  run: hexPts(0, 0, 9),
};

/** Where the run token sits at each step of the play. */
export const RUN_Y = { start: 50, personas: 138, cli: 218, anthropic: 326 } as const;

/* ------------------------------------------------------------------ 5 FAQ */

/** FAQ glyphs, in faqSection.questions order. */
export const FAQ_GLYPHS = ["gl-term", "gl-shield", "gl-coin", "gl-inf"] as const;
/**
 * FAQ tile tones. Owner adjustment: the winner tinted tiles 2 and 4 purple and rose; they now use
 * amber and the info blue, so no tile fill runs through purple or pink.
 */
export const FAQ_TONES = ["var(--cy)", "var(--am)", "var(--em)", "var(--info)"] as const;
