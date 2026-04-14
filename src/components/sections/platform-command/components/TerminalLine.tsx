"use client";

import { motion } from "framer-motion";
import { colorClasses } from "../data";
import type { OutputLine } from "../types";

export default function TerminalLine({
  line,
  index,
}: {
  line: OutputLine;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.03 }}
      className={`font-mono text-base leading-relaxed ${colorClasses[line.color]}`}
      style={{ paddingLeft: line.indent ? `${line.indent * 8}px` : undefined }}
    >
      <span style={{ whiteSpace: "pre" }}>{line.text || "\u00A0"}</span>
    </motion.div>
  );
}
