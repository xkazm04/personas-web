"use client";

import { motion } from "framer-motion";

/**
 * Next remounts a `template` on every navigation, so this gives each `/m` tab
 * a quick enter transition (slide-up + fade, ease-out, ~220ms). It sits inside
 * the layout's MotionConfig, so reduced-motion users get the opacity fade only.
 */
export default function MobileTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
