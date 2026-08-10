"use client";

import { brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY } from "./copy";
import { DAYS, nightX, type FieldLayout } from "./layout";
import { Bloom } from "./ink";
import { BandLabel, SKIN, Slot } from "./parts";

/**
 * The middle band: what happens BETWEEN two days.
 *
 * Every night in the stretch has a mark here, waiting, from the first frame —
 * so the one that comes and goes without lighting up is visibly a night that
 * happened rather than a night that is missing. That single unlit mark is the
 * most important thing in this file: it is how the scene says the pass is
 * driven by how much was actually said, not by a clock.
 *
 * The marks sit in the GAPS between day columns rather than under them,
 * because that is where a night is. And a bloom is all a night gets: one quick
 * flare, well under a beat, because the pass costs her a fraction of what an
 * ordinary reply does and a long luxurious animation would be telling the
 * opposite of the truth.
 */

/** Ahead of her, came and went with nothing, ran. The middle one keeps the
 *  dashed outline it was waiting in — a night that happened and produced
 *  nothing should look like the placeholder it never grew out of. */
const RING = [16, 36, 74] as const;
const FILL = [0, 0, 60] as const;

export default function Nights({
  layout,
  band,
  nights,
  resting,
  quietNight,
  reduced,
}: {
  layout: FieldLayout;
  band: ModuleStage;
  nights: number[];
  resting: number;
  quietNight: boolean;
  reduced: boolean;
}) {
  const open = atStage(band, "shell");

  return (
    <>
      <Slot
        rect={{ x: layout.band.x, y: layout.nightY, w: layout.band.w, h: layout.nightH }}
        solid={open}
        waiting
        reduced={reduced}
        round="rounded-full"
        style={{ borderColor: tint("cyan", 12), backgroundColor: tint("cyan", 3) }}
      />

      {Array.from({ length: DAYS }, (_, i) => {
        const state = nights[i];
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${nightX(layout, i)}%`,
              top: `${layout.nightY + layout.nightH / 2}%`,
            }}
            aria-hidden="true"
          >
            <span className="relative block h-2.5 w-2.5">
              <Bloom on={resting === i && !quietNight} reduced={reduced} />
              <span
                className={`absolute inset-0 rounded-full border ${
                  state === 2 ? "" : "border-dashed"
                } ${SKIN}`}
                style={{
                  borderColor: tint("cyan", open ? RING[state] : 0),
                  backgroundColor: tint("cyan", FILL[state]),
                  boxShadow: state === 2 ? brandShadow("cyan", 12, 46) : "none",
                }}
              />
            </span>
          </div>
        );
      })}

      {layout.labelNightY !== null && (
        <BandLabel
          layout={layout}
          show={atStage(band, "body")}
          y={layout.labelNightY}
          reduced={reduced}
        >
          {COPY.night}
        </BandLabel>
      )}
    </>
  );
}
