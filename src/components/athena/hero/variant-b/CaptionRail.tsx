"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ANNOTATION, ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { CAPTIONS } from "./data";

/**
 * CaptionRail — the page's console-annotation voice narrating the sequence.
 * One row per phase beat: a machine token in real op grammar (`listening`,
 * `show_fleet_plan`, `fleet_dispatch · 3 rows`, `claimed 8/8 — idempotent`)
 * with a human caption beside the active one. The rail is the kp
 * "annotation as caption" lesson translated to op grammar.
 */

interface Props {
  /** Index into CAPTIONS of the currently active beat. */
  active: number;
}

export default function CaptionRail({ active }: Props) {
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="mt-4 space-y-1 border-t border-glass pt-3">
      {CAPTIONS.map((c, i) => {
        const on = i === active;
        return (
          <motion.div
            key={c.token}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
            initial={false}
            animate={{ opacity: on ? 1 : 0.7 }}
            transition={reduced ? { duration: 0 } : { duration: 0.3 }}
          >
            <span aria-hidden="true" className={on ? ANNOTATION : ANNOTATION_DIM}>
              {on ? "›" : "·"}
            </span>
            <span className={on ? ANNOTATION : ANNOTATION_DIM}>{c.token}</span>
            {on && (
              <motion.span
                className="text-xs text-foreground/60"
                initial={reduced ? false : { opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.25 }}
              >
                {c.caption}
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
