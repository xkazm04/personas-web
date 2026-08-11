"use client";

import { motion } from "framer-motion";
import Bed from "./Bed";
import { BEDS, JOB_TITLES } from "./copy";
import { JOBS_IN, type SceneState } from "./data";
import Dial from "./Dial";
import Fence from "./Fence";
import type { FieldLayout } from "./layout";
import Outside from "./Outside";
import Presence from "./Presence";
import Reach from "./Reach";

/**
 * The yard, back to front.
 *
 * The order is the argument. The line goes down first and everything else is
 * drawn on top of it, which is also the order the loop puts them in — a
 * boundary that arrives after the work it contains is not a boundary, it is a
 * correction. Her reach renders in the same layer as the line and beneath the
 * panels, so it passes behind anything it crosses and can only ever be seen to
 * end where the line is.
 *
 * Everything except the boundary sits inside one wrapper that steps back a
 * little in the closing stillness. It is a small amount — enough that the last
 * thing on screen still holding full contrast, and the only thing still
 * moving, is the line.
 */
export default function Field({
  scene,
  layout,
  reduced,
}: {
  scene: SceneState;
  layout: FieldLayout;
  reduced: boolean;
}) {
  return (
    <div className="absolute inset-0">
      <Fence
        layout={layout}
        stage={scene.fence}
        sweep={scene.sweep}
        calm={scene.calm}
        reduced={reduced}
      />

      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: scene.calm && !reduced ? 0.82 : 1 }}
        transition={{ duration: reduced ? 0 : 1.2, ease: "easeInOut" }}
      >
        <Reach
          layout={layout}
          reaching={scene.reaching}
          stopped={scene.stopped}
          reduced={reduced}
        />

        {/* As many places as this layout has room for — the narrow field
            carries two and the wide one three, and the yard fills to exactly
            the room it has either way. */}
        {layout.beds.map((rect, b) => (
          <Bed
            key={BEDS[b].name}
            rect={rect}
            bed={BEDS[b]}
            stage={scene.beds[b]}
            jobs={JOBS_IN[b].map((i) => ({
              title: JOB_TITLES[i],
              stage: scene.jobs[i],
              progress: scene.progress[i],
            }))}
            reduced={reduced}
          />
        ))}

        {/* Yours, not hers — and so, standing outside the line */}
        <Dial
          rect={layout.dial}
          vertical={layout.vertical}
          stage={scene.dial}
          level={scene.level}
          reduced={reduced}
        />
        <Outside
          rect={layout.outside}
          shown={scene.outside}
          waits={scene.stopped}
          reduced={reduced}
        />

        <Presence
          at={layout.her}
          arrived={scene.her}
          working={scene.working}
          reaching={scene.reaching}
          stopped={scene.stopped}
          calm={scene.calm}
          reduced={reduced}
        />
      </motion.div>
    </div>
  );
}
