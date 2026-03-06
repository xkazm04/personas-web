"use client";

import { motion } from "framer-motion";
import { pageTransition, TRANSITION_NORMAL } from "@/lib/animations";

export default function Template({ children }: { children: React.ReactNode }) {
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
