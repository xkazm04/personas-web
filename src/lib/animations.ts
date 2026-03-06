import type { Variants } from "framer-motion";

// ── Standardized ease curve ──────────────────────────────────────────
// Used across all transition presets for a consistent spring-like feel.
const EASE_CURVE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ── Framer Motion transition presets ─────────────────────────────────
// instant (100ms) → tooltips, micro-interactions
// fast    (150ms) → dropdowns, toggles, small state changes
// normal  (250ms) → panels, modals, drawers, standard transitions
// slow    (400ms) → page transitions, wizard steps, large reveals
export const TRANSITION_INSTANT = { duration: 0.1, ease: EASE_CURVE };
export const TRANSITION_FAST = { duration: 0.15, ease: EASE_CURVE };
export const TRANSITION_NORMAL = { duration: 0.25, ease: EASE_CURVE };
export const TRANSITION_SLOW = { duration: 0.4, ease: EASE_CURVE };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const revealFromBelow: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};
