"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Blinking block cursor for terminal-style UIs. Use after a typed-text
 * span (`<span>{typed}</span><BlinkingCursor />`) or as the standalone
 * "ready for input" prompt.
 */
export default function BlinkingCursor() {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.span
      className="inline-block w-2 h-4 bg-brand-cyan ml-0.5 align-middle"
      animate={reduced ? { opacity: 1 } : { opacity: [1, 0] }}
      transition={reduced ? undefined : { duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
    />
  );
}
