"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { PANEL, PANEL_ACTIVE, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY, SURFACES } from "./data";

/**
 * The single two-level attention bar the six panels collapse into.
 * Level 1: six mono chips, each inheriting its panel's badge count.
 * Level 2: one keyboard-accessible peek — hover/focus a chip and it
 * lifts (PANEL_ACTIVE seam) while a one-line strip below the bar shows
 * what the chip holds, proving nothing was lost, only quieted.
 *
 * All motion gates through `animate` props (markup identical either
 * way); under reduced motion the bar simply sits in its end-state.
 */
export default function AttentionBar({ collapsed }: { collapsed: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = SURFACES.find((s) => s.id === activeId) ?? null;
  const still = { duration: 0 } as const;

  return (
    <div className="absolute inset-x-2 bottom-2">
      <motion.div
        aria-label={COPY.barAria}
        role="group"
        className={`${PANEL} flex items-center gap-1.5 overflow-x-auto rounded-xl px-2 py-1.5`}
        initial={false}
        animate={{ opacity: collapsed ? 1 : 0, y: collapsed ? 0 : 12 }}
        transition={reduced ? still : { ...SPRING_POP, delay: collapsed ? 0.28 : 0 }}
        style={{ pointerEvents: collapsed ? "auto" : "none" }}
      >
        {SURFACES.map((s, i) => {
          const isActive = activeId === s.id;
          return (
            <motion.button
              key={s.id}
              type="button"
              aria-label={`${s.label} — ${s.peek}`}
              onMouseEnter={() => setActiveId(s.id)}
              onMouseLeave={() => setActiveId((cur) => (cur === s.id ? null : cur))}
              onFocus={() => setActiveId(s.id)}
              onBlur={() => setActiveId((cur) => (cur === s.id ? null : cur))}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/80 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan/60 ${
                isActive ? "border-glass-hover bg-surface/80" : "border-glass bg-surface/60"
              }`}
              initial={false}
              animate={{
                opacity: collapsed ? 1 : 0,
                scale: collapsed ? 1 : 0.6,
                y: isActive && !reduced ? -3 : 0,
              }}
              transition={reduced ? still : { ...SPRING_POP, delay: collapsed ? 0.32 + i * 0.06 : 0 }}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: BRAND_VAR[s.accent] }}
              />
              {s.label}
              <span
                className="rounded-full px-1.5 py-px"
                style={{ background: tint(s.accent, 16), color: BRAND_VAR[s.accent] }}
              >
                {s.count}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Level 2 — the peek strip. aria-live announces the focused chip's line. */}
      <div aria-live="polite" className="absolute inset-x-0 top-full z-10 mt-2">
        {active && (
          <motion.p
            className={`${PANEL_ACTIVE} mx-auto w-fit max-w-full truncate rounded-lg px-3 py-1.5 font-mono text-[11px] text-brand-cyan/80`}
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? still : { duration: 0.18, ease: "easeOut" }}
          >
            {active.peek}
          </motion.p>
        )}
      </div>
    </div>
  );
}
