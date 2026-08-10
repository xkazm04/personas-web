"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY, type ActionState } from "../data";
import type { Rect } from "../layout";
import { atStage, type ModuleStage } from "../stages";
import { DrawCheck, Part, Sheen } from "./parts";
import { ModuleReveal } from "./shell";

/**
 * The closing stop — a real action button, built like everything else rather
 * than dropped in finished. While she is still crossing to it the ghost
 * solidifies into an empty outline (shell); the surface floods brand cyan and
 * the label walks in as she arrives (body); it starts beckoning on the lock
 * (detail); and the click commits into a done face whose check DRAWS while an
 * accent sweeps the button — the same commit vocabulary the template card and
 * the Slack row use.
 */
export function ActionButton({
  rect,
  stage,
  state,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  state: ActionState;
  reduced: boolean;
}) {
  const c = COPY.canvas;
  const Spark = c.actionIcon;
  const done = state === "done";
  const filled = atStage(stage, "body");
  const live = state === "pulse" && !reduced;
  return (
    <ModuleReveal rect={rect} stage={stage} reduced={reduced}>
      <motion.button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 flex items-center justify-center gap-2 overflow-hidden rounded-xl border text-base font-semibold duration-500 transition-[background-color,border-color,box-shadow,color]"
        style={{
          backgroundColor: filled ? BRAND_VAR.cyan : "transparent",
          borderColor: filled ? BRAND_VAR.cyan : tint("cyan", 45),
          color: filled ? "var(--color-background)" : BRAND_VAR.cyan,
          boxShadow: filled ? brandShadow("cyan", live ? 36 : 18, live ? 40 : 22) : "none",
        }}
        animate={live ? { scale: [1, 1.045, 1] } : { scale: 1 }}
        transition={live ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        <Sheen on={done} reduced={reduced} />
        <Part show={filled} i={0} lead={0.14} reduced={reduced} className="flex shrink-0">
          {done ? (
            <DrawCheck reduced={reduced} className="h-4.5 w-4.5" delay={0.12} />
          ) : (
            <Spark className="h-4.5 w-4.5" aria-hidden="true" />
          )}
        </Part>
        {filled && (
          <motion.span
            key={done ? "done" : "idle"}
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: 0.22 }}
          >
            {done ? c.actionDone : c.action}
          </motion.span>
        )}
      </motion.button>
    </ModuleReveal>
  );
}
