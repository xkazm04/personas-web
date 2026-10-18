"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { labSectionCopy } from "@/i18n/pending/labSection";
import Screen from "../parts/Screen";
import { polyline, r2 } from "../parts/Trace";
import NodeMark from "./NodeMark";
import { ENVELOPE, GENS, LINEAGE, LINEAGE_NODES, NODES, SPAN, Y_HI, Y_LO, Y_TICKS } from "./strip";

const PAD = { l: 40, r: 24, t: 30, b: 30 };
const INSET = 26;

/**
 * Evolution as a strip chart. A sweep cursor walks the generations; the
 * fitness envelope (weakest to fittest per generation) and the best lineage
 * trace are written up to it like a pen recorder, so the amber line climbs
 * exactly as far as the sweep has read; the faint line ahead is the previous
 * pass's persistence. Every figure is a genome node's own fitness.
 */
export default function StripChart({
  cursor,
  still,
  liveId,
  liveLabel,
}: {
  cursor: number;
  still: boolean;
  liveId: string;
  liveLabel: string;
}) {
  const e = labSectionCopy.evolution;
  const c = labSectionCopy.bench.evolution;
  const ease = { duration: still ? 0 : 0.85, ease: "easeInOut" as const };
  return (
    <Screen label={c.screenLabel} pad={PAD} divisions={[SPAN, 9]} className="h-[17rem] stage:h-auto stage:min-h-0 stage:flex-1">
      {(plot, _box, glow) => {
        const gx = (g: number) => r2(plot.x + INSET + (g / SPAN) * (plot.w - INSET * 2));
        const y = (v: number) => r2(plot.y + plot.h * (1 - (v - Y_LO) / (Y_HI - Y_LO)));
        const top = ENVELOPE.map((p) => ({ x: gx(p.gen), y: y(p.hi) }));
        const bottom = ENVELOPE.map((p) => ({ x: gx(p.gen), y: y(p.lo) })).reverse();
        const envelope = `${polyline(top)} ${polyline(bottom).replace(/^M/, "L")} Z`;
        const lineage = polyline(LINEAGE_NODES.map((n) => ({ x: gx(n.gen), y: y(n.fitness) })));
        const clipW = gx(cursor) - plot.x + 14;
        const env = ENVELOPE[cursor];
        return (
          <>
            <defs>
              <clipPath id={`${glow}-sweep`}>
                <motion.rect
                  x={plot.x}
                  y={0}
                  height={plot.y + plot.h}
                  width={plot.w}
                  style={{ originX: 0 }}
                  initial={false}
                  animate={{ scaleX: Math.min(1, clipW / plot.w) }}
                  transition={ease}
                />
              </clipPath>
            </defs>
            <g aria-hidden className="font-mono" fontSize={13} fill="currentColor" fillOpacity={0.65}>
              {Y_TICKS.map((t) => (
                <text key={t} x={plot.x - 8} y={y(t) + 4} textAnchor="end">
                  {t}
                </text>
              ))}
              {GENS.map((g) => (
                <text key={g} x={gx(g)} y={plot.y + plot.h + 20} textAnchor="middle" fillOpacity={g <= cursor ? 0.9 : 0.6}>
                  {fillTemplate(e.genAxis, { gen: g })}
                </text>
              ))}
            </g>

            <g clipPath={`url(#${glow}-sweep)`}>
              <path d={envelope} fill={tint("amber", 12)} stroke={BRAND_VAR.amber} strokeOpacity={0.35} strokeDasharray="3 4" />
              {NODES.filter((n) => n.parent && !LINEAGE.has(n.id)).map((n) => {
                const p = NODES.find((q) => q.id === n.parent)!;
                return (
                  <line
                    key={n.id}
                    x1={gx(p.gen)}
                    y1={y(p.fitness)}
                    x2={gx(n.gen)}
                    y2={y(n.fitness)}
                    stroke="currentColor"
                    strokeOpacity={0.3}
                    strokeDasharray="2 4"
                  />
                );
              })}
            </g>
            <path d={lineage} fill="none" stroke={BRAND_VAR.amber} strokeOpacity={0.15} strokeWidth={1.5} />
            <path
              d={lineage}
              fill="none"
              stroke={BRAND_VAR.amber}
              strokeWidth={2.75}
              strokeLinejoin="round"
              filter={`url(#${glow})`}
              clipPath={`url(#${glow}-sweep)`}
            />

            {NODES.map((n) => (
              <NodeMark
                key={n.id}
                n={n}
                x={gx(n.gen)}
                y={y(n.fitness)}
                on={n.gen <= cursor}
                best={n.best}
                liveId={liveId}
                liveLabel={liveLabel}
                still={still}
              />
            ))}

            <motion.g initial={false} animate={{ x: gx(cursor) }} transition={ease}>
              <line x1={0} x2={0} y1={plot.y} y2={plot.y + plot.h} stroke={BRAND_VAR.amber} strokeOpacity={0.7} />
              <path d={`M -5 ${plot.y - 8} h 10 l -5 7 z`} fill={BRAND_VAR.amber} />
              <text
                x={cursor > SPAN / 2 ? -9 : 9}
                y={plot.y - 10}
                textAnchor={cursor > SPAN / 2 ? "end" : "start"}
                className="font-mono"
                fontSize={13}
                fontWeight={700}
                fill={BRAND_VAR.amber}
              >
                {fillTemplate(c.cursor, { gen: cursor, value: env.hi })}
              </text>
            </motion.g>
          </>
        );
      }}
    </Screen>
  );
}
