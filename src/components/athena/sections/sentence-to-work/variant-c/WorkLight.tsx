"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import type { NodeState, WorkNode } from "./data";
import { DrawCheck } from "./parts";

/**
 * One light in the sky, and the four things it can be.
 *
 * It is ONE element for the whole loop, never a swap: the unlit ring that took
 * shape as you left simply becomes the running light, then the settled one —
 * or, for exactly one of them, the amber ring that reaches a question only you
 * can answer and holds there. Waiting is a state this component can rest in
 * indefinitely, which is the point; there is no failed state to reach.
 *
 * Reduced motion keeps every register but stops the breathing and the settle
 * ripple — the light is still lit, still amber, still finished.
 */

const LIVE_PULSE = { duration: 2.2, repeat: Infinity, ease: "easeInOut" } as const;
const WAIT_PULSE = { duration: 3.2, repeat: Infinity, ease: "easeInOut" } as const;

/** The skin of a light at each register. Tweened by CSS so a change of state
 *  is a change of colour and weight, not a new element. */
function dotStyle(state: NodeState, size: number) {
  if (state === "waiting") {
    return {
      width: size + 4,
      height: size + 4,
      backgroundColor: tint("amber", 22),
      border: `2px solid ${BRAND_VAR.amber}`,
      boxShadow: brandShadow("amber", 16, 45),
    };
  }
  const lit = state === "done";
  return {
    width: size,
    height: size,
    backgroundColor: lit ? BRAND_VAR.cyan : tint("cyan", 55),
    border: `1px solid ${tint("cyan", lit ? 90 : 40)}`,
    boxShadow: brandShadow("cyan", lit ? 18 : 12, lit ? 55 : 30),
  };
}

export function WorkLight({
  node,
  state,
  label,
  showLabel,
  faded,
  reduced,
}: {
  node: WorkNode;
  state: NodeState;
  label: string | null;
  showLabel: boolean;
  /** The answer has moved indoors; only the one still waiting keeps its words. */
  faded: boolean;
  reduced: boolean;
}) {
  const unlit = state === "dark";
  const live = state === "live" && !reduced;
  const waiting = state === "waiting";
  return (
    <>
      <motion.span
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[background-color,border-color,box-shadow,width,height] duration-500"
        style={
          unlit
            ? {
                width: node.size,
                height: node.size,
                backgroundColor: "transparent",
                border: `1px dashed ${tint("cyan", 26)}`,
              }
            : dotStyle(state, node.size)
        }
        animate={
          live
            ? { opacity: [0.55, 1, 0.55] }
            : waiting && !reduced
              ? { opacity: [0.7, 1, 0.7] }
              : { opacity: 1 }
        }
        transition={live ? LIVE_PULSE : waiting && !reduced ? WAIT_PULSE : { duration: 0.4 }}
        aria-hidden="true"
      />

      {/* The settle: one ring leaves the light and fades. Mounts on the beat,
          plays once, re-armed by the loop's rewind. */}
      {state === "done" && !reduced && (
        <motion.span
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ width: node.size, height: node.size, borderColor: tint("cyan", 60) }}
          initial={{ scale: 1, opacity: 0.9 }}
          animate={{ scale: 4.2, opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          aria-hidden="true"
        />
      )}

      {label && showLabel && (
        <motion.span
          className="absolute left-0 top-4 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap text-base"
          style={{ color: waiting ? BRAND_VAR.amber : undefined }}
          initial={reduced ? false : { opacity: 0, y: -3 }}
          animate={{ opacity: faded ? 0 : 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5 }}
        >
          {/* The check's slot is reserved from the first frame, so a light
              settling can never nudge its own words sideways. */}
          {!waiting && (
            <span className="flex h-3.5 w-3.5 shrink-0 text-brand-cyan">
              {state === "done" && <DrawCheck reduced={reduced} className="h-3.5 w-3.5" />}
            </span>
          )}
          <span className={waiting ? "" : "text-muted-dark"}>{label}</span>
        </motion.span>
      )}
    </>
  );
}
