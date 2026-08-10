"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY } from "../data";
import type { Rect } from "../layout";
import { DrawCheck, Part, Sheen } from "./parts";
import { ModuleReveal } from "./shell";

/**
 * The one control that starts anything. It is built like everything else
 * rather than dropped in finished: an OUTLINE that already says what it does
 * arrives with the plan's texture (shell), the surface floods and the label
 * inverts as the plan completes (body), it beckons once she lands on it
 * (detail), and the press commits into a done face whose check DRAWS while an
 * accent sweeps across it (chosen).
 *
 * Pressing it is the only thing in the whole scene that makes work happen,
 * which is exactly the guarantee the plan card states beneath it.
 */
export function ConfirmControl({
  rect,
  stage,
  beckoning,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  beckoning: boolean;
  reduced: boolean;
}) {
  const c = COPY.confirm;
  const Spark = c.icon;
  // The label rides the OUTLINE, not the fill: a control whose surface exists
  // before its words reads as a skeleton, not as composition.
  const outlined = atStage(stage, "shell");
  const filled = atStage(stage, "body");
  const done = atStage(stage, "chosen");
  const live = beckoning && !reduced;
  return (
    <ModuleReveal rect={rect} stage={stage} reduced={reduced} ghost={false}>
      <motion.button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 flex items-center justify-center gap-2 overflow-hidden rounded-lg border text-base font-semibold duration-500 transition-[background-color,border-color,box-shadow,color]"
        style={{
          backgroundColor: filled ? BRAND_VAR.cyan : "transparent",
          borderColor: filled ? BRAND_VAR.cyan : tint("cyan", 45),
          color: filled ? "var(--color-background)" : BRAND_VAR.cyan,
          boxShadow: filled ? brandShadow("cyan", live ? 36 : 18, live ? 40 : 22) : "none",
        }}
        animate={live ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={live ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        <Sheen on={done} reduced={reduced} />
        <Part show={filled} lead={0.14} reduced={reduced} className="flex shrink-0">
          {done ? (
            <DrawCheck reduced={reduced} className="h-4.5 w-4.5" delay={0.12} />
          ) : (
            <Spark className="h-4.5 w-4.5" aria-hidden="true" />
          )}
        </Part>
        {outlined && (
          <motion.span
            key={done ? "done" : "idle"}
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: 0.22 }}
          >
            {done ? c.done : c.idle}
          </motion.span>
        )}
      </motion.button>
    </ModuleReveal>
  );
}
