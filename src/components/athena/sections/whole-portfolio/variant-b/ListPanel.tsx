"use client";

import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage } from "@/components/athena/stage/stages";
import { COPY } from "./copy";
import type { Scene } from "./data";
import type { FieldLayout } from "./layout";
import { META, Part, Slot, rectStyle } from "./parts";

/**
 * The few — the panel the surfaced readings land in.
 *
 * It holds no rows of its own. The rows are the readings themselves, which
 * arrive by flying here out of the lattice (see `./Traveller`), so this file
 * owns only the frame they land in and the one line that says what the current
 * ordering MEANS. That line is the section's hinge: the same four items,
 * arranged twice, and only the second arrangement is worth a person's morning.
 *
 * The frame stays a dashed ghost until she has actually found something — an
 * empty list of four waiting slots would announce the answer's shape while she
 * is still reading the field. What it does say, quietly and in the middle of
 * all that reserved space, is the thing most of a portfolio's days are: she has
 * been through it and has not needed you. Half of this loop is that state, and
 * it is worth more as a sentence than as an empty rectangle.
 */
export default function ListPanel({
  L,
  scene,
  reduced,
}: {
  L: FieldLayout;
  scene: Scene;
  reduced: boolean;
}) {
  const shell = atStage(scene.list, "shell");
  const landed = atStage(scene.list, "body");
  const waiting = atStage(scene.lattice, "detail") && !landed;
  return (
    <>
      <Slot
        rect={L.list}
        solid={shell}
        reduced={reduced}
        accent="amber"
        className="overflow-hidden backdrop-blur-sm"
        style={{ borderColor: tint("amber", 26), backgroundColor: tint("amber", 4) }}
      />

      <div className="absolute flex items-center gap-3" style={rectStyle(L.listHead)}>
        <Part
          show={shell}
          i={0}
          reduced={reduced}
          className="min-w-0 flex-1 truncate text-base sm:text-lg"
          style={{ color: BRAND_VAR.amber }}
        >
          {COPY.list.title}
        </Part>
        {/* The hinge line. It steps aside below xl — at those widths the header
            cannot hold two claims without shrinking its own type, and the mono
            status line under the field narrates the same beat there. */}
        {landed && (
          <Part show reduced={reduced} className={`hidden shrink-0 xl:block ${META}`}>
            {scene.sorted ? COPY.list.sorted : COPY.list.unsorted}
          </Part>
        )}
      </div>

      {/* Most days, this is the whole report. */}
      <div
        className="pointer-events-none absolute flex items-center justify-center px-6"
        style={rectStyle(L.list)}
      >
        {waiting && (
          <Part show reduced={reduced} className={`text-center ${META}`}>
            {COPY.list.empty}
          </Part>
        )}
      </div>
    </>
  );
}
