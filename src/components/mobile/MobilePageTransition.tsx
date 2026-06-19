"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Per-tab enter transition for `/m`. Replaces `app/m/template.tsx`.
 *
 * A `template.tsx` triggers a spurious dev-only "unique key" warning from Next's
 * internal `OuterLayoutRouter`; keying a motion wrapper on the pathname gives
 * each tab the same slide-up + fade enter without a template file. Sits inside
 * the mobile layout's `MotionConfig reducedMotion="user"`, so reduced motion is
 * handled there (no per-component guard) — matching the old template.
 */
export default function MobilePageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
