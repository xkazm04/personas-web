"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import Avatar from "../shared/Avatar";
import FindingCard from "../shared/FindingCard";
import type { VitalsState } from "./data";
import { dayX, laneH, laneTop, QUIET_DAY, todayX, WORST_LANE, type WallLayout } from "./waves";

/**
 * Athena on the wall. She IS the playhead while she watches - a knob riding
 * under a line that sweeps every project at once, a phosphor glow
 * trailing behind it. Worst first, she leaves it and pins the day the flat
 * line began; what the project stands on is named at the foot of the pin and
 * the finding opens under it. Then she goes back to watching.
 *
 * Transform-only movement: slot-sized layers whose percent translate carries
 * the playhead and her (percent translate resolves against the layer itself).
 */

const LABEL = "text-[clamp(1rem,2.3cqh,1.375rem)]";

export default function Watcher({
  v,
  L,
  caption,
  live,
  reduced,
}: {
  v: VitalsState;
  L: WallLayout;
  caption: string | null;
  live: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const TODAY_X = todayX(L);
  const headX = L.x0 + (TODAY_X - L.x0) * v.sweep;
  const pinX = dayX(L, QUIET_DAY);
  const top = laneTop(L, WORST_LANE);
  const bottom = top + laneH(L);
  const at = v.where === "pin" ? { x: pinX, y: top - 0.5 } : { x: headX, y: L.knob };
  const sweepT = reduced ? { duration: 0 } : { duration: 0.9, ease: "linear" as const };
  const fly = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 40, damping: 13 };
  // Wide: beside her. Phone: above her, opening toward the side with room.
  const side = L.compact
    ? at.x > 40
      ? "bottom-12 right-0"
      : "bottom-12 left-0"
    : at.x > 60
      ? "right-14 top-1/2 -translate-y-1/2"
      : "left-14 top-1/2 -translate-y-1/2";
  const fade = reduced ? "" : "transition-opacity duration-500";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* The playhead: a line across every lane, glow trailing behind it */}
      <motion.div className="absolute inset-0" initial={false} animate={{ x: `${headX}%` }} transition={sweepT}>
        <span
          className="absolute -translate-x-full"
          style={{
            left: 0,
            top: `${L.lanes.y}%`,
            height: `${L.lanes.h}%`,
            width: "7%",
            background: `linear-gradient(to right, transparent, ${tint("cyan", v.sweep < 1 ? 12 : 0)})`,
            transition: reduced ? undefined : "background .6s",
          }}
        />
        <span className="absolute w-px" style={{ left: 0, top: `${L.lanes.y}%`, height: `${L.knob - L.lanes.y}%`, backgroundColor: tint("cyan", 70) }} />
      </motion.div>

      {/* The day it went quiet */}
      <div className={`absolute w-px ${fade}`} style={{ left: `${pinX}%`, top: `${top - 1}%`, height: `${bottom - top + 6}%`, backgroundColor: BRAND_VAR.rose, opacity: v.pinned ? 1 : 0 }} />
      <span
        className={`absolute whitespace-nowrap rounded-md border px-2 py-px font-mono ${LABEL} ${fade} ${L.compact ? "-translate-x-full" : "ml-1.5"}`}
        style={{
          // On a phone the names share the lanes' left edge, so it hangs from
          // the far end of the quiet span instead.
          left: `${L.compact ? TODAY_X : pinX}%`,
          top: `${bottom + 0.6}%`,
          opacity: v.pinned ? 1 : 0,
          color: v.healed ? BRAND_VAR.emerald : BRAND_VAR.rose,
          borderColor: tint(v.healed ? "emerald" : "rose", 40),
          backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
        }}
      >
        {t.athenaLab.portfolio.cause}
      </span>

      <div
        className={`absolute max-sm:inset-x-0 max-sm:bottom-0 sm:left-[var(--cx)] sm:top-[var(--cy)] sm:w-[var(--cw)] ${fade}`}
        style={{ "--cx": `${pinX}%`, "--cy": `calc(${bottom}% + 2.75rem)`, "--cw": `${TODAY_X - pinX + 2}%`, opacity: v.open ? 1 : 0 } as CSSProperties}
      >
        {v.card !== "ghost" && <FindingCard stage={v.card} beckon={v.beckon} live={live} reduced={reduced} />}
      </div>

      {/* Her */}
      <motion.div
        className="absolute inset-0 z-10"
        initial={false}
        animate={{ x: `${at.x}%`, y: `${at.y}%` }}
        transition={v.where === "playhead" && v.sweep < 1 && v.sweep > 0 ? sweepT : fly}
      >
        <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <Avatar busy={v.busy} live={live} reduced={reduced} size="h-9 w-9 sm:h-10 sm:w-10" />
            <AnimatePresence mode="wait">
              {caption && (
                <motion.div
                  key={caption}
                  initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={reduced ? { duration: 0 } : SPRING_POP}
                  className={`absolute whitespace-nowrap rounded-full border border-brand-cyan/30 bg-surface/90 px-3.5 py-1 font-mono text-brand-cyan backdrop-blur-sm ${LABEL} ${
                    side
                  }`}
                >
                  {caption}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
