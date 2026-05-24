"use client";

import { motion, useReducedMotion } from "framer-motion";
import { pageTransition, TRANSITION_NORMAL } from "@/lib/animations";

export default function Template({ children }: { children: React.ReactNode }) {
  // pageTransition is a translate-Y enter/exit — per the gating contract in
  // @/lib/animations, animations with significant movement must short-circuit
  // when the user prefers reduced motion. Returns children unwrapped so the
  // route tree mounts/unmounts without the extra div + animation.
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return <>{children}</>;

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TRANSITION_NORMAL}
    >
      {children}
    </motion.div>
  );
}
