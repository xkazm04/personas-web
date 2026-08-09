"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION, PANEL, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY, MESSAGES, SURFACES } from "./data";
import { useCollapsePhase } from "./useCollapsePhase";
import AttentionBar from "./AttentionBar";

/**
 * The Collapse — six competing notification panels tower cramped above a
 * miniature transcript, then compress with spring physics into the single
 * attention bar. The header region's height literally animates down and
 * the transcript (flex-1) absorbs the freed space: the payoff is SPACE,
 * rendered. An annotation ledger beside the bar confirms conservation.
 *
 * Replays on every viewport re-entry via useCollapsePhase; reduced motion
 * pins the collapsed end-state (animate props gated, markup identical).
 */

const STACK_H = 284;
const COLLAPSED_H = 60;
const PANEL_TILT = [-1.6, 1.2, -0.9, 1.8, -1.2, 0.9] as const;
const still = { duration: 0 } as const;

export default function CollapseScene() {
  const { ref, reduced, inView, collapsed } = useCollapsePhase<HTMLDivElement>();
  const uid = useId();
  const spring = (delay: number) => (reduced ? still : { ...SPRING_POP, delay });

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-xl">
      {/* The app window — everything happens on this one glass surface */}
      <div className={`${PANEL} flex h-[480px] flex-col overflow-hidden`}>
        <div className="flex h-9 shrink-0 items-center gap-2 border-b border-glass px-3">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-foreground/20" />
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-foreground/20" />
          <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-dark">
            {COPY.windowTitle}
          </span>
        </div>

        {/* Header region — its height IS the story: 284px of clamor → 60px */}
        <motion.div
          className="relative shrink-0"
          initial={false}
          animate={{ height: collapsed ? COLLAPSED_H : STACK_H }}
          transition={spring(collapsed ? 0.12 : 0)}
        >
          {SURFACES.map((s, i) => (
            <motion.div
              key={s.id}
              aria-hidden={collapsed}
              className={`${PANEL} absolute inset-x-3 rounded-xl px-3 py-2`}
              style={{ top: 8 + i * 42, zIndex: SURFACES.length - i }}
              initial={false}
              animate={
                !inView
                  ? { opacity: 0, y: -14, scaleY: 1, rotate: PANEL_TILT[i] }
                  : collapsed
                    ? { opacity: 0, y: 46, scaleY: 0.25, rotate: 0 }
                    : { opacity: 1, y: 0, scaleY: 1, rotate: PANEL_TILT[i] }
              }
              transition={spring(collapsed ? i * 0.045 : 0.1 + i * 0.09)}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/70">
                  {s.label}
                </span>
                <span
                  className="ml-auto rounded-full px-1.5 font-mono text-[10px]"
                  style={{ background: tint(s.accent, 16), color: BRAND_VAR[s.accent] }}
                >
                  {s.count}
                </span>
              </div>
              <div aria-hidden="true" className="mt-1.5 h-1.5 w-2/3 rounded-full bg-foreground/10" />
            </motion.div>
          ))}

          <AttentionBar collapsed={collapsed} />
        </motion.div>

        {/* The transcript — breathes wider as the freed space returns */}
        <motion.div
          aria-label={COPY.transcriptAria}
          className="flex min-h-0 flex-1 flex-col justify-end px-4 pb-4 pt-2"
          initial={false}
          animate={{ gap: collapsed ? 14 : 5 }}
          transition={spring(collapsed ? 0.2 : 0)}
        >
          {MESSAGES.map((m, i) => (
            <motion.div
              key={i}
              className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs leading-relaxed ${
                m.from === "you" ? "self-end text-foreground" : `self-start border border-glass bg-surface/60 text-foreground/80`
              }`}
              style={m.from === "you" ? { background: tint("cyan", 14) } : undefined}
              initial={false}
              animate={{ opacity: m.extra && !collapsed ? 0 : 1, y: m.extra && !collapsed ? 8 : 0 }}
              transition={spring(collapsed ? 0.3 + i * 0.05 : 0)}
            >
              {m.text}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Conservation ledger — beside the bar on md+, leader line pointing in */}
      <motion.div
        className="pointer-events-none absolute left-full top-[64px] ml-1 hidden w-52 items-center gap-1 md:flex"
        initial={false}
        animate={{ opacity: collapsed ? 1 : 0, x: collapsed ? 0 : -8 }}
        transition={spring(collapsed ? 0.45 : 0)}
      >
        <svg width="34" height="6" aria-hidden="true" className="shrink-0">
          <defs>
            <linearGradient id={`${uid}-lead`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={tint("cyan", 0)} />
              <stop offset="1" stopColor={tint("cyan", 55)} />
            </linearGradient>
          </defs>
          <line x1="0" y1="3" x2="34" y2="3" stroke={`url(#${uid}-lead)`} strokeWidth="1" />
          <circle cx="32" cy="3" r="2" fill={tint("cyan", 70)} />
        </svg>
        <p className={`${ANNOTATION} normal-case tracking-[0.08em]`}>{COPY.ledger}</p>
      </motion.div>

      {/* Mobile ledger — same confirmation, below the window */}
      <motion.p
        className={`${ANNOTATION} mt-3 text-center normal-case tracking-[0.08em] md:hidden`}
        initial={false}
        animate={{ opacity: collapsed ? 1 : 0 }}
        transition={spring(collapsed ? 0.45 : 0)}
      >
        {COPY.ledger}
      </motion.p>
    </div>
  );
}
