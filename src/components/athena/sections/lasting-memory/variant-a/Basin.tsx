"use client";

import { brandShadow, tint } from "@/lib/brand-theme";
import type { FieldLayout } from "./layout";

/**
 * The vessel: two side seams, a floor, and the band of talk that has already
 * settled at the bottom of it.
 *
 * The band is the one element on this field that is never removed, made
 * smaller, or taken away — it only ever gets denser. That is deliberate and it
 * is the section's quietest claim: what settles is not gone, it is just quiet
 * now, and the threads that come out of its underside are drawn to a real
 * place inside it.
 *
 * Its texture is authored hatching rather than a flat fill, so a mass of talk
 * arriving into it reads as compaction — new layers pressing into old ones —
 * instead of as a bar getting taller.
 */

/** Authored sediment layers: [x, width, y-fraction, ink] in band-local percent. */
const SEDIMENT = [
  [2, 34, 0.18, 26],
  [40, 26, 0.18, 18],
  [70, 28, 0.18, 22],
  [6, 30, 0.46, 20],
  [39, 33, 0.46, 27],
  [75, 22, 0.46, 17],
  [3, 24, 0.74, 24],
  [30, 38, 0.74, 18],
  [71, 26, 0.74, 25],
] as const;

export default function Basin({
  layout: L,
  /** A pass has just pressed a mass of talk into the band. */
  compacting,
  reduced,
}: {
  layout: FieldLayout;
  compacting: boolean;
  reduced: boolean;
}) {
  const sill = L.basin.y + L.basin.h;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* The two seams. Faint at the rim, firm at the floor — the basin reads
          as deeper than it is drawn. */}
      {[L.basin.x, L.basin.x + L.basin.w].map((x) => (
        <span
          key={x}
          className="absolute w-px"
          style={{
            left: `${x}%`,
            top: `${L.basin.y}%`,
            height: `${L.basin.h}%`,
            background: `linear-gradient(to bottom, ${tint("cyan", 6)}, ${tint("cyan", 34)})`,
          }}
        />
      ))}

      {/* The floor everything settles onto and the few come to rest below. */}
      <span
        className="absolute h-px"
        style={{
          left: `${L.basin.x}%`,
          top: `${sill}%`,
          width: `${L.basin.w}%`,
          background: `linear-gradient(to right, ${tint("cyan", 10)}, ${tint("cyan", 50)}, ${tint("cyan", 10)})`,
        }}
      />

      {/* What has already settled. Present from the first frame — this is not
          the first time she has done this, and pretending otherwise would make
          the band look like something the loop invented. */}
      <span
        className={`absolute overflow-hidden rounded-b-md border-x border-b ${
          reduced ? "" : "transition-[background-color,box-shadow] duration-700"
        }`}
        style={{
          left: `${L.band.x}%`,
          top: `${L.band.y}%`,
          width: `${L.band.w}%`,
          height: `${L.band.h}%`,
          borderColor: tint("cyan", 22),
          backgroundColor: tint("cyan", compacting ? 12 : 7),
          boxShadow: compacting ? brandShadow("cyan", 26, 16) : undefined,
        }}
      >
        {SEDIMENT.map(([x, w, fy, ink]) => (
          <span
            key={`${x}-${fy}`}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${fy * 100}%`,
              width: `${w}%`,
              height: "16%",
              backgroundColor: tint("cyan", ink),
            }}
          />
        ))}
      </span>
    </div>
  );
}
