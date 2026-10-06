"use client";

import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import type { StartState } from "./data";
import { box, type Rect } from "./layout";

/**
 * Your one decision. The team is assembled and its rings are drawn, and
 * nothing turns until you press Start - the pointer comes in, the button
 * gives under it, and only then do all four rings move at once. A drawn
 * picture of a control (the scene is an illustration), so it stays out of
 * the tab order.
 */
export default function StartControl({ rect, state, reduced }: { rect: Rect; state: StartState; reduced: boolean }) {
  const { t } = useTranslation();
  const plan = t.athenaPage.fleet.plan;
  const status = t.athenaPage.fleet.status;
  const shown = state !== "hidden";
  const waiting = state === "waiting";
  const label = state === "done" ? plan.done : state === "working" || state === "pressed" ? plan.working : plan.start;
  const hint = state === "done" ? status.closingShort : waiting ? status.yourCallShort : status.parallelShort;
  return (
    <motion.div
      className="absolute flex items-center gap-3 rounded-2xl border px-4"
      style={{ ...box(rect), borderColor: tint("cyan", shown ? 22 : 8), backgroundColor: tint("cyan", shown ? 4 : 2) }}
      initial={false}
      animate={{ opacity: shown ? 1 : 0.35 }}
      transition={{ duration: reduced ? 0 : 0.5 }}
    >
      {shown && (
        <motion.span
          key={hint}
          className="min-w-0 flex-1 whitespace-nowrap text-sm text-muted-dark"
          initial={reduced ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.35 }}
        >
          {hint}
        </motion.span>
      )}
      <motion.span
        className="relative ml-auto flex items-center gap-2 rounded-full border px-4 py-1.5 text-base font-semibold"
        style={{
          color: BRAND_VAR.cyan,
          borderColor: tint("cyan", waiting ? 60 : 36),
          backgroundColor: tint("cyan", waiting ? 18 : 10),
          boxShadow: waiting ? brandShadow("cyan", 22, 36) : undefined,
        }}
        initial={false}
        animate={
          reduced || !shown
            ? { scale: 1 }
            : waiting
              ? { scale: [1, 1.05, 1] }
              : state === "pressed"
                ? { scale: [0.92, 1] }
                : { scale: 1 }
        }
        transition={waiting && !reduced ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.35 }}
      >
        <motion.span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: BRAND_VAR.cyan }}
          animate={state === "working" && !reduced ? { opacity: [1, 0.25, 1] } : { opacity: 1 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
        {label}
        {/* You, pressing it */}
        <motion.span
          className="absolute -bottom-3 right-1 text-foreground"
          initial={false}
          animate={
            waiting || state === "pressed"
              ? { opacity: 1, x: 0, y: 0, scale: state === "pressed" && !reduced ? [1, 0.82, 1] : 1 }
              : { opacity: 0, x: 18, y: 14, scale: 1 }
          }
          transition={{ duration: reduced ? 0 : 0.45 }}
          aria-hidden="true"
        >
          <MousePointer2 className="h-5 w-5 fill-current" />
        </motion.span>
      </motion.span>
    </motion.div>
  );
}
