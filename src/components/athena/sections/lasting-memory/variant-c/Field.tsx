"use client";

import Account from "./Account";
import { ACCOUNTS } from "./copy";
import type { SceneState } from "./data";
import type { FieldLayout } from "./layout";
import Marks from "./Marks";
import Reader from "./Reader";
import Seam from "./Seam";

/**
 * The frame, back to front.
 *
 * The order matters exactly once, and it is the whole reason it is stated
 * here: the MARKS render on top of the seam, not behind it. A marker that
 * disappeared behind the messages it divides would be an annotation about the
 * seam; one that cuts through it is a fact about the seam.
 *
 * Everything is placed in the same percent space — the seam, the measurements
 * under it, the accounts under those, and the track she travels on. Nothing is
 * projected and nothing needs keeping in sync, which is what a scene with one
 * axis and no camera buys.
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
      <Seam
        layout={layout}
        stage={scene.seam}
        arrived={scene.arrived}
        arrivedPrev={scene.arrivedPrev}
        read={scene.read}
        readPrev={scene.readPrev}
        readFrac={scene.headFrac}
        ack={scene.ack}
        settle={scene.settle}
        holding={scene.holding}
        reduced={reduced}
      />

      <Marks
        layout={layout}
        marks={scene.marks}
        braces={scene.braces}
        joins={scene.joins}
        named={scene.named}
        reduced={reduced}
      />

      {ACCOUNTS.map((copy, i) => (
        <Account
          key={copy.label}
          rect={layout.notes[i]}
          copy={copy}
          stage={scene.notes[i]}
          waiting={scene.noteWaiting[i]}
          lines={scene.lines[i]}
          settle={scene.settle}
          holding={scene.holding}
          reduced={reduced}
        />
      ))}

      <Reader
        layout={layout}
        frac={scene.headFrac}
        here={scene.headHere}
        reading={scene.reading}
        holding={scene.holding}
        reduced={reduced}
      />
    </div>
  );
}
