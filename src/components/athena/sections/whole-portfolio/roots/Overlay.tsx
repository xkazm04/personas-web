"use client";

import type { CSSProperties } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import FindingCard, { Check } from "./shared/FindingCard";
import type { GardenState } from "./data";
import { CARD, CAUSE, GROUND, pct, PLANTS, WORST_PLANT } from "./geometry";
import { TONE_KEY } from "./Plant";

/**
 * The type layer of "Roots" - HTML in percent of the garden's box, which
 * keeps the viewBox's aspect ratio, so every word sits exactly on the thing
 * it names at every size.
 *
 *   names    each project's name at its foot, on the ground line. Only the
 *            ones that are not fine say more (a dot; a check once handled).
 *   cause    the name of what went bad, at the end of the run - only once
 *            she is down there.
 *   finding  the opened detail, docked right of the cause and wired to it.
 *            On phones (`PhoneCard`) it docks across the top of the slot
 *            instead - the garden box is wider than the screen there.
 *
 * Names under the opened detail step aside rather than collide with it.
 */

const LABEL = "text-[clamp(1rem,2.3cqh,1.375rem)]";
const cause = pct(CAUSE);

export default function Overlay({ g, live, reduced }: { g: GardenState; live: boolean; reduced: boolean }) {
  const { t } = useTranslation();
  const { projects, field } = t.athenaPage.portfolio;
  const fade = reduced ? "" : "transition-opacity duration-500";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {PLANTS.map((plant, k) => {
        const at = pct({ x: plant.x, y: GROUND + 16 });
        const tone = g.tones[k];
        // Names step aside for the opened detail, and hers steps aside while
        // she is down its stem (the detail carries it then).
        const under =
          (g.open && at.x > CARD.x - 5 && at.x < CARD.x + CARD.w + 5) ||
          (k === WORST_PLANT && g.where === "down");
        const accent = tone === "attention" || tone === "worst" || tone === "handled" ? TONE_KEY[tone] : null;
        return (
          <span
            key={plant.project}
            className={`absolute flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 ${LABEL} ${
              accent ? "font-medium" : "text-muted-dark"
            } ${fade}`}
            style={{
              left: `${at.x}%`,
              top: `${at.y}%`,
              opacity: atStageShown(g.stages[k]) && !under ? 1 : 0,
              color: accent ? BRAND_VAR[accent] : undefined,
              backgroundColor: "color-mix(in srgb, var(--background) 60%, transparent)",
            }}
          >
            {tone === "handled" ? (
              <Check reduced={reduced} />
            ) : accent ? (
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: BRAND_VAR[accent] }} />
            ) : null}
            {projects[plant.project]}
            {tone === "handled" && <span className="text-muted-dark">{field.handled}</span>}
          </span>
        );
      })}

      {/* What went bad, at the end of the run */}
      <span
        className={`absolute -translate-x-full whitespace-nowrap font-mono ${LABEL} ${fade}`}
        style={{
          left: `${cause.x + 1.2}%`,
          top: `${cause.y + 3.5}%`,
          opacity: g.open || g.healed ? 1 : 0,
          color: g.healed ? BRAND_VAR.emerald : BRAND_VAR.rose,
        }}
      >
        {t.athenaSections.portfolio.cause}
      </span>

      {/* The wire from the cause into the finding (stage sizes only) */}
      <svg className={`absolute inset-0 h-full w-full max-sm:hidden ${fade}`} style={{ opacity: g.open ? 1 : 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Opacity only: a pathLength draw on a non-scaling stroke dashes it. */}
        <polyline
          points={`${cause.x + 1},${cause.y} ${CARD.x - 2.5},${CARD.y + 12} ${CARD.x},${CARD.y + 12}`}
          fill="none"
          stroke={tint(g.healed ? "emerald" : "rose", 60)}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div
        className={`absolute left-[var(--cx)] top-[var(--cy)] w-[var(--cw)] max-sm:hidden ${fade}`}
        style={
          {
            "--cx": `${CARD.x}%`,
            "--cy": `${CARD.y}%`,
            "--cw": `${CARD.w}%`,
            opacity: g.open ? 1 : 0,
          } as CSSProperties
        }
      >
        {g.card !== "ghost" && <FindingCard stage={g.card} beckon={g.beckon} live={live} reduced={reduced} />}
      </div>
    </div>
  );
}

function atStageShown(stage: GardenState["stages"][number]): boolean {
  return stage !== "ghost";
}

/** Phones: the garden box is wider than the screen and cropped, so the opened
 *  detail docks across the top of the visible slot instead of beside the
 *  cause. Rendered by the section, outside the garden box. */
export function PhoneCard({ g, live, reduced }: { g: GardenState; live: boolean; reduced: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-2 top-2 z-30 sm:hidden ${reduced ? "" : "transition-opacity duration-500"}`}
      style={{ opacity: g.open ? 1 : 0 }}
      aria-hidden="true"
    >
      {g.card !== "ghost" && <FindingCard stage={g.card} beckon={g.beckon} live={live} reduced={reduced} />}
    </div>
  );
}
