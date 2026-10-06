"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { BARS, momentAt } from "./data";

/**
 * Athena on the line: the bright point at its centre (a real button - press
 * it and she answers you), the voice the line swells into when she speaks,
 * and the one sentence she says. At rest every bar is a hairline, so the
 * voice is literally the line itself, risen.
 */
export default function Voice({ phase, live, reduced }: { phase: number; live: boolean; reduced: boolean }) {
  const { t } = useTranslation();
  const lab = t.athenaSections.hero;
  const c = t.athenaPage.hero;
  const mo = momentAt(phase);
  const [ack, setAck] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const acknowledge = () => {
    setAck(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAck(false), 2600);
  };

  const speaking = mo.speaking || ack;
  const said = ack
    ? { key: "ack", line: c.acknowledgeLine }
    : mo.speaking
      ? { key: `m${mo.m}`, line: lab.moments[mo.m].line }
      : null;

  return (
    <div className="absolute inset-x-0 top-[var(--line-y)] h-0">
      {/* The voice: the line, risen */}
      <div className="pointer-events-none absolute left-1/2 top-0 flex h-[var(--wave-h)] w-[min(52%,64rem)] -translate-x-1/2 -translate-y-1/2 items-center gap-[0.25%]">
        {BARS.map((b, i) => {
          const peak = Math.max(0.03, b.env * b.jitter);
          return (
            <motion.span
              key={i}
              className="h-full flex-1 rounded-full"
              style={{ background: `linear-gradient(to bottom, ${tint("cyan", 30)}, ${BRAND_VAR.cyan}, ${tint("cyan", 30)})` }}
              initial={false}
              animate={
                speaking && live
                  ? { scaleY: [peak * 0.3, peak, peak * 0.5, peak * 0.85, peak * 0.3], opacity: 1 }
                  : { scaleY: speaking ? peak * 0.7 : 0.012, opacity: speaking ? 1 : 0.6 }
              }
              transition={
                speaking && live
                  ? { scaleY: { duration: 0.9 + (i % 7) * 0.09, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.3 } }
                  : { duration: 0.7, ease: "easeOut" }
              }
            />
          );
        })}
      </div>

      {/* Her: the point everything crosses */}
      <div className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 stage:h-[clamp(1.25rem,2.6cqh,2.25rem)] stage:w-[clamp(1.25rem,2.6cqh,2.25rem)]">
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-solid"
          style={{ borderColor: BRAND_VAR.amber }}
          initial={false}
          animate={mo.arriving && live ? { opacity: [0.9, 0], scale: [1, 4.5] } : { opacity: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <button
          type="button"
          aria-label={c.orbAria}
          onClick={acknowledge}
          className="relative h-full w-full cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan"
          style={{
            background: `radial-gradient(circle at 40% 35%, var(--foreground), ${BRAND_VAR.cyan} 55%)`,
            boxShadow: `${brandShadow("cyan", 30, 70)}, ${brandShadow("cyan", 90, 35)}`,
          }}
        />
        <span className={`pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.2em] text-muted-dark transition-opacity duration-500 ${speaking ? "opacity-0" : "opacity-100"}`}>
          {lab.quiet.now}
        </span>
      </div>

      {/* What she says */}
      <div
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 flex justify-center px-6"
        style={{ bottom: "calc(var(--wave-h) / 2 + 1.25rem)" }}
      >
        <AnimatePresence mode="wait">
          {said && (
            <motion.p
              key={said.key}
              className="flex flex-col items-center text-center"
              initial={reduced ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={SPRING_POP}
            >
              <span className="mt-2 text-2xl font-semibold tracking-tight text-foreground stage:text-[clamp(1.5rem,6.2cqh,3.25rem)]">
                {said.line}
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
