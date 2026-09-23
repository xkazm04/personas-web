"use client";

import { motion } from "framer-motion";
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
 *
 * Reduced motion is gated in CSS, and ONLY in CSS - this component must not
 * read the preference in JS at all. Two past versions each cost reduced-motion
 * visitors their whole server-rendered page:
 *
 * 1. Returning `<>{children}</>` when reduced: framer's `useReducedMotion` is
 *    `null` on the server, so the server sent a wrapper the client's first
 *    render did not produce - a structural hydration mismatch.
 * 2. Gating `initial`/`animate` on `useStillMotion`: SSR-safe, but the value
 *    corrects one commit after hydration, and framer re-publishes
 *    `initial`/`animate` as MotionContext. That context change reaches the
 *    route's `loading.tsx` Suspense boundary (directly below) while it is still
 *    streaming, and React answers an update to a pending dehydrated boundary by
 *    discarding the streamed HTML and client-rendering the page - silently: no
 *    hydration error, no overlay (e2e/reduced-motion-hydration.spec.ts).
 *
 * So every prop is constant, and `motion-reduce:` overrides framer's inline
 * opacity/transform with `!important`: still from the first paint, even before
 * hydration, and never a re-render of anything below.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      className="motion-reduce:opacity-100! motion-reduce:transform-none!"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      transition={TRANSITION_NORMAL}
    >
      {children}
    </motion.div>
  );
}
