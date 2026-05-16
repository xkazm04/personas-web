import { motion } from "framer-motion";

export function AnimatedCheckmark() {
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
        variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <motion.path
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 27l7 7 13-13"
        className="text-brand-emerald"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
        transition={{ duration: 0.35, delay: 0.3, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
