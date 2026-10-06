"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { SvgToolGlyph } from "./shared/ToolGlyph";
import { COUNTS, RINGS, type AgentNode, type Growth } from "./geometry";
import { ChainPulses, HealFlash, Laptop, WatchSweep, stemPath } from "./SceneParts";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The growth scene: agents branch up out of one laptop, ring by ring, as the
 * stop advances. Each stop's newcomers stem out of the agent nearest them, so
 * the fleet reads as grown from the first helper, never installed beside it.
 */
export default function Scene({ g, stage, run, still }: { g: Growth; stage: number; run: boolean; still: boolean }) {
  const { w: W, h: H, root: ROOT, nodes: NODES } = g;
  const uid = useId().replace(/:/g, "");
  const count = COUNTS[stage];
  const before = stage > 0 ? COUNTS[stage - 1] : 0;
  const t = (i: number) => (still ? { duration: 0 } : { duration: 0.55, ease: EASE, delay: i < before ? 0 : 0.15 + (i - before) * 0.045 });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="v2-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint("emerald", 30)} />
          <stop offset="1" stopColor={tint("emerald", 6)} />
        </linearGradient>
        <linearGradient id="v2-sweep" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={tint("amber", 30)} />
          <stop offset="1" stopColor={tint("amber", 0)} />
        </linearGradient>
      </defs>

      {/* Faint growth guides: where the next ring will land. */}
      {RINGS.map(({ r }, k) => (
        <path
          key={r}
          d={`M${ROOT.x - r * g.sx} ${ROOT.y} A${r * g.sx} ${r * g.sy} 0 0 1 ${ROOT.x + r * g.sx} ${ROOT.y}`}
          fill="none"
          stroke="var(--foreground)"
          strokeOpacity={k <= stage ? 0.1 : 0.05}
          strokeWidth="1.5"
          strokeDasharray="2 8"
        />
      ))}

      {/* Room to grow: every seat a future agent will take, drawn before it is filled. */}
      {NODES.map((n) => (
        <circle
          key={`g${n.i}`}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill="none"
          stroke="var(--foreground)"
          strokeOpacity={0.14}
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
      ))}

      <WatchSweep g={g} live={run && stage === 3} on={stage === 3} />

      {NODES.map((n) => (
        <motion.path
          key={`s${n.i}`}
          d={stemPath(g, n)}
          fill="none"
          stroke={n.brand ? tint(n.brand, 45) : "color-mix(in srgb, var(--foreground) 22%, transparent)"}
          strokeWidth={n.ring < 2 ? 2.5 : 1.5}
          initial={false}
          animate={{ pathLength: n.i < count ? 1 : 0, opacity: n.i < count ? 1 : 0 }}
          transition={t(n.i)}
        />
      ))}

      {stage >= 1 && <ChainPulses g={g} live={run} />}

      {NODES.map((n) => (
        <Node key={n.i} n={n} uid={uid} shown={n.i < count} transition={t(n.i)} lit={stage === 2 && n.i === g.designed} />
      ))}

      <HealFlash node={NODES[g.healed]} live={run && stage === 3} on={stage === 3} />
      <Laptop root={ROOT} />
    </svg>
  );
}

function Node({ n, uid, shown, transition, lit }: { n: AgentNode; uid: string; shown: boolean; transition: object; lit: boolean }) {
  const stroke = n.brand ? BRAND_VAR[n.brand] : "color-mix(in srgb, var(--foreground) 55%, transparent)";
  const fill = n.i === 0 ? tint("emerald", 26) : n.brand ? tint(n.brand, 20) : "color-mix(in srgb, var(--surface) 85%, transparent)";
  const g = n.r * 0.95;
  return (
    <motion.g
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      initial={false}
      animate={{ scale: shown ? 1 : 0.2, opacity: shown ? 1 : 0 }}
      transition={transition}
    >
      <circle cx={n.x} cy={n.y} r={n.r + 10} fill={n.brand ? tint(n.brand, lit ? 30 : 10) : "transparent"} />
      <circle cx={n.x} cy={n.y} r={n.r} fill={fill} stroke={n.i === 0 ? BRAND_VAR.emerald : stroke} strokeWidth={n.ring < 2 ? 2.5 : 1.8} />
      {n.tool ? (
        <SvgToolGlyph id={`${uid}-t${n.i}`} tool={n.tool} x={n.x - g / 2} y={n.y - g / 2} size={g} />
      ) : (
        <g fill={stroke}>
          <circle cx={n.x - n.r * 0.32} cy={n.y} r={Math.max(1.6, n.r * 0.14)} />
          <circle cx={n.x + n.r * 0.32} cy={n.y} r={Math.max(1.6, n.r * 0.14)} />
        </g>
      )}
    </motion.g>
  );
}
