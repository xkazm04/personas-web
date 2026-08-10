"use client";

import { FINDINGS } from "./copy";
import type { Scene } from "./data";
import type { FieldLayout } from "./layout";
import Lattice from "./Lattice";
import ListPanel from "./ListPanel";
import Surveyor from "./Surveyor";
import Traveller from "./Traveller";

/**
 * Everything on the field, placed from one set of percent rects.
 *
 * Nothing here decides WHEN anything happens: every piece reads its stage off
 * the `Scene` that `data.ts` derives from the tick. This file only knows what
 * sits in front of what — and that ordering is the whole trick, because the
 * travellers have to be able to pass OVER the lattice they came out of and
 * OVER the list they are sorting themselves into, without either of those two
 * ever moving.
 *
 * Three planes, back to front: the two panels, the readings in flight, and
 * Athena on top of both.
 */
export default function Field({
  L,
  scene,
  reduced,
}: {
  L: FieldLayout;
  scene: Scene;
  reduced: boolean;
}) {
  return (
    <div className="absolute inset-0">
      <Lattice L={L} scene={scene} reduced={reduced} />
      <ListPanel L={L} scene={scene} reduced={reduced} />

      {FINDINGS.map((finding) => (
        <Traveller
          key={finding.project}
          L={L}
          finding={finding}
          scene={scene}
          reduced={reduced}
        />
      ))}

      <Surveyor L={L} scene={scene} reduced={reduced} />
    </div>
  );
}
