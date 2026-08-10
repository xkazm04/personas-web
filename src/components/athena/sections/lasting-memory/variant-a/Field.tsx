"use client";

import { KEPT } from "./copy";
import { REACH, type SceneState } from "./data";
import { reachY, waterY, type FieldLayout } from "./layout";
import Account from "./Account";
import Basin from "./Basin";
import Kept from "./Kept";
import Marks from "./Marks";
import Presence from "./Presence";
import Talk from "./Talk";
import Threads from "./Threads";

/**
 * Everything on the field, placed from one set of percent rects.
 *
 * Nothing here decides WHEN anything happens: every layer reads its state off
 * the `SceneState` that `data.ts` derives from the tick. This file knows only
 * where things are, what feeds what, and the one derived quantity the scene
 * cannot state for itself — the surface of the talk, which is both where she
 * floats and what the label for the set-aside part rides on.
 *
 * The order is the physics. The vessel is behind everything; the talk stacks
 * inside it; the two lines that explain the rhythm sit over the talk so they
 * are never buried by it; the threads run UNDER the shelf so a card is always
 * the end of its own thread; and she is over all of it, because she is the one
 * thing here that is not part of the mechanism.
 */
export default function Field({
  scene,
  caption,
  layout: L,
  reduced,
}: {
  scene: SceneState;
  /** Her five words for this beat — a wording concern, so it arrives from
   *  `./status` rather than out of the choreography. */
  caption: string | null;
  layout: FieldLayout;
  reduced: boolean;
}) {
  const surface = waterY(L, scene.slots);
  const station = scene.reaching
    ? reachY(L, REACH) - 1.2
    : Math.max(surface - L.presenceLift, L.presenceMinY);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl">
      <Basin layout={L} compacting={scene.taken && !scene.dropped} reduced={reduced} />
      <Talk layout={L} scene={scene} reduced={reduced} />
      <Marks layout={L} scene={scene} reduced={reduced} />
      <Threads layout={L} kept={scene.kept} reduced={reduced} />

      <div className="absolute inset-0">
        {/* The shelf is waiting from the first frame. A sibling section hides
            its slots until they are about to fill, because there the empty
            shape would give away an answer; here the shape IS the claim — a
            basin this size leaves behind a shelf this size, and holding four
            outlines under it for the whole loop is what makes the four things
            that land read as few. */}
        {KEPT.map((item, i) => (
          <Kept
            key={item.label}
            rect={L.cards[i]}
            item={item}
            stage={scene.kept[i]}
            waiting
            reduced={reduced}
          />
        ))}
      </div>

      <Account at={L.note} shown={scene.note} reduced={reduced} />

      <Presence
        at={{ x: L.presenceX, y: station }}
        caption={caption}
        working={scene.crossed && !scene.note}
        reduced={reduced}
      />
    </div>
  );
}
