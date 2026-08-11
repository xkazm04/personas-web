"use client";

import { BRAND_VAR, type BrandKey, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import type { Tone } from "./data";
import { labelPoint, type Camera, type FieldLayout, type Rect } from "./layout";
import { DrawCheck } from "./parts";

/**
 * The names, on the SCREEN layer.
 *
 * A label is never scaled by the camera — it is placed at the projected
 * position of the plot it belongs to and rendered at its authored size, so
 * text reads identically at both altitudes and the type floor holds all the
 * way down. That is also why the layer goes quiet while the camera is in
 * flight: like every map, it re-sets its labels at the new altitude instead
 * of dragging them through the move.
 *
 * Position is static per altitude and only ever changes while the layer is
 * invisible, so nothing here animates `left`/`top` — only opacity.
 *
 * Most labels are just a name. The only ones that say anything more are the
 * ones that are not fine, which is the section's whole argument in the
 * quietest possible form.
 */

const ACCENT: Partial<Record<Tone, BrandKey>> = {
  attention: "amber",
  worst: "rose",
  handled: "emerald",
};

export default function Labels({
  layout,
  camera,
  tones,
  shown,
  /** The plot whose name the opened detail is already carrying. Two of the
   *  same name, one behind the other, is the reading the panel exists to
   *  replace. */
  muted,
  avoid,
  reduced,
}: {
  layout: FieldLayout;
  camera: Camera;
  tones: Tone[];
  shown: boolean;
  muted: number | null;
  /** Screen region the opened detail is holding. A neighbour's name landing
   *  on the panel's edge reads as part of the panel. */
  avoid: Rect | null;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const { projects, field } = t.athenaPage.portfolio;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {layout.islands.map((rect, i) => {
        if (i === muted) return null;
        const p = labelPoint(rect, camera, layout);
        // Off the frame at this altitude — a label with no plot under it.
        if (p.x < 2 || p.x > 98 || p.y < 0 || p.y > 97) return null;
        if (
          avoid &&
          p.x > avoid.x - 6 &&
          p.x < avoid.x + avoid.w + 6 &&
          p.y > avoid.y - 3 &&
          p.y < avoid.y + avoid.h + 1
        ) {
          return null;
        }
        const tone = tones[i];
        const accent = ACCENT[tone];
        const quiet = tone === "waiting" || tone === "calm";
        return (
          <span
            key={projects[i]}
            className={`absolute flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap text-base ${
              quiet ? "text-muted-dark" : "font-medium"
            } ${reduced ? "" : "transition-opacity duration-500"}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: shown ? 1 : 0,
              color: accent ? BRAND_VAR[accent] : undefined,
            }}
          >
            {tone === "handled" ? (
              <DrawCheck reduced={reduced} className="h-4 w-4" />
            ) : accent ? (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: BRAND_VAR[accent],
                  boxShadow: `0 0 6px ${tint(accent, 70)}`,
                }}
              />
            ) : null}
            {projects[i]}
            {tone === "handled" && (
              <span className="text-muted-dark">{field.handled}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
