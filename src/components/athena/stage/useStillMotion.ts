"use client";

/**
 * Moved to `@/hooks/useStillMotion` — it stopped being an Athena-page concern
 * the moment the same SSR defect was found in `PageTransition` (every route),
 * `TopoBackground`, `CinematicBreather` and `ReadingProgress`. This re-export
 * keeps the Athena call sites working; prefer the `@/hooks` path in new code.
 */
export { useStillMotion } from "@/hooks/useStillMotion";
