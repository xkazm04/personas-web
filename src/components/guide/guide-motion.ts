import type { Variants } from "framer-motion";

/**
 * Reduced-motion stand-ins for the guide's reveal animations.
 *
 * Every guide list (category grid, category topics, related topics, the hub
 * header, the Discord CTA) reveals *content* with `staggerContainer` +
 * `fadeUp`. Per the animation contract in `src/lib/animations.ts`, a
 * content-bearing reveal must render its END STATE immediately under
 * `prefers-reduced-motion` — never `null`, never a hidden/pending state.
 *
 * These two variant maps keep the exact same variant NAMES, so a call site
 * swaps only the `variants` prop and keeps its `initial="hidden"` /
 * `animate="visible"` / `whileInView="visible"` wiring untouched. The result
 * is fully painted from the first frame: no 30px translate, no opacity ramp,
 * no per-child stagger delay (which is the part that actually hurts — a
 * reduced-motion reader would otherwise wait ~1.3s for the last card of a
 * twelve-item grid to appear).
 *
 * Usage:
 * ```tsx
 * const reduced = useReducedMotion() ?? false;
 * <motion.div variants={reduced ? STATIC_CONTAINER : staggerContainer} …>
 *   <motion.div variants={reduced ? STATIC_ITEM : fadeUp} />
 * ```
 */
export const STATIC_CONTAINER: Variants = {
  hidden: {},
  visible: {},
};

export const STATIC_ITEM: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};
