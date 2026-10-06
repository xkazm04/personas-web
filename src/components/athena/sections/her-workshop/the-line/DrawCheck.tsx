"use client";

import { motion } from "framer-motion";

/** A check mark that draws itself in (from the earlier Fence scene). */
export function DrawCheck({
  reduced,
  className = "h-4 w-4",
  delay = 0.12,
}: {
  reduced: boolean;
  className?: string;
  delay?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <motion.path
        d="M5 12.5 10 17.5 19 7"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.4, delay, ease: "easeOut" }}
      />
    </svg>
  );
}
