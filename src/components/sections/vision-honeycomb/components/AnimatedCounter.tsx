"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export default function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const motionVal = useMotionValue(value - 30);
  const display = useTransform(motionVal, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionVal]);

  return <motion.span className={className}>{display}</motion.span>;
}
