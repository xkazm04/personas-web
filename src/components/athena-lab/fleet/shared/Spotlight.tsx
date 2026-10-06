"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import type { Point } from "./types";

const W = 560;
const H = 440;

/**
 * The key light follows the story. One soft pool rests on whatever is
 * happening - the sentence while you speak it, the team while it works, the
 * answer when it lands - and glides between them, so the eye is led rather
 * than told. Transform-only; under reduced motion it simply sits on the
 * pinned frame's act.
 */
export default function Spotlight({ at, reduced }: { at: Point; reduced: boolean }) {
  return (
    <motion.span
      className="pointer-events-none absolute left-0 top-0"
      style={{
        width: W,
        height: H,
        background: `radial-gradient(closest-side, ${tint("cyan", 13)}, ${tint("cyan", 4)} 55%, transparent)`,
      }}
      initial={false}
      animate={{ x: at.x - W / 2, y: at.y - H / 2 }}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 22, damping: 14 }}
      aria-hidden="true"
    />
  );
}
