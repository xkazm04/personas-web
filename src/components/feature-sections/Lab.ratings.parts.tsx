"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Pin, Rocket, Star } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ease, scoreKey } from "./Lab.shared";

/* One row of the "ratings" lab variant, drawn as the desktop LabVersionsTable row:
 * Version, Model, Rating (number + bar), Baseline (Δ), Status pill, Activate. */

export const GRID =
  "grid grid-cols-[2.25rem_3.5rem_1fr_2.75rem_4rem] items-center gap-2 sm:grid-cols-[3rem_5rem_1fr_5.5rem_7.5rem_6.5rem] sm:gap-4";

export interface RatingRowData {
  id: string;
  version: string;
  model: string;
  rating: number;
  /** Δ vs the pinned baseline; null on the baseline itself. */
  delta: number | null;
  baseline?: boolean;
  /** Best model for this version (the desktop's star). */
  best?: boolean;
  /** Minted by Improve, so it starts Not measured. */
  fresh: boolean;
}

interface RowWords {
  active: string;
  measured: string;
  unmeasured: string;
  measuring: string;
  activate: string;
  baseline: string;
}

/** Desktop LabVersionsTable: a drop of this many points vs baseline is flagged. */
const REGRESSION_DROP = 5;

export function RatingRow({
  row,
  phase,
  live,
  words,
  still,
  onActivate,
}: {
  row: RatingRowData;
  /** 0 Not measured, 1 Measuring, 2 measured. */
  phase: number;
  live: boolean;
  words: RowWords;
  still: boolean;
  onActivate: () => void;
}) {
  const measured = phase >= 2;
  const key = scoreKey(row.rating);
  const regression = row.delta !== null && row.delta <= -REGRESSION_DROP;
  const status = live ? words.active : measured ? words.measured : phase === 1 ? words.measuring : words.unmeasured;

  return (
    <li data-lab-version={row.id} className={`relative gap-y-2.5 rounded-lg px-2 py-3 sm:py-2.5 ${GRID}`}>
      {live && (
        <motion.span
          layoutId="lab-ratings-live"
          transition={ease(still, 0, 0.55)}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={{ backgroundColor: tint("emerald", 8), boxShadow: `inset 0 0 0 1px ${tint("emerald", 50)}` }}
        />
      )}
      <span className="relative flex items-center gap-1 font-mono text-base font-bold text-foreground">
        {row.version}
      </span>
      <span className="relative text-sm text-foreground/85 sm:text-base">{row.model}</span>

      {/* Rating: the 0-100 composite, its bar, and the star for the best model. */}
      <span className="relative flex items-center gap-2.5">
        <span
          className="w-7 font-mono text-base font-bold tabular-nums"
          style={{ color: measured ? BRAND_VAR[key] : undefined }}
        >
          {measured ? row.rating : null}
        </span>
        <Meter className="hidden flex-1 sm:block" rating={row.rating} phase={phase} still={still} />
        {row.best && measured && <Star className="h-3.5 w-3.5 shrink-0 fill-current text-brand-amber" aria-hidden />}
      </span>

      {/* Baseline: a pin on the baseline itself, else Δ vs it. */}
      <span className="relative flex items-center gap-1 font-mono text-sm font-semibold tabular-nums sm:text-base">
        {row.baseline ? (
          <Pin className="h-4 w-4 text-brand-amber" aria-label={words.baseline} />
        ) : measured && row.delta !== null ? (
          <span
            className="flex items-center gap-1"
            style={{ color: row.delta > 0 ? BRAND_VAR.emerald : regression ? BRAND_VAR.rose : undefined }}
          >
            {regression && <AlertTriangle className="h-3.5 w-3.5" aria-hidden />}
            {row.delta > 0 ? `+${row.delta}` : row.delta}
          </span>
        ) : null}
      </span>

      <span className="relative">
        <span
          className={`items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex sm:text-sm ${
            live ? "inline-flex" : measured ? "hidden text-foreground/70" : "inline-flex text-foreground/70"
          }`}
          style={
            live
              ? { color: BRAND_VAR.emerald, backgroundColor: tint("emerald", 16) }
              : { backgroundColor: phase === 1 && !measured ? tint("cyan", 12) : "color-mix(in srgb, var(--foreground) 5%, transparent)" }
          }
        >
          {live && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRAND_VAR.emerald }} aria-hidden />}
          {status}
        </span>
      </span>

      <span className="relative hidden justify-end sm:flex">
        {measured && !live && (
          <button
            type="button"
            onClick={onActivate}
            aria-label={`${words.activate} ${row.version} ${row.model}`}
            className="flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium transition-colors hover:bg-foreground/[0.04]"
            style={{ color: BRAND_VAR.emerald, borderColor: tint("emerald", 40) }}
          >
            <Rocket className="h-3.5 w-3.5" aria-hidden />
            {words.activate}
          </button>
        )}
      </span>
      <Meter className="col-span-full block sm:hidden" rating={row.rating} phase={phase} still={still} />
    </li>
  );
}

/** The rating bar: grows to the rating when measured, a partial cyan fill while measuring. */
function Meter({ className, rating, phase, still }: { className: string; rating: number; phase: number; still: boolean }) {
  const measured = phase >= 2;
  return (
    <span className={`relative h-2 overflow-hidden rounded-full bg-foreground/[0.06] ${className}`}>
      <motion.span
        initial={false}
        animate={{ scaleX: measured ? rating / 100 : phase === 1 ? 0.35 : 0 }}
        transition={ease(still, 0, phase === 1 ? 1.1 : 0.6)}
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: measured ? tint(scoreKey(rating), 75) : tint("cyan", 35), transformOrigin: "0% 50%" }}
      />
    </span>
  );
}
