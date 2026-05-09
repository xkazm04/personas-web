"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  initialOffset?: number;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  initialOffset = 50,
  duration = 1.2,
  className,
}: AnimatedCounterProps) {
  const motionVal = useMotionValue(value - initialOffset);
  const display = useTransform(motionVal, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionVal, duration]);

  return <motion.span className={className}>{display}</motion.span>;
}
