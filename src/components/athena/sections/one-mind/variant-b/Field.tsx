"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { atStage } from "@/components/athena/stage/stages";
import { COPY, MOMENTS } from "./copy";
import type { SceneState } from "./data";
import Lane from "./Lane";
import { poolRect, type SceneLayout } from "./layout";
import Moment, { type Mood } from "./Moment";
import { Pool } from "./parts";
import Presence from "./Presence";

/**
 * Three conversations, the days between them, and the one line that crosses.
 *
 * Nothing here decides WHEN anything happens: every piece reads its stage off
 * the `SceneState` that `data.ts` derives from the tick. This file only knows
 * WHERE things are and which light they are standing in.
 *
 * Layer order is the argument. The pools of light are behind everything (they
 * are the time of day, not an element). The lane is under the conversations,
 * because a line that had to be looked at would be a mechanism, and this
 * section is about not having to think about one. The conversations are on
 * top, at full contrast, whichever day they belong to.
 */

/** The closing mark. It names the chore that never happened — which is the
 *  only part of the story the picture genuinely cannot show, because it
 *  consists of something being absent. */
function Mark({ at, on, reduced }: { at: { x: number; y: number }; on: boolean; reduced: boolean }) {
  if (!on) return null;
  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-4 py-1 font-mono text-base"
      style={{
        left: `${at.x}%`,
        top: `${at.y}%`,
        borderColor: tint("cyan", 45),
        backgroundColor: tint("cyan", 10),
        color: BRAND_VAR.cyan,
        boxShadow: brandShadow("cyan", 26, 26),
      }}
      initial={reduced ? false : { opacity: 0, y: 8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: 0.35 }}
    >
      <span className="hidden sm:inline">{COPY.close}</span>
      <span className="sm:hidden">{COPY.closeShort}</span>
    </motion.div>
  );
}

export default function Field({
  scene,
  layout,
  reduced,
}: {
  scene: SceneState;
  layout: SceneLayout;
  reduced: boolean;
}) {
  const station = scene.stop === "drift" ? layout.drift : layout.stations[scene.stop];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {layout.moments.map((rect, i) => (
        <Pool
          key={i}
          rect={poolRect(rect, layout.pool)}
          level={
            atStage(scene.moments[i], "shell")
              ? scene.closed
                ? 0.6
                : scene.focus === i
                  ? 1
                  : 0.12
              : 0
          }
          reduced={reduced}
        />
      ))}

      <Lane
        layout={layout}
        drop={scene.drop}
        legs={scene.legs}
        risers={scene.risers}
        closed={scene.closed}
        reduced={reduced}
      />

      {MOMENTS.map((copy, i) => (
        <Moment
          key={copy.subject}
          rect={layout.moments[i]}
          copy={copy}
          stage={scene.moments[i]}
          mood={(scene.closed ? "calm" : scene.focus === i ? "live" : "past") as Mood}
          lit={scene.litRuns[i]}
          pulse={scene.using}
          draft={scene.draft && copy.draft !== undefined}
          reduced={reduced}
        />
      ))}

      <Presence at={station} dark={scene.dark} reduced={reduced} />

      <Mark at={layout.chip} on={scene.marked} reduced={reduced} />
    </div>
  );
}
