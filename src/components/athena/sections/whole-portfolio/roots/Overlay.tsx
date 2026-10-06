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
 * On phones they hang inward from their stems instead (see `phoneName`).
 */

const LABEL = "text-[clamp(1rem,2.3cqh,1.375rem)]";
/**
 * Phones crop the garden box to the middle three plants - hers and the two
 * that wait their turn - and three names do not fit one row across a phone.
 * So below `sm` her neighbours' names hang INWARD from their stems (left of
 * hers: starts at the stem; right: ends at it) one row lower, never past the
 * screen edge; the names of plants a phone cannot show stay out. The
 * card-hiding rule is stage-only there (`--card-o`): the card docks in the sky.
 */
function phoneName(k: number): string {
  const d = k - WORST_PLANT;
  if (d === 0) return "max-sm:[--card-o:1]";
  if (Math.abs(d) > 1) return "max-sm:hidden";
  return d < 0
    ? "max-sm:mt-9 max-sm:-translate-x-2 max-sm:[--card-o:1]"
    : "max-sm:mt-9 max-sm:translate-x-[calc(-100%+0.5rem)] max-sm:[--card-o:1]";
}
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
        // Names step aside for the opened detail (stage sizes only - on a
        // phone it docks in the sky instead), and hers steps aside while she
        // is down its stem (the detail carries it then).
        const underCard = g.open && at.x > CARD.x - 5 && at.x < CARD.x + CARD.w + 5;
        const underHer = k === WORST_PLANT && g.where === "down";
        const accent = tone === "attention" || tone === "worst" || tone === "handled" ? TONE_KEY[tone] : null;
        return (
          <span
            key={plant.project}
            className={`absolute flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 ${LABEL} ${
              accent ? "font-medium" : "text-muted-dark"
            } ${phoneName(k)} ${fade}`}
            style={{
              left: `${at.x}%`,
              top: `${at.y}%`,
              opacity: atStageShown(g.stages[k]) && !underHer ? (underCard ? "var(--card-o, 0)" : 1) : 0,
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

      {/* What went bad, at the end of the run - hanging left of it, or on a
          phone (where the box is cropped) right of it, so it stays on screen */}
      <span
        className={`absolute -translate-x-full whitespace-nowrap font-mono max-sm:-translate-x-4 ${LABEL} ${fade}`}
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
