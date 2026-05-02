"use client";

import { motion } from "framer-motion";

/**
 * A single line of terminal output with a fade-in entrance animation.
 *
 * Takes flat props (not a `line` object) so the primitive doesn't lock
 * into any particular OutputLine shape. Consumers map their own
 * domain-typed line to (text, colorClass, indent) at the call site.
 */
export default function TerminalLine({
  text,
  colorClass,
  indent = 0,
  index = 0,
  indentPx = 8,
}: {
  text: string;
  colorClass: string;
  indent?: number;
  index?: number;
  indentPx?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.03 }}
      className={`font-mono text-base leading-relaxed ${colorClass}`}
      style={{ paddingLeft: indent ? `${indent * indentPx}px` : undefined }}
    >
      <span style={{ whiteSpace: "pre" }}>{text || " "}</span>
    </motion.div>
  );
}
