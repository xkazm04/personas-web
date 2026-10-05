"use client";

import { motion } from "framer-motion";
import { timedLoop } from "../shared/scene-kit";

interface TypedLineProps {
  text: string;
  tone: string;
  /** The caret may blink (an ambient loop). */
  live: boolean;
  /** Reduced motion: the line is simply there. */
  still: boolean;
}

/**
 * The firing condition typed in, character by character, behind a prompt
 * mark, with a caret. Screen readers get the whole line once (sr-only); the
 * typed characters are presentation.
 */
export default function TypedLine({ text, tone, live, still }: TypedLineProps) {
  return (
    <span className="inline-flex items-baseline gap-2 font-mono text-[clamp(1rem,3cqh,1.375rem)] text-foreground">
      <span aria-hidden="true" style={{ color: tone }}>
        &rsaquo;
      </span>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((ch, i) => (
          <motion.span
            key={i}
            initial={still ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.01, delay: still ? 0 : 0.55 + i * 0.035 }}
          >
            {ch}
          </motion.span>
        ))}
        <motion.span
          className="ml-0.5 inline-block h-[1.05em] w-[0.5em] translate-y-[0.15em] rounded-[2px]"
          style={{ backgroundColor: tone }}
          initial={false}
          animate={live ? { opacity: [1, 1, 0, 0] } : { opacity: 0.85 }}
          transition={timedLoop(live, 1.1, [0, 0.5, 0.55, 1], "linear")}
        />
      </span>
    </span>
  );
}
