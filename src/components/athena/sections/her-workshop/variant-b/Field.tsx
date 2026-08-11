"use client";

import { atStage } from "@/components/athena/stage/stages";
import Console from "./Console";
import { CABLE_PERIOD, type SceneState } from "./data";
import HandsOn from "./HandsOn";
import { Wire } from "./ink";
import { BENCH_IDS, type FieldLayout } from "./layout";
import NextDoor from "./NextDoor";
import Queue from "./Queue";
import Standing from "./Standing";
import Watchers from "./Watchers";

/**
 * The shop floor, back to front.
 *
 * The loom renders first and everything else on top of it, so a cable that has
 * to cross the field passes BEHIND the benches — which is what wiring does, and
 * what lets the longest run in the scene come in from the edge without turning
 * the picture into a knot.
 *
 * Nothing here decides WHEN anything happens: every bench reads its stage off
 * the `SceneState` that `data.ts` derives from the tick and composes itself
 * from that. This file only knows what is where, and what is plugged into what.
 *
 * The desk goes on last. It is the thing everything else reports to, so nothing
 * in the scene is ever allowed to sit on top of it.
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
      {BENCH_IDS.map((id) => (
        <Wire
          key={id}
          cable={layout.cables[id]}
          wired={atStage(scene.stages[id], "shell")}
          live={scene.traffic[id]}
          period={CABLE_PERIOD[id]}
          spark={scene.spark[id]}
          // The far bench's cable is the only one that never carries anything.
          // It breathes instead — connected, and with nothing to report.
          breathing={id === "next" && scene.paired}
          reduced={reduced}
        />
      ))}
      {layout.hub && (
        <Wire
          cable={[layout.hub]}
          wired={scene.awake}
          live={false}
          period={0}
          spark={false}
          reduced={reduced}
        />
      )}

      <HandsOn
        layout={layout}
        stage={scene.stages.hands}
        lanes={scene.lanes}
        handedOver={scene.handedOver}
        waiting={scene.footprint}
        reduced={reduced}
      />
      <Queue
        layout={layout}
        stage={scene.stages.queue}
        starting={scene.starting}
        started={scene.started}
        waiting={scene.footprint}
        reduced={reduced}
      />
      <Standing
        layout={layout}
        stage={scene.stages.standing}
        sweep={scene.sweep}
        firing={scene.firing}
        fired={scene.fired}
        waiting={scene.footprint}
        reduced={reduced}
      />
      <Watchers
        layout={layout}
        stage={scene.stages.watch}
        tripping={scene.tripping}
        tripped={scene.tripped}
        waiting={scene.footprint}
        reduced={reduced}
      />
      <NextDoor
        layout={layout}
        stage={scene.stages.next}
        paired={scene.paired}
        waiting={scene.footprint}
        reduced={reduced}
      />

      <Console
        layout={layout}
        awake={scene.awake}
        taking={scene.taking}
        paired={scene.paired}
        reduced={reduced}
      />
    </div>
  );
}
