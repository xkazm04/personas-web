"use client";

import { motion } from "framer-motion";
import type { DesignCopy, DimCopy } from "../shared/copy";
import { inkA, type DimKey } from "../shared/dims";
import Sentence from "../shared/Sentence";
import { LABEL_SIZE, textInk } from "./Callout";
import { TYPE_MS, u } from "./geometry";

/**
 * The sheet's brief line: the visitor's sentence, typed and read. When
 * Personas needs the visitor, the line turns into its question, with the
 * answers as real buttons.
 */
export default function Band({
  copy,
  run,
  typing,
  read,
  asking,
  moving,
  onAnswer,
}: {
  copy: DesignCopy;
  run: number;
  typing: boolean;
  read: boolean;
  asking?: DimCopy;
  moving: boolean;
  onAnswer: (dim: DimKey, i: number) => void;
}) {
  const fade = { duration: moving ? 0.35 : 0 };
  return (
    <div className="absolute" style={{ left: u(20), right: u(190), top: u(12), height: u(66) }}>
      <motion.div className="absolute inset-0 flex flex-col justify-center" initial={false} animate={{ opacity: asking ? 0 : 1 }} transition={fade}>
        <span className="font-mono font-bold uppercase tracking-[0.16em] text-brand-cyan" style={{ fontSize: LABEL_SIZE }}>
          {copy.lab.yourSentence}
        </span>
        <Sentence
          key={run}
          sentence={copy.sentence}
          dims={copy.dims}
          typing={typing}
          lit={() => read}
          moving={moving}
          typeMs={TYPE_MS}
          className="mt-[0.3cqw] font-semibold leading-tight text-foreground"
          style={{ fontSize: "max(20px, 2.3cqw)" }}
        />
      </motion.div>

      {asking?.question && (
        <motion.div
          key={asking.key}
          className="absolute inset-0 flex flex-col justify-center"
          initial={{ opacity: 0, y: moving ? 8 : 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade}
        >
          <span className="font-mono font-bold uppercase tracking-[0.16em]" style={{ fontSize: LABEL_SIZE, color: textInk(asking.ink) }}>
            {copy.lab.asks} &middot; {asking.label}
          </span>
          <div className="mt-[0.4cqw] flex flex-wrap items-center gap-x-[1.4cqw] gap-y-2">
            <span className="font-semibold text-foreground" style={{ fontSize: "max(20px, 2.1cqw)" }}>
              {asking.question.prompt}
            </span>
            <span className="flex gap-[0.6cqw]">
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
                      fontSize: "max(14px, 1.3cqw)",
                      padding: "0.35cqw 1.1cqw",
                      borderColor: suggested ? asking.ink : "var(--border-glass-hover)",
                      backgroundColor: suggested ? inkA(asking.ink, 18) : "rgba(var(--surface-overlay), 0.04)",
                    }}
                  >
                    {suggested && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: asking.ink }} />}
                    {opt}
                  </button>
                );
              })}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
