"use client";

import { motion } from "framer-motion";

export default function BlinkingCursor() {
  return (
    <motion.span
      className="inline-block w-2 h-4 bg-brand-cyan ml-0.5 align-middle"
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
    />
  );
}
