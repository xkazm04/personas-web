import type { CategoryKey } from "../shared/categories";

/**
 * V2 "Memory layers": geometry and the story schedule, all module-scope plain
 * numbers so the server and the client draw the identical picture.
 *
 * viewBox 1200 x 620. Four isometric plates (the product's memory tiers) on
 * the left, a ledger of six runs on the right. One story value p runs 0..6;
 * run k occupies [k-1, k]:
 *   0.00-0.30 recall  - every memory not archived beams into the run
 *   0.30-0.60 run     - the run's retries appear in its ledger row
 *   0.60-0.85 learn   - what it learned flies into the working layer
 *   0.85-1.00 settle  - memories it keeps using rise; unused ones sink
 */

export const W = 1200;
export const H = 620;
export const RUNS = 6;
export const RETRIES = [3, 2, 1, 0, 0, 0];

export type Tier = "core" | "active" | "working" | "archive";
export const TIERS: Tier[] = ["core", "active", "working", "archive"];
export const TIER_BRAND = { core: "purple", active: "cyan", working: "emerald", archive: "blue" } as const;

export const PLATE = { cx: 545, a: 262, b: 60, depth: 12 };
export const TIER_Y: Record<Tier, number> = { core: 122, active: 252, working: 382, archive: 512 };

const SLOT_DX = [-180, -108, -36, 36, 108, 180];
export function slotXY(tier: Tier, slot: number) {
  return { x: PLATE.cx + SLOT_DX[slot], y: TIER_Y[tier] + (slot % 2 ? 9 : -9) };
}

export const LEDGER = { x: 900, w: 260, y0: 70, rowH: 70, gap: 12 };
export const rowY = (k: number) => LEDGER.y0 + (k - 1) * (LEDGER.rowH + LEDGER.gap);
/** Where beams meet run k's row (its left edge, vertically centred). */
export const rowAnchor = (k: number) => ({ x: LEDGER.x, y: rowY(k) + LEDGER.rowH / 2 });

interface Move {
  run: number;
  tier: Tier;
  slot: number;
}
export interface Token {
  k: CategoryKey;
  /** 0 = written by you before the first run (a pinned rule). */
  born: number;
  moves: Move[];
}

export const TOKENS: Token[] = [
  { k: "warning", born: 0, moves: [{ run: 0, tier: "core", slot: 2 }] },
  { k: "warning", born: 1, moves: [{ run: 1, tier: "working", slot: 0 }, { run: 2, tier: "active", slot: 0 }] },
  { k: "learning", born: 1, moves: [{ run: 1, tier: "working", slot: 2 }, { run: 2, tier: "active", slot: 2 }] },
  { k: "fact", born: 1, moves: [{ run: 1, tier: "working", slot: 4 }, { run: 3, tier: "active", slot: 4 }, { run: 4, tier: "archive", slot: 1 }] },
  { k: "decision", born: 2, moves: [{ run: 2, tier: "working", slot: 1 }, { run: 3, tier: "active", slot: 1 }, { run: 6, tier: "archive", slot: 3 }] },
  { k: "insight", born: 3, moves: [{ run: 3, tier: "working", slot: 3 }, { run: 4, tier: "active", slot: 3 }] },
  { k: "learning", born: 4, moves: [{ run: 4, tier: "working", slot: 5 }, { run: 5, tier: "active", slot: 5 }] },
  { k: "fact", born: 5, moves: [{ run: 5, tier: "working", slot: 2 }] },
  { k: "insight", born: 6, moves: [{ run: 6, tier: "working", slot: 4 }] },
];

export const PH = { recall: [0, 0.3], run: [0.3, 0.6], learn: [0.6, 0.85], settle: [0.85, 1] } as const;

/** Time (on p) at which a move lands: the learn phase for a birth, else the settle phase. */
const moveSpan = (t: Token, i: number): [number, number] => {
  const m = t.moves[i];
  if (m.run === 0) return [-1, -1];
  const base = m.run - 1;
  return i === 0 && t.born === m.run ? [base + PH.learn[0], base + PH.learn[1]] : [base + PH.settle[0], base + PH.settle[1]];
};

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** Position, visibility and tier of a token at story time p. */
export function tokenAt(t: Token, p: number) {
  let from = t.born === 0 ? slotXY(t.moves[0].tier, t.moves[0].slot) : rowAnchor(t.born);
  let tier: Tier | null = t.born === 0 ? t.moves[0].tier : null;
  for (let i = 0; i < t.moves.length; i++) {
    const [s, e] = moveSpan(t, i);
    const to = slotXY(t.moves[i].tier, t.moves[i].slot);
    if (p >= e) {
      from = to;
      tier = t.moves[i].tier;
      continue;
    }
    if (p > s) {
      const f = ease((p - s) / (e - s));
      const lift = Math.sin(f * Math.PI) * 40;
      return { x: from.x + (to.x - from.x) * f, y: from.y + (to.y - from.y) * f - lift, shown: 1, tier: null as Tier | null };
    }
    break;
  }
  const shown = t.born === 0 || p > t.born - 1 + PH.learn[0] ? 1 : 0;
  return { ...from, shown, tier };
}

/** The run in progress at p (1..RUNS) and how far through it (0..1). */
export function runAt(p: number) {
  const k = Math.min(RUNS, Math.floor(p) + 1);
  return { k, f: p - (k - 1) };
}

export const memoriesAt = (p: number) => TOKENS.filter((t) => tokenAt(t, p).shown).length;
