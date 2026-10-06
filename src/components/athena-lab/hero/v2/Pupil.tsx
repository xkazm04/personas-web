"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { PANEL, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { CORE_R, RINGS, VB, labelAt, stateAt } from "./data";

const pct = (v: number) => `${((v / VB) * 100).toFixed(3)}%`;

/**
 * The HTML layer of "The Watch": the stream names on the rings, her pupil (a
 * real button - press it and she answers you directly), and the one sentence
 * she says when something matters. The pupil eases toward the pointer through
 * the same `--px`/`--py` the rings read.
 */
export default function Pupil({ phase, live, reduced }: { phase: number; live: boolean; reduced: boolean }) {
  const { t } = useTranslation();
  const lab = t.athenaLab.hero;
  const c = t.athenaPage.hero;
  const st = stateAt(phase);
  const [ack, setAck] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const acknowledge = () => {
    setAck(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAck(false), 2400);
  };

  const card = ack
    ? { key: "ack", kicker: null, line: c.acknowledgeLine }
    : st.speaking
      ? { key: `m${st.moment.line}`, kicker: lab.watch.streams[st.moment.ring], line: lab.moments[st.moment.line].line }
      : null;

  return (
    <>
      {RINGS.map((ring, k) => {
        const p = labelAt(k);
        const on = st.flaring && st.moment.ring === k;
        return (
          <span
            key={ring.r}
            aria-hidden="true"
            className={`pointer-events-none absolute flex -translate-x-[0.4rem] -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-background/70 py-0.5 pr-2.5 pl-1.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors duration-700 stage:text-[clamp(0.75rem,1.15cqh,1.125rem)] ${on ? "text-foreground" : "text-muted-dark"}`}
            style={{ left: pct(p.x), top: pct(p.y) }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full transition-colors duration-700"
              style={{ background: on ? BRAND_VAR.amber : tint("cyan", 60) }}
            />
            {lab.watch.streams[k]}
          </span>
        );
      })}

      <div
        className="absolute left-1/2 top-1/2 aspect-square"
        style={{
          width: pct(CORE_R * 2),
          translate: "calc(-50% + var(--px, 0) * 30px) calc(-50% + var(--py, 0) * 30px)",
          transition: "translate 0.6s cubic-bezier(0.2,0.8,0.2,1)",
        }}
      >
        <motion.button
          type="button"
          aria-label={c.orbAria}
          onClick={acknowledge}
          className="h-full w-full cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan"
          style={{
            background: `radial-gradient(circle at 42% 38%, var(--foreground) 0%, ${BRAND_VAR.cyan} 34%, ${tint("cyan", 30)} 70%, transparent 100%)`,
            boxShadow: brandShadow("cyan", 80, 55),
          }}
          initial={false}
          animate={live ? { scale: st.speaking || ack ? [1, 1.12, 1] : [1, 1.04, 1] } : { scale: st.speaking ? 1.06 : 1 }}
          transition={live ? { duration: st.speaking || ack ? 1.1 : 4.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
        />
      </div>

      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 flex justify-center px-4" style={{ top: pct(VB / 2 + CORE_R + 46) }}>
        <AnimatePresence mode="wait">
          {card && (
            <motion.div
              key={card.key}
              className={`${PANEL} flex max-w-full flex-col items-center px-6 py-3 text-center`}
              style={{ borderColor: tint(card.kicker ? "amber" : "cyan", 45) }}
              initial={reduced ? false : { opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={SPRING_POP}
            >
              {card.kicker && (
                <span className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: BRAND_VAR.amber }}>
                  {card.kicker}
                </span>
              )}
              <span className="mt-1 text-lg font-medium text-foreground stage:text-[clamp(1.125rem,2.6cqh,1.625rem)]">{card.line}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
