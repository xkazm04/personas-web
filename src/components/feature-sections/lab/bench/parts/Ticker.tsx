"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";

/**
 * A mono numeral that ticks to `value` like an instrument readout settling.
 * It starts at `from` (server and first paint), counts up on mount and
 * re-counts from wherever it is whenever `value` changes. Reduced motion
 * jumps straight to the value. The DOM is one span either way.
 */
export default function Ticker({
  value,
  from = 0,
  decimals = 0,
  signed = false,
  suffix = "",
  duration = 0.9,
}: {
  value: number;
  from?: number;
  decimals?: number;
  signed?: boolean;
  suffix?: string;
  duration?: number;
}) {
  const still = useStillMotion();
  const mv = useMotionValue(still ? value : from);
  const text = useTransform(mv, (v) => {
    const fixed = v.toFixed(decimals);
    const sign = signed && v > 0 && Number(fixed) !== 0 ? "+" : "";
    return `${sign}${fixed}${suffix}`;
  });

  useEffect(() => {
    // A zero-length animation rather than mv.set: it lands on the frame loop,
    // after the span has subscribed, so the still value always paints.
    const ctl = animate(mv, value, still ? { duration: 0 } : { duration, ease: [0.22, 1, 0.36, 1] });
    return () => ctl.stop();
  }, [value, still, mv, duration]);

  return <motion.span className="tabular-nums">{text}</motion.span>;
}
