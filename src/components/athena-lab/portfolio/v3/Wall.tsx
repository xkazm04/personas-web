"use client";

import { motion } from "framer-motion";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { Check } from "../shared/FindingCard";
import type { VitalsState } from "./data";
import { ATTENTION_LANES, BUSY, dayX, LANES, laneMid, laneTop, todayX, WORST_LANE, type WallLayout } from "./waves";

/**
 * The words on the wall: your week across the top, each project's name at
 * the head of its lane, and the two ends of time along the bottom.
 *
 * Your week is the "while you are busy elsewhere" made literal - a launch, an
 * offsite, hiring, board prep - sitting right above the two weeks the wall
 * was watching for you. Wide, its blocks line up with the days they took;
 * on a phone it is a row of chips under its label, and each name rides its
 * own lane on a scrim.
 */

const LABEL = "text-[clamp(1rem,2.3cqh,1.375rem)]";
const MONO = "font-mono uppercase tracking-[0.14em]";
const CHIP = { borderColor: tint("purple", 35), backgroundColor: tint("purple", 12) };

export default function Wall({ v, L, reduced }: { v: VitalsState; L: WallLayout; reduced: boolean }) {
  const { t } = useTranslation();
  const { projects, field } = t.athenaPage.portfolio;
  const lab = t.athenaLab.portfolio;
  const pop = (i: number) => ({
    initial: false as const,
    animate: { opacity: i < v.week ? 1 : 0, scale: i < v.week ? 1 : 0.92 },
    transition: reduced ? { duration: 0 } : SPRING_POP,
  });

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Your week */}
      {L.compact ? (
        <div className="absolute inset-x-0 top-0 flex flex-col gap-1.5">
          <span className={`${MONO} text-base text-brand-purple`}>{lab.you}</span>
          <span className="flex gap-1">
            {lab.busy.map((b, i) => (
              <motion.span key={b} className="whitespace-nowrap rounded-lg border px-1.5 text-base text-foreground" style={CHIP} {...pop(i)}>
                {b}
              </motion.span>
            ))}
          </span>
        </div>
      ) : (
        <>
          <span
            className={`absolute left-0 flex items-center truncate text-brand-purple ${MONO} ${LABEL}`}
            style={{ top: `${L.you.y}%`, height: `${L.you.h}%`, width: `${L.nameW}%` }}
          >
            {lab.you}
          </span>
          {BUSY.map(([a, b], i) => (
            <motion.span
              key={i}
              className={`absolute flex items-center justify-center whitespace-nowrap rounded-lg border px-2 text-foreground ${LABEL}`}
              style={{
                ...CHIP,
                left: `${dayX(L, a)}%`,
                width: `${dayX(L, b) - dayX(L, a)}%`,
                top: `${L.you.y + 1}%`,
                height: `${L.you.h - 2}%`,
              }}
              {...pop(i)}
            >
              {lab.busy[i]}
            </motion.span>
          ))}
        </>
      )}

      {/* Names */}
      {LANES.slice(0, L.n).map((p, j) => {
        const worst = j === WORST_LANE && v.marked;
        const attention = v.sorted && ((ATTENTION_LANES as readonly number[]).includes(j) || (j === WORST_LANE && !v.marked));
        const accent = worst ? (v.healed ? "emerald" : "rose") : attention ? "amber" : null;
        return (
          <span
            key={p}
            className={`absolute left-0 flex items-center gap-1.5 whitespace-nowrap ${LABEL} ${
              L.compact ? "rounded-md px-1.5" : "-translate-y-1/2"
            } ${accent ? "font-medium" : v.sorted ? "text-muted-dark" : "text-foreground"} ${
              reduced ? "" : "transition-colors duration-500"
            }`}
            style={{
              top: `${L.compact ? laneTop(L, j) : laneMid(L, j)}%`,
              color: accent ? BRAND_VAR[accent] : undefined,
              backgroundColor: L.compact ? "color-mix(in srgb, var(--background) 75%, transparent)" : undefined,
            }}
          >
            {worst && v.healed ? (
              <Check reduced={reduced} />
            ) : (
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent ? BRAND_VAR[accent] : tint("cyan", 45) }} />
            )}
            {projects[p]}
            {worst && v.healed && <span className="text-muted-dark max-lg:hidden">{field.handled}</span>}
          </span>
        );
      })}

      {/* Two weeks ago ... today */}
      <span className={`absolute -translate-y-1/2 text-muted-dark ${MONO} ${LABEL}`} style={{ left: `${L.x0}%`, top: `${L.axis}%` }}>
        {lab.axisStart}
      </span>
      <span
        className={`absolute -translate-x-1/2 -translate-y-1/2 text-brand-cyan ${MONO} ${LABEL} max-sm:-translate-x-full`}
        style={{ left: `${todayX(L)}%`, top: `${L.axis}%` }}
      >
        {lab.axisNow}
      </span>
    </div>
  );
}
