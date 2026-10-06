"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { atStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import AthenaAvatar from "../shared/AthenaAvatar";
import { HUES, TASK_COUNT } from "../shared/cast";
import type { SceneState } from "./data";
import { DIAL, box, type Rect } from "./layout";
import Rings from "./Rings";

/**
 * The dial - the dominant object of V2. She sits at its centre; her team's
 * rings close around her; the outer track is how far one person would have
 * got. Everything is placed in percent of the dial's own 400-unit box, so the
 * HTML (her face, the findings, the caption) and the SVG rings scale as one.
 */

const pct = (n: number) => `${(n / DIAL.size) * 100}%`;
const AVATAR = 92;

export default function Dial({ rect, scene, reduced }: { rect: Rect; scene: SceneState; reduced: boolean }) {
  const { t } = useTranslation();
  const lab = t.athenaLab.fleet.v2;
  const tasks = t.athenaPage.fleet.tasks;
  const awake = atStage(scene.sentence, "chosen");
  const step = lab.serialStep.replace("{n}", String(scene.serialTask + 1)).replace("{total}", String(TASK_COUNT));
  return (
    <div className="absolute" style={box(rect)}>
      {/* The dial's own light - brightest once the work is done */}
      <motion.span
        className="pointer-events-none absolute inset-[12%] rounded-full blur-3xl"
        style={{ backgroundColor: tint("cyan", 16) }}
        initial={false}
        animate={{ opacity: scene.result !== "ghost" ? 1 : awake ? 0.55 : 0.2 }}
        transition={{ duration: reduced ? 0 : 0.8 }}
        aria-hidden="true"
      />
      <Rings joined={scene.joined} progress={scene.progress} running={scene.running} serial={scene.serial} reduced={reduced} />

      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: "50%", top: "50%", width: pct(AVATAR), height: pct(AVATAR) }}
      >
        <AthenaAvatar awake={awake} busy={scene.start === "working"} reduced={reduced} />
      </div>

      {/* What each teammate came back with, at the twelve o'clock its ring closed on */}
      {DIAL.rings.map((r, i) =>
        scene.done[i] ? (
          <motion.span
            key={r}
            className="absolute flex -translate-y-1/2 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-sm font-semibold"
            style={{
              left: pct(DIAL.c + 18),
              top: pct(DIAL.c - r),
              color: BRAND_VAR[HUES[i]],
              borderColor: tint(HUES[i], 50),
              backgroundColor: "color-mix(in srgb, var(--background) 88%, transparent)",
            }}
            initial={reduced ? false : { opacity: 0, x: -10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={reduced ? { duration: 0 } : SPRING_POP}
          >
            {tasks[i].found}
          </motion.span>
        ) : null,
      )}

      {/* The outer track's caption, at its start */}
      <motion.span
        className="absolute flex items-center gap-2 whitespace-nowrap font-mono text-sm text-muted-dark"
        // Wide: ends just left of twelve o'clock. Compact: the dial is nearly
        // the scene's width, so the caption sits above its left edge instead.
        style={rect.w < 360 ? { left: 0, top: pct(-8) } : { right: pct(DIAL.size - DIAL.c + 14), top: pct(-4) }}
        initial={false}
        animate={{ opacity: scene.running ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.5 }}
      >
        {lab.serial}
        <span className="rounded-full border px-2 text-foreground" style={{ borderColor: "rgba(var(--surface-overlay), 0.25)" }}>
          {step}
        </span>
      </motion.span>
    </div>
  );
}
