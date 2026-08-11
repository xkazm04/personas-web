"use client";

import { tint } from "@/lib/brand-theme";
import type { SceneState } from "./data";
import type { FieldLayout } from "./layout";
import Presence from "./Presence";
import Report from "./Report";
import Wall from "./Wall";

/**
 * Everything in the room, placed from one set of percent rects.
 *
 * Nothing here decides WHEN anything happens: every piece reads its stage off
 * the `SceneState` that `data.ts` derives from the tick and composes itself
 * from that. This file only knows WHERE things are.
 *
 * The order is the composition's own: the wall behind, the bench in front of
 * it. She stands at the end of the bench and the announcement lands beside her,
 * both clear of the wall — so the one message a whole job produces never covers
 * the work that is still going.
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
      {/* The bench she stands at — a low band of her light under the wall,
          there the whole loop. It is what keeps the bottom of the frame a
          place rather than a gap while nothing is landing in it. */}
      <div
        className="pointer-events-none absolute inset-x-0"
        style={{
          top: `${layout.wall.y + layout.wall.h}%`,
          height: `${100 - layout.wall.y - layout.wall.h}%`,
          background: `radial-gradient(ellipse 72% 130% at 26% 34%, ${tint("cyan", 13)}, transparent 72%)`,
        }}
        aria-hidden="true"
      />

      <Wall layout={layout} scene={scene} reduced={reduced} />

      <Report
        rect={layout.report}
        stage={scene.report}
        waiting={scene.reportGhost}
        reduced={reduced}
      />

      <Presence
        at={layout.presence}
        looking={scene.sweeping}
        holding={scene.holding}
        reduced={reduced}
      />
    </div>
  );
}
