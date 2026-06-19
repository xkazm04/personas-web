"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageTransition, TRANSITION_NORMAL } from "@/lib/animations";

/**
 * Per-navigation enter transition. Replaces `app/template.tsx`.
 *
 * A `template.tsx` makes Next render the route segment as an internal list
 * inside `OuterLayoutRouter`, which emits a spurious dev-only "Each child in a
 * list should have a unique key" warning on EVERY route (the framework's own
 * list lacks keys — not our code). Keying a motion wrapper on the pathname
 * reproduces the template's remount-on-navigation enter animation without a
 * template file, so the warning is gone while the transition is preserved.
 *
 * Enter-only by design: the old template's `exit` variant was a no-op (no
 * AnimatePresence wrapped it), so this matches the prior behavior exactly.
 * Reduced-motion users get children unwrapped (no movement), as before.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();

  if (prefersReducedMotion) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      transition={TRANSITION_NORMAL}
    >
      {children}
    </motion.div>
  );
}
