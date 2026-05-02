"use client";

import { motion } from "framer-motion";

/**
 * Blinking block cursor for terminal-style UIs. Use after a typed-text
 * span (`<span>{typed}</span><BlinkingCursor />`) or as the standalone
 * "ready for input" prompt.
 */
export default function BlinkingCursor() {
  return (
    <motion.span
      className="inline-block w-2 h-4 bg-brand-cyan ml-0.5 align-middle"
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
    />
  );
}
