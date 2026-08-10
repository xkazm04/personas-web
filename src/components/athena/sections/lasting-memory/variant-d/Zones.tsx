"use client";

import { tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY } from "./copy";
import type { FieldLayout } from "./layout";
import { Part, Slot } from "./parts";

/**
 * The three zones, as three frames — the diagram's skeleton and the reason a
 * viewer can point at anything on the field and say which stage it is in.
 *
 * They arrive in the order material moves through them (surface, then her,
 * then the shelf), and each one is a box that was already holding its rect as
 * a dashed outline. Nothing here ever moves again: every later beat happens
 * INSIDE these three rects, which is what makes the flow between them legible.
 *
 * While she rests the frames cool — a colour change, so it rides the scoped
 * CSS transition on `Slot` rather than framer, which cannot interpolate the
 * `color-mix()` values `tint()` returns.
 */
export default function Zones({
  layout,
  now,
  chamber,
  shelf,
  resting,
  reduced,
}: {
  layout: FieldLayout;
  now: ModuleStage;
  chamber: ModuleStage;
  shelf: ModuleStage;
  resting: boolean;
  reduced: boolean;
}) {
  const rightGutter = 100 - (layout.kept.x + layout.kept.w);
  const frame = (lit: boolean) => ({
    borderColor: tint("cyan", resting ? 12 : lit ? 26 : 18),
    backgroundColor: tint("cyan", resting ? 2 : 4),
  });

  return (
    <>
      <Slot
        rect={layout.now}
        solid={atStage(now, "shell")}
        waiting
        reduced={reduced}
        round="rounded-2xl"
        style={frame(false)}
      >
        <span />
      </Slot>

      <Slot
        rect={layout.chamber}
        solid={atStage(chamber, "shell")}
        waiting
        reduced={reduced}
        round="rounded-3xl"
        style={frame(resting)}
      >
        <span />
      </Slot>

      <Slot
        rect={layout.kept}
        solid={atStage(shelf, "shell")}
        waiting
        reduced={reduced}
        round="rounded-2xl"
        style={frame(atStage(shelf, "chosen"))}
      >
        <span />
      </Slot>

      {/* Zone names sit ABOVE their frames rather than inside them: a name
          inside the box would be one more thing competing with the material
          moving through it. */}
      <Part
        show={atStage(now, "detail")}
        reduced={reduced}
        className={`absolute ${ANNOTATION_DIM}`}
        style={{ left: `${layout.now.x}%`, top: `${layout.now.y - layout.labelLift}%` }}
      >
        {COPY.zones.now.label}
      </Part>
      <Part
        show={atStage(now, "detail")}
        i={1}
        reduced={reduced}
        className={`absolute ${ANNOTATION_DIM}`}
        style={{ right: `${rightGutter}%`, top: `${layout.now.y - layout.labelLift}%` }}
      >
        {COPY.zones.now.caption}
      </Part>

      <Part
        show={atStage(shelf, "detail")}
        reduced={reduced}
        className={`absolute ${ANNOTATION_DIM}`}
        style={{ left: `${layout.kept.x}%`, top: `${layout.kept.y - layout.labelLift}%` }}
      >
        {COPY.zones.kept.label}
      </Part>
      <Part
        show={atStage(shelf, "detail")}
        i={1}
        reduced={reduced}
        className={`absolute ${ANNOTATION_DIM}`}
        style={{ right: `${rightGutter}%`, top: `${layout.kept.y - layout.labelLift}%` }}
      >
        {layout.short ? COPY.zones.kept.captionShort : COPY.zones.kept.caption}
      </Part>
    </>
  );
}
