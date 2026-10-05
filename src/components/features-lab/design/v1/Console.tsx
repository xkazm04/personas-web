"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { DesignCopy, DimCopy } from "../shared/copy";
import { DIMS, inkA, type DimKey } from "../shared/dims";
import Sentence from "../shared/Sentence";
import { placeStyle, PLACE, TYPE_MS } from "./layout";
import { textInk } from "./Tile";

const LABEL = { fontSize: "max(12px, 1.05cqw)" } as const;

/**
 * The centre of the matrix: the visitor's sentence, typed and then read (the
 * words that drove a decision light in its ink). When Personas needs the
 * visitor it asks here, with real buttons; the suggested answer is taken when
 * the beat runs out. Finished, it turns emerald and names the agent.
 */
export default function Console({
  copy,
  run,
  typing,
  lit,
  asking,
  askMs,
  countdown,
  resolved,
  done,
  status,
  moving,
  onAnswer,
}: {
  copy: DesignCopy;
  run: number;
  typing: boolean;
  lit: (dim: DimKey) => boolean;
  asking?: DimCopy;
  askMs: number;
  countdown: boolean;
  resolved: (dim: DimKey) => boolean;
  done: boolean;
  status: string;
  moving: boolean;
  onAnswer: (dim: DimKey, i: number) => void;
}) {
  const accent = done ? "var(--brand-emerald)" : "var(--brand-purple)";
  const count = DIMS.filter((d) => resolved(d.key)).length;
  return (
    <div
      className="absolute flex flex-col overflow-hidden border-2 transition-[border-color,box-shadow] duration-700"
      style={{
        ...placeStyle(PLACE.core),
        borderRadius: "1.3cqw",
        padding: "1.1cqw 1.4cqw",
        borderColor: inkA(accent, 55),
        boxShadow: `0 0 4cqw ${inkA(accent, 26)}, inset 0 0 3cqw ${inkA(accent, 12)}`,
        background: `radial-gradient(120% 90% at 50% 0%, ${inkA(accent, 16)}, transparent 65%), color-mix(in srgb, var(--background) 92%, transparent)`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono font-bold uppercase tracking-[0.16em]" style={{ ...LABEL, color: textInk(accent) }}>
          <Sparkles className="h-[1.2em] w-[1.2em]" aria-hidden="true" />
          {copy.lab.yourSentence}
        </span>
        <span className="font-mono uppercase tracking-wider text-foreground/70" style={LABEL}>
          {status}
        </span>
      </div>

      <Sentence
        key={run}
        sentence={copy.sentence}
        dims={copy.dims}
        typing={typing}
        lit={lit}
        moving={moving}
        typeMs={TYPE_MS}
        className="mt-[0.7cqw] font-medium leading-snug text-foreground"
        style={{ fontSize: "max(18px, 1.85cqw)", opacity: asking ? 0 : 1, transition: moving ? "opacity .3s" : "none" }}
      />

      <div className="mt-auto flex items-center gap-[0.9cqw]">
        <div className="flex flex-1 gap-[0.35cqw]" aria-hidden="true">
          {DIMS.map((d) => (
            <span
              key={d.key}
              className="h-[0.42cqw] flex-1 rounded-full transition-colors duration-500"
              style={{ backgroundColor: resolved(d.key) ? d.ink : "rgba(var(--surface-overlay), 0.1)" }}
            />
          ))}
        </div>
        {done ? (
          <span className="font-semibold" style={{ fontSize: "max(16px, 1.45cqw)", color: textInk(accent) }}>
            {copy.lab.persona}
          </span>
        ) : (
          <span className="font-mono tabular-nums text-foreground/85" style={LABEL}>
            {copy.decided(count)}
          </span>
        )}
      </div>

      <AnimatePresence>
        {asking?.question && (
          <motion.div
            key={asking.key}
            className="absolute inset-0 flex flex-col justify-center"
            style={{ padding: "1.1cqw 1.6cqw", background: `radial-gradient(120% 100% at 50% 0%, ${inkA(asking.ink, 18)}, transparent 70%), color-mix(in srgb, var(--background) 97%, transparent)` }}
            initial={{ opacity: 0, y: moving ? 12 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: moving ? -8 : 0 }}
            transition={{ duration: moving ? 0.35 : 0 }}
          >
            <span className="font-mono font-bold uppercase tracking-[0.16em]" style={{ ...LABEL, color: textInk(asking.ink) }}>
              {copy.lab.asks} &middot; {asking.label}
            </span>
            <span className="mt-[0.5cqw] font-semibold leading-snug text-foreground" style={{ fontSize: "max(18px, 1.75cqw)" }}>
              {asking.question.prompt}
            </span>
            <div className="mt-[1cqw] flex gap-[0.6cqw]">
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
                      fontSize: "max(14px, 1.15cqw)",
                      padding: "0.4cqw 1cqw",
                      borderColor: suggested ? asking.ink : "rgba(var(--surface-overlay), 0.22)",
                      backgroundColor: suggested ? inkA(asking.ink, 22) : "rgba(var(--surface-overlay), 0.05)",
                    }}
                  >
                    {suggested && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: asking.ink }} />}
                    {opt}
                  </button>
                );
              })}
            </div>
            <motion.span
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-[0.25cqw]"
              style={{ backgroundColor: asking.ink }}
              initial={{ width: "100%" }}
              animate={{ width: countdown ? "0%" : "100%" }}
              transition={{ duration: countdown ? askMs / 1000 : 0, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
