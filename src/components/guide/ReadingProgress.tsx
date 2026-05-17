"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export default function ReadingProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 30, mass: 0.4 });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-[60px] left-0 right-0 z-40 h-0.5 origin-left bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-cyan"
    />
  );
}
