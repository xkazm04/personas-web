"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function TypingIndicator({ color }: { color: string }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div className="flex items-center gap-1 px-3 py-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1.5 w-1.5 rounded-full ${color}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${color}`}
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
