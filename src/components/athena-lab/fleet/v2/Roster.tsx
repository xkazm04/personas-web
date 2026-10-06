"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { HUES, TOOLS } from "../shared/cast";
import ToolMark from "../shared/ToolMark";
import type { SceneState } from "./data";
import { box, type Rect } from "./layout";

/**
 * The team, as it forms. One row per teammate - its colour (the same as its
 * phrase and its ring), the tool it works in, the job in plain words, and
 * where it has got to. Each row is one box mounted the whole loop: a dashed
 * ghost that solidifies when the teammate joins, so nothing ever shifts.
 */

const ROW_H = 50;
const GAP = 6;

export default function Roster({ rect, scene, reduced }: { rect: Rect; scene: SceneState; reduced: boolean }) {
  const { t } = useTranslation();
  const f = t.athenaPage.fleet;
  return (
    <div className="absolute" style={box(rect)}>
      {f.tasks.map((task, i) => {
        const hue = HUES[i];
        const on = scene.joined[i];
        const done = scene.done[i];
        const state = done ? f.task.finished : scene.running ? f.task.working : task.scope;
        return (
          <div
            key={task.title}
            className={`absolute inset-x-0 flex items-center gap-2.5 rounded-xl border px-3 transition-[border-color,background-color,opacity] duration-500 ${on ? "" : "border-dashed"}`}
            style={{
              top: i * (ROW_H + GAP),
              height: ROW_H,
              opacity: scene.seats ? 1 : 0,
              borderColor: on ? tint(hue, done ? 50 : 28) : tint("cyan", 16),
              backgroundColor: on ? tint(hue, done ? 10 : 5) : "transparent",
            }}
          >
            {on && (
              <>
                <motion.span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-foreground"
                  style={{ borderColor: BRAND_VAR[hue], backgroundColor: tint(hue, 14) }}
                  initial={reduced ? false : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={reduced ? { duration: 0 } : SPRING_POP}
                >
                  <ToolMark name={TOOLS[i]} className="h-4 w-4" />
                </motion.span>
                <motion.span
                  className="flex min-w-0 flex-1 flex-col"
                  initial={reduced ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: 0.08 }}
                >
                  <span className="whitespace-nowrap text-base font-medium leading-tight text-foreground">{task.title}</span>
                  <span className="flex items-center gap-1.5 font-mono text-sm leading-tight" style={{ color: done ? BRAND_VAR[hue] : "var(--muted-dark)" }}>
                    {done && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                    {state}
                  </span>
                </motion.span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
