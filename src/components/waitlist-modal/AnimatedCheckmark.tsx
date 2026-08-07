import { motion, useReducedMotion } from "framer-motion";

export function AnimatedCheckmark() {
  const reduced = useReducedMotion() ?? false;
  // Reduced motion: no draw-on. The circle and tick mount at their final state
  // so the success cue is still delivered, just without the stroke animation.
  const variants = reduced
    ? { hidden: { pathLength: 1, opacity: 1 }, visible: { pathLength: 1, opacity: 1 } }
    : { hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } };

  return (
    <motion.svg viewBox="0 0 52 52" className="h-12 w-12" initial="hidden" animate="visible">
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-brand-emerald/60"
        variants={variants}
        transition={reduced ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
      />
      <motion.path
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 27l7 7 13-13"
        className="text-brand-emerald"
        variants={variants}
        transition={reduced ? { duration: 0 } : { duration: 0.35, delay: 0.3, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
