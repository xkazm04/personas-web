"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { ANNOTATION, ANNOTATION_DIM, PANEL } from "@/components/athena/stage/athena-tokens";
import { COPY } from "../data";
import DecisionCard from "./DecisionCard";
import OrbSurface from "./OrbSurface";

/**
 * The scene — chat panel (first surface) and miniature orb (second
 * surface) joined by a thin trace line: the decision's only two possible
 * homes. `open` decides which home renders the DecisionCard; the shared
 * layoutId makes the swap read as one object hopping between them.
 *
 * Stacks vertically under md (chat above, orb below — the trace turns
 * vertical); the hop pulse rides the trace and is keyed by `hopTick` so
 * it replays per flip. Reduced motion: pulse never renders (decorative),
 * the static trace and both homes stay identical.
 */
export default function SurfaceScene({ open, hopTick }: { open: boolean; hopTick: number }) {
  const reduced = useReducedMotion() ?? false;
  const layoutId = useId();

  return (
    <div
      role="group"
      aria-label={COPY.sceneAria}
      className="flex w-full flex-col items-center md:flex-row md:items-center"
    >
      {/* Surface 1 — the chat window (dims to a closed shell when off) */}
      <div
        className={`${PANEL} w-full max-w-sm p-4 transition-opacity duration-300 ${open ? "" : "opacity-60"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className={ANNOTATION}>{COPY.chat.title}</span>
          {!open && <span className={`${ANNOTATION_DIM} text-[10px]`}>{COPY.chat.closedTag}</span>}
        </div>
        <div className="mt-3 space-y-2">
          {COPY.chat.messages.map((line) => (
            <p key={line} className="max-w-[90%] rounded-xl border border-glass bg-surface/80 px-3 py-2 text-xs leading-relaxed text-foreground/80">
              {line}
            </p>
          ))}
        </div>
        {/* The chat home — reserved so the panel never jumps on a hop */}
        <div className="mt-3 min-h-[104px]">
          {open && <DecisionCard home="chat" layoutId={layoutId} />}
        </div>
      </div>

      {/* Trace line — the decision's flight path between its two homes */}
      <div className="relative h-14 w-px shrink-0 md:h-px md:w-auto md:min-w-16 md:flex-1" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: tint("cyan", 22) }} />
        {hopTick > 0 && !reduced && (
          <motion.div
            key={hopTick}
            className="absolute inset-0"
            style={{
              background: tint("cyan", 75),
              transformOrigin: open ? "100% 100%" : "0% 0%",
              boxShadow: `0 0 8px ${tint("cyan", 45)}`,
            }}
            initial={{ scaleX: 0, scaleY: 0, opacity: 1 }}
            animate={{ scaleX: 1, scaleY: 1, opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        )}
      </div>

      {/* Surface 2 — the orb, with its dock (above on md, below on mobile) */}
      <div className="flex shrink-0 flex-col items-center">
        <div className="order-2 flex w-full min-h-[124px] items-start justify-center pt-3 md:order-1 md:items-end md:justify-end md:pb-3 md:pt-0">
          {!open && <DecisionCard home="orb" layoutId={layoutId} />}
        </div>
        <div className="order-1 md:order-2">
          <OrbSurface />
        </div>
      </div>
    </div>
  );
}
