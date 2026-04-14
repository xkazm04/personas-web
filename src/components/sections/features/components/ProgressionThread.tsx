"use client";

import { motion } from "framer-motion";
import type { Feature } from "../types";

export default function ProgressionThread({ features }: { features: Feature[] }) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 bottom-0 hidden md:flex flex-col items-center"
      style={{ width: 32 }}
    >
      <motion.div
        className="absolute inset-x-3.75 top-6 bottom-6 w-px border-l border-dashed border-white/6"
        variants={{
          hidden: { scaleY: 0 },
          visible: { scaleY: 1, transition: { duration: 1.2, delay: 0.3, ease: "easeOut" } },
        }}
        style={{ transformOrigin: "top" }}
      />
      {features.map((f, i) => (
        <motion.div
          key={f.number}
          className="absolute flex items-center justify-center"
          style={{ top: i === 0 ? 28 : `calc(50% + ${(i - 1) * 80 - 40}px)`, left: 8 }}
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: {
              scale: 1,
              opacity: 1,
              transition: { delay: 0.4 + i * 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          <div
            className={`flex items-center justify-center rounded-full border text-base font-mono font-bold tabular-nums ${
              i === 0
                ? "h-7 w-7 border-brand-purple/30 bg-brand-purple/10 text-brand-purple shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                : "h-5 w-5 border-white/8 bg-white/3 text-white/70"
            }`}
          >
            {f.number}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
