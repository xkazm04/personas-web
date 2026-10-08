"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { AGENT, CUSTOMER, SCRIPT, mix } from "./shared/scenarios";

/** The one customer message, and the fork that sends the very same words to
 *  both systems. Remounted per scenario (keyed by the parent), so the send
 *  beat - bubble rises, both branches draw, a spark runs down each - replays
 *  every time; under reduced motion it renders already sent. */
export default function CustomerFork({ label, message, still }: { label: string; message: string; still: boolean }) {
  const enter = (delay: number) => (still ? { initial: false as const } : { initial: "off", animate: "on", transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const } });

  return (
    <div className="relative flex shrink-0 flex-col items-center">
      <motion.div
        {...enter(0)}
        variants={{ off: { opacity: 0, y: 14, scale: 0.97 }, on: { opacity: 1, y: 0, scale: 1 } }}
        className="relative z-[1] mb-3 flex max-w-[min(100%,46rem)] items-start gap-3 md:mb-0 rounded-2xl rounded-bl-md border px-4 py-2.5"
        style={{
          borderColor: mix(CUSTOMER, 40),
          background: `linear-gradient(135deg, ${mix(CUSTOMER, 14)}, ${mix(CUSTOMER, 5)})`,
          boxShadow: `0 18px 40px -24px ${mix(CUSTOMER, 70)}, inset 0 1px 0 ${mix(CUSTOMER, 30)}`,
        }}
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: mix(CUSTOMER, 20), color: CUSTOMER }}>
          <User className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-xs uppercase tracking-[0.16em]" style={{ color: CUSTOMER }}>
            {label}
          </span>
          <span className="block text-lg leading-snug text-foreground">&ldquo;{message}&rdquo;</span>
        </span>
      </motion.div>

      {/* The fork: one message, two copies - drawn from the bubble to the
          top of each window. Hidden on the stacked phone layout. */}
      <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className="hidden h-7 w-full md:block" aria-hidden fill="none">
        {[
          { d: "M500 0 C 500 30, 232 10, 232 40", color: SCRIPT },
          { d: "M500 0 C 500 30, 768 10, 768 40", color: AGENT },
        ].map((b, i) => (
          <motion.path
            key={i}
            d={b.d}
            stroke={b.color}
            strokeOpacity={0.9}
            strokeWidth={2.5}
            vectorEffect="non-scaling-stroke"
            initial={still ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.05, ease: "easeOut" }}
          />
        ))}
      </svg>
    </div>
  );
}
