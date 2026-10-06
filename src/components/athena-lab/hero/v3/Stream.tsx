"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { EVENTS, TRAVEL, travelAt } from "./data";

/** Seamless ruler drift: one tick spacing per loop, so the strip never jumps. */
const RULER_DRIFT = { x: [0, -48] };
const TICK_STEP = 1 / TRAVEL;

/**
 * The line and what flows along it. Back to front: a ruler of time ticks
 * drifting left (time passing), the line of light itself, and the day's
 * events - small chips on stems - travelling right to left across her. Each
 * event is a full-width layer translated by its travel (transform only);
 * every tick hands framer the NEXT position with a 1s linear glide, so the
 * flow is continuous while the clock stays discrete. While she speaks
 * (`hushed`) the passing chips fall back so nothing talks over her.
 */
export default function Stream({ phase, live, reduced, hushed }: { phase: number; live: boolean; reduced: boolean; hushed: boolean }) {
  const { t } = useTranslation();
  const lab = t.athenaLab.hero;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[var(--line-y)] h-0">
      {/* Ruler: time passing under the line */}
      <div className="absolute inset-x-0 top-2 h-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <motion.div
          className="absolute -left-12 -right-12 top-0 h-full"
          style={{ background: `repeating-linear-gradient(to right, ${tint("cyan", 30)} 0 1px, transparent 1px 48px)` }}
          animate={live ? RULER_DRIFT : undefined}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* The line of light */}
      <div
        className="absolute inset-x-0 -top-px h-0.5"
        style={{ background: `linear-gradient(to right, transparent, ${tint("cyan", 55)} 18%, ${BRAND_VAR.cyan} 50%, ${tint("cyan", 55)} 82%, transparent)` }}
      />
      <div
        className="absolute inset-x-0 -top-4 h-8 blur-md"
        style={{ background: `linear-gradient(to right, transparent, ${tint("cyan", 14)} 30%, ${tint("cyan", 28)} 50%, ${tint("cyan", 14)} 70%, transparent)` }}
      />

      {/* The day's events */}
      {EVENTS.map((e) => {
        const now = travelAt(e, phase);
        if (now === null) return null;
        const next = reduced ? now : Math.min(now + TICK_STEP, e.kind === "matter" ? 0.5 : 1);
        const matter = e.kind === "matter";
        // Passing events fade near the edges and dim as they cross her.
        const fade = Math.min(1, now * 6, (1 - now) * 6) * (Math.abs(now - 0.5) < 0.08 ? 0.55 : 1);
        return (
          <motion.div
            key={e.id}
            className="absolute inset-x-0 top-0 h-0"
            initial={{ x: `${(1 - now) * 100}%` }}
            animate={{ x: `${(1 - next) * 100}%` }}
            transition={{ duration: live ? 1 : 0, ease: "linear" }}
          >
            <motion.div
              className="absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: matter ? (now >= 0.5 ? 0 : Math.min(1, now * 6 + 0.2)) : fade * (hushed ? 0.3 : 0.9) }}
              transition={{ duration: 0.6 }}
            >
              <span
                className={`whitespace-nowrap rounded-full border border-solid bg-background/80 px-3 py-1 font-mono uppercase tracking-[0.14em] backdrop-blur-sm ${matter ? "text-sm text-foreground stage:text-[clamp(0.875rem,1.3cqh,1.25rem)]" : "text-xs text-muted-dark stage:text-[clamp(0.75rem,1.1cqh,1.0625rem)]"}`}
                style={{ borderColor: matter ? tint("amber", 70) : "rgba(var(--surface-overlay), 0.14)" }}
              >
                {matter ? lab.moments[e.copy].event : lab.quiet.passed[e.copy]}
              </span>
              <span className="h-7 w-px" style={{ background: matter ? tint("amber", 60) : "rgba(var(--surface-overlay), 0.18)" }} />
              <span
                className="h-2 w-2 translate-y-1/2 rounded-full"
                style={{ background: matter ? BRAND_VAR.amber : tint("cyan", 60), boxShadow: matter ? `0 0 14px ${BRAND_VAR.amber}` : undefined }}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
