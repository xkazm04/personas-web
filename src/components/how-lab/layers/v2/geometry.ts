/** V2 "Growth dial" geometry: one 1320x600 drawing shared by SVG and HTML. */

import type { BrandKey } from "@/lib/brand-theme";
import type { ToolId } from "../shared/layers";

export const W = 1320;
export const H = 600;

/** The laptop every agent grows from: its screen's top-centre is the root. */
export const ROOT = { x: 846, y: 380 };

/** Agents on the screen after each stop: day 1, week 2, month 3, year 1. */
export const COUNTS = [1, 3, 12, 40] as const;

export interface AgentNode {
  i: number;
  x: number;
  y: number;
  r: number;
  ring: number;
  /** The node it grew from (-1 = the laptop). */
  parent: number;
  brand: BrandKey | null;
  tool?: ToolId;
}

/** Rings fan out above the laptop; n per ring, ordered so the first `COUNTS[k]` are the stops. */
const RINGS = [
  { r: 120, n: 3, node: 21, brand: "cyan" as BrandKey },
  { r: 212, n: 9, node: 16, brand: "purple" as BrandKey },
  { r: 300, n: 12, node: 13, brand: null },
  { r: 372, n: 16, node: 11, brand: null },
];
const SPAN = [18, 162];
const SQUASH_X = 1.24;
const SQUASH_Y = 0.92;
const CHAIN_TOOLS: ToolId[] = ["gmail", "slack", "github"];

function build(): AgentNode[] {
  const out: AgentNode[] = [];
  let prevStart = -1;
  let prevCount = 0;
  RINGS.forEach((ring, k) => {
    const start = out.length;
    for (let j = 0; j < ring.n; j++) {
      // Ring 0 lists its middle node first: day 1's single helper sits straight up.
      const slot = k === 0 ? [1, 0, 2][j] : j;
      const a = ((SPAN[0] + ((SPAN[1] - SPAN[0]) * (slot + 0.5)) / ring.n) * Math.PI) / 180;
      const x = ROOT.x + ring.r * SQUASH_X * Math.cos(a);
      const y = ROOT.y - ring.r * SQUASH_Y * Math.sin(a);
      let parent = -1;
      if (k > 0) {
        let best = Infinity;
        for (let p = prevStart; p < prevStart + prevCount; p++) {
          const d = Math.hypot(out[p].x - x, out[p].y - y);
          if (d < best) {
            best = d;
            parent = p;
          }
        }
      }
      out.push({ i: out.length, x, y, r: ring.node, ring: k, parent, brand: ring.brand, tool: k === 0 ? CHAIN_TOOLS[j] : undefined });
    }
    prevStart = start;
    prevCount = ring.n;
  });
  return out;
}

export const NODES: AgentNode[] = build();

/** Month 3's newly designed agent (the prompt bubble points at it). */
export const DESIGNED = NODES.findIndex((n) => n.ring === 1 && n.x > ROOT.x + 150);
/** Year 1's node that stumbles and heals under the watch sweep. */
export const HEALED = NODES.findIndex((n) => n.ring === 3 && n.x < ROOT.x - 280);

/** Ms per stop while playing, and the longer hold on the last one. */
export const STEP_MS = 3800;
export const HOLD_MS = 6500;

/** The left column (count + ledger) and the scrubber, in design units. */
export const COL_W = 330;
export const SCRUB = { x: 372, y: 528, w: W - 372, h: 72 };
