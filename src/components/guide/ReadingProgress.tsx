"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";

import { CHROME_TOP_PROGRESS } from "./guide-chrome";

export default function ReadingProgress() {
  const reduced = useStillMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 30, mass: 0.4 });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className={`fixed ${CHROME_TOP_PROGRESS} left-0 right-0 z-40 h-0.5 origin-left bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-cyan`}
    />
  );
}
