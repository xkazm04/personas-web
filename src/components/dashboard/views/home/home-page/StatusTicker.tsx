"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { TONE_CLASS, useTickerItems } from "./useTickerItems";
import { useStillMotion } from "@/hooks/useStillMotion";

const ROTATE_MS = 3600;

/**
 * Status Ticker — the slim live-status strip under the cockpit. Rotates through
 * fleet vitals (success, agents online, providers, next routine, open alerts —
 * see `useTickerItems` for which of those are demo-only). Auto-advances only
 * when motion is allowed, the tab is visible and nothing has paused it;
 * otherwise it lays every item out statically. The web counterpart to the
 * desktop overview's Status Ticker.
 */
export function StatusTicker({
  successRate,
  agents,
  loading = false,
}: {
  successRate: number;
  agents: number;
  /** True until the first execution fetch settles — see the ladder below. */
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const labels = t.dashboard.home.cockpit;
  const reduced = useStillMotion();
  const hidden = usePageVisibility();
  const items = useTickerItems({ successRate, agents });

  const [index, setIndex] = useState(0);
  // Three independent pause sources. Hover and focus are transient (WCAG 2.2.2
  // needs the rotation to stop while a keyboard user is reading it, not just a
  // mouse user); `manualPaused` is the explicit, visible control and survives
  // blur so a stopped ticker stays stopped.
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const paused = hoverPaused || focusPaused || manualPaused;
  const count = items.length;

  useEffect(() => {
    if (reduced || hidden || paused || loading || count <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(timer);
  }, [reduced, hidden, paused, loading, count]);

  // Keep the index in range if the item count shrinks (e.g. alerts clear).
  const safeIndex = index % count;
  const active = items[safeIndex];
  const ActiveIcon = active.icon;

  return (
    <div
      data-tour-diagram="dashboard-ticker"
      className="flex items-center gap-3 overflow-hidden rounded-xl border border-glass bg-white/[0.02] px-4 py-2.5"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={() => setFocusPaused(false)}
    >
      <span className="flex flex-shrink-0 items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          {!reduced && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-dark">
          {labels.tickerLabel}
        </span>
      </span>

      <span aria-hidden className="h-4 w-px flex-shrink-0 bg-glass" />

      {/* Until the executions land, the strip shows the same spinner the rest
          of the dashboard uses rather than ticking a fabricated "Fleet success
          0%" as its opening frame. */}
      {loading ? (
        <div className="flex min-w-0 flex-1 items-center py-1" aria-hidden>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-glass-hover border-t-brand-cyan" />
        </div>
      ) : reduced ? (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <span key={item.id} className="flex items-center gap-1.5 text-sm">
                <Icon className={`h-3.5 w-3.5 ${TONE_CLASS[item.tone]}`} />
                <span className="text-muted-dark">{item.label}</span>
                <span className="font-semibold text-foreground">{item.value}</span>
              </span>
            );
          })}
        </div>
      ) : (
        <>
          {/* Polite live region: the rotating item is the only place these
              values appear, so a screen reader has to hear each frame.
              `mode="wait"` keeps exactly one item mounted at a time, so the
              region never announces two frames at once. */}
          <div className="relative min-w-0 flex-1" aria-live="polite" aria-atomic="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={active.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center gap-1.5 text-sm"
              >
                <ActiveIcon className={`h-3.5 w-3.5 flex-shrink-0 ${TONE_CLASS[active.tone]}`} />
                <span className="text-muted-dark">{active.label}</span>
                <span className="truncate font-semibold text-foreground">{active.value}</span>
              </motion.span>
            </AnimatePresence>
          </div>
          <div aria-hidden className="flex flex-shrink-0 items-center gap-1">
            {items.map((item, i) => (
              <span
                key={item.id}
                className={`h-1.5 rounded-full transition-all ${
                  i === safeIndex ? "w-4 bg-emerald-400/80" : "w-1.5 bg-white/15"
                }`}
              />
            ))}
          </div>
          {/* WCAG 2.2.2: auto-updating content needs a user-reachable stop.
              Focusing anywhere in the strip already pauses it; this is the
              visible, persistent control. */}
          <button
            type="button"
            onClick={() => setManualPaused((p) => !p)}
            aria-pressed={manualPaused}
            aria-label={manualPaused ? labels.tickerResume : labels.tickerPause}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-glass text-muted-dark transition-colors hover:border-glass-hover hover:text-foreground focus-ring focus-visible:ring-offset-0"
          >
            {manualPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        </>
      )}
    </div>
  );
}
