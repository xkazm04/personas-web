"use client";

import { motion, useReducedMotion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION, PANEL_ACTIVE, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY } from "../data";

/**
 * The one pending decision — rendered by BOTH homes under exactly
 * complementary conditions. A shared `layoutId` lets framer-motion morph
 * it between the chat slot and the orb dock (the "hop"); under reduced
 * motion the same markup swaps instantly (transition zeroed, never the
 * markup itself).
 *
 * The Approve/Deny chips are miniature product UI, not live controls —
 * they stay non-focusable spans so the section's only real control is
 * the chat toggle.
 */
export default function DecisionCard({
  home,
  layoutId,
}: {
  home: "chat" | "orb";
  layoutId: string;
}) {
  const reduced = useReducedMotion() ?? false;
  const bubble = home === "orb";

  return (
    <motion.div
      layoutId={layoutId}
      initial={reduced ? false : { rotate: bubble ? 2.5 : -2.5, scale: 0.95 }}
      animate={reduced ? undefined : { rotate: 0, scale: 1 }}
      transition={reduced ? { duration: 0 } : SPRING_POP}
      className={`${PANEL_ACTIVE} p-3 text-left ${bubble ? "w-56" : "w-full"}`}
      style={{ boxShadow: brandShadow("cyan", 28, 20) }}
    >
      <span className={`${ANNOTATION} block text-[10px]`}>{COPY.decision.op}</span>
      <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">
        {COPY.decision.title}
      </p>
      <div className="mt-2.5 flex gap-2">
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold text-brand-cyan"
          style={{ backgroundColor: tint("cyan", 14), outline: `1px solid ${tint("cyan", 35)}`, outlineOffset: "-1px" }}
        >
          {COPY.decision.approve}
        </span>
        <span className="rounded-full border border-glass px-3 py-1 text-xs font-semibold text-muted-dark">
          {COPY.decision.deny}
        </span>
      </div>
    </motion.div>
  );
}
