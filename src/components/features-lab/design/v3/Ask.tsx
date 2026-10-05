"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { DesignCopy, DimCopy } from "../shared/copy";
import { inkA, type DimKey } from "../shared/dims";
import { CX, CY, u } from "./geometry";

const CARD = { w: 310, h: 190 };

/**
 * When Personas needs the visitor, the question opens over the heart of the
 * flower (the asking petal pulses behind it). Real buttons; the suggested
 * answer is taken if the beat runs out.
 */
export default function Ask({ copy, asking, moving, onAnswer }: { copy: DesignCopy; asking?: DimCopy; moving: boolean; onAnswer: (dim: DimKey, i: number) => void }) {
  return (
    <AnimatePresence>
      {asking?.question && (
        <motion.div
          key={asking.key}
          className="absolute flex flex-col items-center justify-center rounded-2xl border text-center"
          style={{
            left: u(CX - CARD.w / 2),
            top: u(CY - CARD.h / 2),
            width: u(CARD.w),
            height: u(CARD.h),
            padding: "1cqw 1.4cqw",
            borderColor: inkA(asking.ink, 60),
            background: `radial-gradient(90% 80% at 50% 0%, ${inkA(asking.ink, 16)}, transparent 70%), color-mix(in srgb, var(--background) 94%, transparent)`,
            boxShadow: `0 0 3cqw ${inkA(asking.ink, 25)}`,
          }}
          initial={{ opacity: 0, scale: moving ? 0.9 : 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: moving ? 0.94 : 1 }}
          transition={{ duration: moving ? 0.3 : 0 }}
        >
          <span className="font-mono font-bold uppercase tracking-[0.16em]" style={{ fontSize: "max(12px, 1.1cqw)", color: `color-mix(in oklab, ${asking.ink} 78%, var(--foreground))` }}>
            {copy.lab.asks}
          </span>
          <span className="mt-[0.4cqw] font-semibold leading-snug text-foreground" style={{ fontSize: "max(17px, 1.7cqw)" }}>
            {asking.question.prompt}
          </span>
          <span className="mt-[0.9cqw] flex flex-wrap justify-center gap-[0.5cqw]">
            {asking.question.options.map((opt, i) => {
              const suggested = i === asking.question?.picked;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onAnswer(asking.key, i)}
                  aria-label={suggested ? `${opt} (${copy.lab.suggested})` : opt}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60"
                  style={{
                    fontSize: "max(14px, 1.2cqw)",
                    padding: "0.3cqw 0.9cqw",
                    borderColor: suggested ? asking.ink : "var(--border-glass-hover)",
                    backgroundColor: suggested ? inkA(asking.ink, 20) : "rgba(var(--surface-overlay), 0.04)",
                  }}
                >
                  {suggested && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: asking.ink }} />}
                  {opt}
                </button>
              );
            })}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
