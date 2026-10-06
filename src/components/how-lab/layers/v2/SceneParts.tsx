"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { loopTransition } from "@/lib/motion/loop-gate";
import { NODES, ROOT, type AgentNode } from "./geometry";

/** Static and looping pieces of the growth scene, all in 1320x600 SVG units. */

const EM = BRAND_VAR.emerald;

/** The one laptop it all grows from - unchanged at every stop. */
export function Laptop() {
  const sx = ROOT.x - 112;
  return (
    <g aria-hidden>
      <ellipse cx={ROOT.x} cy={ROOT.y + 130} rx="230" ry="26" fill={tint("emerald", 14)} />
      <rect x={sx} y={ROOT.y} width="224" height="118" rx="12" fill={tint("emerald", 9)} stroke={tint("emerald", 70)} strokeWidth="2.5" />
      <rect x={sx + 12} y={ROOT.y + 12} width="200" height="94" rx="6" fill="url(#v2-screen)" />
      {/* The screen shows your keys staying home: a keyring with its key in it. */}
      <circle cx={ROOT.x - 20} cy={ROOT.y + 58} r="17" fill="none" stroke={EM} strokeWidth="3" />
      <circle cx={ROOT.x - 20} cy={ROOT.y + 58} r="6.5" fill="none" stroke={EM} strokeWidth="3" />
      <path d={`M${ROOT.x - 13} ${ROOT.y + 58} H${ROOT.x + 30} M${ROOT.x + 20} ${ROOT.y + 58} V${ROOT.y + 67} M${ROOT.x + 28} ${ROOT.y + 58} V${ROOT.y + 64}`} stroke={EM} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d={`M${sx - 34} ${ROOT.y + 122} H${sx + 258} L${sx + 240} ${ROOT.y + 138} H${sx - 16} Z`} fill={tint("emerald", 20)} stroke={tint("emerald", 55)} strokeWidth="2" />
    </g>
  );
}

/** A curved stem from a node's parent (or the laptop) up to the node. */
export function stemPath(n: AgentNode): string {
  const p = n.parent < 0 ? ROOT : NODES[n.parent];
  const cx = p.x + (n.x - p.x) * 0.15;
  const cy = p.y + (n.y - p.y) * 0.75;
  return `M${p.x} ${p.y} Q${cx} ${cy} ${n.x} ${n.y}`;
}

/** Week 2 on: the helper's finish fans out to the next two agents. */
export function ChainPulses({ live }: { live: boolean }) {
  const [mid, right, left] = [NODES[0], NODES[1], NODES[2]];
  return (
    <g aria-hidden>
      {[right, left].map((to, k) => {
        const mx = (mid.x + to.x) / 2;
        const my = Math.min(mid.y, to.y) - 34;
        return (
          <g key={to.i}>
            <path d={`M${mid.x} ${mid.y} Q${mx} ${my} ${to.x} ${to.y}`} fill="none" stroke={tint("cyan", 55)} strokeWidth="2.5" strokeDasharray="5 6" />
            <motion.circle
              r="6"
              fill={BRAND_VAR.cyan}
              style={{ filter: `drop-shadow(0 0 6px ${tint("cyan", 80)})` }}
              initial={false}
              animate={
                live
                  ? { cx: [mid.x, (mid.x + mx) / 2, (mx + to.x) / 2, to.x], cy: [mid.y, (mid.y + my) / 2 - 6, (my + to.y) / 2 - 6, to.y], opacity: [0, 1, 1, 0] }
                  : { cx: mx, cy: my + 17, opacity: 1 }
              }
              transition={loopTransition(live, { duration: 1.3, ease: "easeInOut", delay: 0.5 * k, repeatDelay: 0.9 })}
            />
          </g>
        );
      })}
    </g>
  );
}

/** How far the watch sweep reaches: past the outer ring, short of the art's top edge. */
const REACH = 350;

/** Year 1: a watch sweep crosses the fleet from the laptop. */
export function WatchSweep({ live, on }: { live: boolean; on: boolean }) {
  return (
    <motion.g
      aria-hidden
      style={{ transformBox: "view-box", transformOrigin: `${ROOT.x}px ${ROOT.y}px` }}
      initial={false}
      animate={live ? { rotate: [-68, 68, -68], opacity: 1 } : { rotate: -44, opacity: on ? 1 : 0 }}
      transition={live ? loopTransition(live, { duration: 7, ease: "easeInOut" }) : { duration: 0.4 }}
    >
      <defs>
        <linearGradient id="v2-sweep-line" gradientUnits="userSpaceOnUse" x1={ROOT.x} y1={ROOT.y} x2={ROOT.x} y2={ROOT.y - REACH}>
          <stop offset="0" stopColor={BRAND_VAR.amber} stopOpacity="0.9" />
          <stop offset="1" stopColor={BRAND_VAR.amber} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${ROOT.x} ${ROOT.y} L${ROOT.x - 58} ${ROOT.y - REACH} L${ROOT.x + 58} ${ROOT.y - REACH} Z`} fill="url(#v2-sweep)" />
      <line x1={ROOT.x} y1={ROOT.y} x2={ROOT.x} y2={ROOT.y - REACH} stroke="url(#v2-sweep-line)" strokeWidth="2.5" />
    </motion.g>
  );
}

/** Year 1: one node stumbles (rose) and comes back healed (emerald). */
export function HealFlash({ node, live, on }: { node: AgentNode; live: boolean; on: boolean }) {
  return (
    <g aria-hidden>
      <motion.circle
        cx={node.x}
        cy={node.y}
        r={node.r + 7}
        fill="none"
        stroke={BRAND_VAR.rose}
        strokeWidth="3"
        initial={false}
        animate={live ? { opacity: [0, 1, 1, 0, 0] } : { opacity: 0 }}
        transition={loopTransition(live, { duration: 3.4, ease: "easeInOut", repeatDelay: 1 })}
      />
      <motion.circle
        cx={node.x}
        cy={node.y}
        r={node.r + 7}
        fill="none"
        stroke={EM}
        strokeWidth="3"
        initial={false}
        animate={live ? { opacity: [0, 0, 0, 1, 1] } : { opacity: on ? 1 : 0 }}
        transition={loopTransition(live, { duration: 3.4, ease: "easeInOut", repeatDelay: 1 })}
      />
    </g>
  );
}
