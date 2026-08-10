"use client";

import Days from "./Days";
import type { SceneState } from "./data";
import type { FieldLayout } from "./layout";
import Nights from "./Nights";
import Notes from "./Notes";
import Presence from "./Presence";
import Recall from "./Recall";
import Shelf from "./Shelf";

/**
 * The frame, back to front — and back to front here is also top to bottom,
 * which is the point.
 *
 * The three stages are three horizontal bands, stacked in the order the flow
 * runs: each day's talk, the night between two days, what she keeps. Every
 * join in the scene crosses those bands DOWNWARD, so a visitor who reads the
 * picture from top to bottom has read the mechanism.
 *
 * Order matters twice. The kept things and their hairlines render after the
 * night band, so a link back to the day it came from cuts THROUGH the night
 * rather than disappearing behind it — the night is what the thing passed
 * through, not a curtain in front of it. And the recall route renders after
 * both, because the one thing in the frame travelling the other way should
 * cross everything else rather than thread between it.
 *
 * Everything is placed in the same percent space. Nothing is projected and
 * nothing needs keeping in sync, which is what a scene with one axis and no
 * camera buys.
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
    <div className="absolute inset-0 overflow-hidden rounded-2xl">
      <Days
        layout={layout}
        band={scene.band}
        days={scene.days}
        steps={scene.steps}
        stepsPrev={scene.stepsPrev}
        today={scene.today}
        resting={scene.resting}
        holding={scene.holding}
        reduced={reduced}
      />

      <Nights
        layout={layout}
        band={scene.band}
        nights={scene.nights}
        resting={scene.resting}
        quietNight={scene.quietNight}
        reduced={reduced}
      />

      <Shelf
        layout={layout}
        band={scene.band}
        kept={scene.kept}
        landing={scene.landing}
        linked={scene.linked}
        recall={scene.recall}
        settle={scene.settle}
        holding={scene.holding}
        reduced={reduced}
      />

      <Recall
        layout={layout}
        recall={scene.recall}
        landing={scene.recallLanding}
        reduced={reduced}
      />

      <Notes
        layout={layout}
        notes={scene.notes}
        recall={scene.recall}
        holding={scene.holding}
        reduced={reduced}
      />

      <Presence
        layout={layout}
        day={scene.reader.day}
        atNight={scene.reader.atNight}
        dipped={scene.reader.dipped}
        here={scene.reader.here}
        sleeping={scene.reader.dipped}
        holding={scene.holding}
        reduced={reduced}
      />
    </div>
  );
}
