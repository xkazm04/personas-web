"use client";

import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { DIMENSIONS } from "../../../experiment";
import type { ArenaSide } from "../../../ledger";
import Screen from "../parts/Screen";
import Trace, { r2, smooth } from "../parts/Trace";
import { instrumentCopy } from "../copy";
import { SIDE_COLOR, Y_LO, Y_HI } from "./arena";

const PAD = { l: 40, r: 84, t: 14, b: 30 };
const TICKS = [60, 70, 80, 90, 100];

/**
 * Two channels on one screen. Per round, A and B sweep on as each version's
 * six dimension scores for that input; on lock the round's means appear as
 * cursor lines at the right edge, the margin between them is bracketed and
 * the losing trace falls back to a ghost.
 */
export default function ArenaScope({
  round,
  profiles,
  means,
  winner,
  locked,
  still,
}: {
  round: number;
  profiles: Record<ArenaSide, readonly number[]>;
  means: Record<ArenaSide, number>;
  winner: ArenaSide;
  locked: boolean;
  still: boolean;
}) {
  const fade = { duration: still ? 0 : 0.4 };
  return (
    <Screen label={instrumentCopy.arena.screenLabel} pad={PAD} divisions={[5, 8]} className="h-[14rem] stage:h-auto stage:min-h-0 stage:flex-1">
      {(plot, _box, glow) => {
        const x = (i: number) => r2(plot.x + (i / (DIMENSIONS.length - 1)) * plot.w);
        const y = (v: number) => r2(plot.y + plot.h * (1 - (v - Y_LO) / (Y_HI - Y_LO)));
        const right = plot.x + plot.w;
        return (
          <>
            <g aria-hidden className="font-mono" fontSize={13} fill="currentColor" fillOpacity={0.65}>
              {TICKS.map((t) => (
                <text key={t} x={plot.x - 8} y={y(t) + 4} textAnchor="end">
                  {t}
                </text>
              ))}
              {DIMENSIONS.map((d, i) => (
                <text
                  key={d}
                  x={x(i)}
                  y={plot.y + plot.h + 20}
                  textAnchor={i === 0 ? "start" : i === DIMENSIONS.length - 1 ? "end" : "middle"}
                >
                  {labSectionCopy.eval.dimensions[d]}
                </text>
              ))}
            </g>

            {(["A", "B"] as const).map((side, s) => {
              const pts = profiles[side].map((v, i) => ({ x: x(i), y: y(v) }));
              const lose = locked && side !== winner;
              return (
                <g key={`${side}-${round}`}>
                  <Trace
                    d={smooth(pts)}
                    color={BRAND_VAR[SIDE_COLOR[side]]}
                    glow={glow}
                    dim={lose}
                    width={locked && !lose ? 2.75 : 2}
                    drawn={!still}
                    delay={s * 0.25}
                  />
                  <motion.g
                    initial={{ opacity: still ? (lose ? 0.3 : 1) : 0 }}
                    animate={{ opacity: lose ? 0.3 : 1 }}
                    transition={{ duration: still ? 0 : 0.3, delay: still || locked ? 0 : 0.9 + s * 0.25 }}
                  >
                    {pts.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--background)" stroke={BRAND_VAR[SIDE_COLOR[side]]} strokeWidth={2} />
                    ))}
                  </motion.g>
                  <motion.g initial={false} animate={{ opacity: locked ? 1 : 0 }} transition={fade}>
                    <line
                      x1={plot.x}
                      x2={right}
                      y1={y(means[side])}
                      y2={y(means[side])}
                      stroke={BRAND_VAR[SIDE_COLOR[side]]}
                      strokeOpacity={lose ? 0.35 : 0.8}
                      strokeDasharray="6 4"
                    />
                    <text
                      x={right + 22}
                      y={y(means[side]) + (side === winner ? -4 : 14)}
                      className="font-mono"
                      fontSize={14}
                      fontWeight={700}
                      fill={BRAND_VAR[SIDE_COLOR[side]]}
                    >
                      {`${side} ${means[side]}`}
                    </text>
                  </motion.g>
                </g>
              );
            })}

            <motion.path
              d={`M ${right + 6} ${y(means.A)} h 8 V ${y(means.B)} h -8`}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.7}
              strokeWidth={1.5}
              initial={false}
              animate={{ opacity: locked ? 1 : 0 }}
              transition={fade}
            />
          </>
        );
      }}
    </Screen>
  );
}
