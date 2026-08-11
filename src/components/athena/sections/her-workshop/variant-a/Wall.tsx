"use client";

import { BATCH, JOBS } from "./copy";
import { dimmed, type SceneState } from "./data";
import { colFrac, tileRect, type FieldLayout } from "./layout";
import { Pass } from "./ink";
import { rectStyle } from "./parts";
import Tile from "./Tile";

/**
 * The wall itself — every piece of work you have running, on one surface.
 *
 * The screens are placed in the wall's OWN percent space, and the pass that
 * crosses them is drawn in that same space, so the gesture and the things it
 * goes over can never drift apart at any viewport. The pass renders last and
 * sits above the screens: it is a light moving across them, not a panel among
 * them.
 *
 * Narrow fields render the first twelve rather than all twenty. That is a
 * density decision and only a density decision — every screen the story turns
 * on lives inside that first twelve, and no type anywhere gets smaller for it.
 */
export default function Wall({
  layout,
  scene,
  reduced,
}: {
  layout: FieldLayout;
  scene: SceneState;
  reduced: boolean;
}) {
  return (
    <div className="absolute" style={rectStyle(layout.wall)}>
      {JOBS.slice(0, layout.count).map((job, i) => (
        <Tile
          key={job.name}
          rect={tileRect(layout, i)}
          job={job}
          index={i}
          stage={scene.tiles[i]}
          state={scene.states[i]}
          dim={dimmed(scene.states[i], scene)}
          batch={BATCH.includes(i)}
          lines={layout.lines}
          chipDot={layout.chipDot}
          at={colFrac(layout, i)}
          sweeping={scene.sweeping}
          reduced={reduced}
        />
      ))}

      <Pass on={scene.sweeping} reduced={reduced} />
    </div>
  );
}
