"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { labSectionCopy } from "@/i18n/pending/labSection";
import { CAPS } from "../Frame";
import { beat } from "../useOnAir";
import { broadcastCopy } from "../copy";
import { LEAGUE_SIZE, tier, type Attribute } from "./stats";

/**
 * The six attribute bars: score as a slanted bar, the baseline as a tick on
 * the same track, the delta, and the attribute's league rank. Bars grow by
 * transform only, so switching the scouted version re-tweens in place.
 */
export default function AttributeRows({ attributes, moving }: { attributes: Attribute[]; moving: boolean }) {
  const c = broadcastCopy.eval;
  const dims = labSectionCopy.eval.dimensions;
  return (
    <ol className="flex h-full flex-col justify-between gap-1.5" aria-label={c.attributes}>
      {attributes.map((a, i) => {
        const tone = a.delta > 0 ? "emerald" : a.delta < 0 ? "rose" : null;
        const tierKey = tier(a.score);
        return (
          <li key={a.key} className="grid grid-cols-[6rem_minmax(0,1fr)_auto] items-center gap-x-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto]">
            <span className={`${CAPS} truncate text-base text-foreground`}>{dims[a.key]}</span>
            <span className="relative h-2.5 rounded-sm bg-foreground/[0.07]">
              <motion.span
                className="absolute inset-y-0 left-0 w-full origin-left -skew-x-12 rounded-sm"
                style={{ background: `linear-gradient(90deg, ${tint("emerald", 55)}, ${BRAND_VAR.emerald})` }}
                initial={moving ? { scaleX: 0 } : false}
                animate={{ scaleX: a.score / 100 }}
                transition={beat(moving, 0.7, 0.15 + i * 0.08)}
              />
              <span aria-hidden className="absolute -inset-y-1 w-0.5 rounded-full bg-foreground/70" style={{ left: `${a.baseline}%` }} />
            </span>
            <span className="flex items-baseline gap-2">
              <span className="w-8 text-right font-mono text-lg font-black italic leading-none tabular-nums text-foreground">{a.score}</span>
              <span className="w-9 text-right font-mono text-sm font-semibold tabular-nums" style={{ color: tone ? BRAND_VAR[tone] : "color-mix(in srgb, var(--foreground) 70%, transparent)" }}>
                {a.delta > 0 ? `+${a.delta}` : a.delta === 0 ? "±0" : a.delta}
              </span>
              <span
                className={`${CAPS} hidden w-16 text-right text-sm sm:inline stage:hidden [@container(min-height:34rem)]:inline`}
                style={{ color: tierKey === "elite" ? BRAND_VAR.amber : tierKey === "pro" ? BRAND_VAR.emerald : "color-mix(in srgb, var(--foreground) 75%, transparent)" }}
              >
                {c.tiers[tierKey]}
              </span>
              <span className="w-8 text-right font-mono text-sm tabular-nums text-foreground/80">
                <span aria-hidden>#{a.rank}</span>
                <span className="sr-only">{fillTemplate(c.rankAria, { rank: a.rank, total: LEAGUE_SIZE })}</span>
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
