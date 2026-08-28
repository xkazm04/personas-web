"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageTransition, TRANSITION_NORMAL } from "@/lib/animations";
import { useStillMotion } from "@/hooks/useStillMotion";

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
 * Reduced-motion users get no movement — but they still get the wrapper.
 *
 * That last point is load-bearing. This component wraps EVERY route, and it
 * used to return `<>{children}</>` when the preference was set. framer's
 * `useReducedMotion` answers `null` on the server and the real preference on
 * the client's first render, so for a reduced-motion visitor the server sent
 * a wrapper element the client's first render did not produce — a structural
 * hydration mismatch spanning the whole page body, on every navigation. React
 * recovers by discarding and re-rendering the entire tree on the client: the
 * most work possible for precisely the visitors who asked for less.
 *
 * Two changes fix it, and both matter. `useStillMotion` makes the preference
 * SSR-safe (and live). Gating the ANIMATION PROPS rather than the element
 * keeps DOM shape constant across the correcting commit, so the accommodation
 * costs a stopped animation instead of a full-page reflow.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useStillMotion();
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      variants={prefersReducedMotion ? undefined : pageTransition}
      initial={prefersReducedMotion ? false : "initial"}
      animate={prefersReducedMotion ? undefined : "animate"}
      transition={prefersReducedMotion ? undefined : TRANSITION_NORMAL}
    >
      {children}
    </motion.div>
  );
}
