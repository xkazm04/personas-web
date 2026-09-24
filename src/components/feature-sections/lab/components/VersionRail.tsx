"use client";

import { motion, type Transition } from "framer-motion";
import { Pin, Rocket, AlertTriangle } from "lucide-react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import type { Translations } from "@/i18n/en";
import {
  deltaVsBaseline,
  isRegression,
  type LedgerAction,
  type LedgerRow,
  type LedgerState,
} from "../ledger";

/**
 * The Lab's version rail — the website's rendering of the desktop Lab's
 * Versions & Ratings table. One chip per version the tabs produce and
 * measure; exactly one carries the LIVE beacon. Activate moves the beacon
 * (and re-activating the previous version is the rollback); Pin as baseline
 * re-anchors every chip's Δ. All state lives in `ledger.ts`; this file only
 * renders it and dispatches from click handlers.
 */
export default function VersionRail({
  ledger,
  dispatch,
}: {
  ledger: LedgerState;
  dispatch: (action: LedgerAction) => void;
}) {
  const still = useStillMotion();
  const { t } = useTranslation();
  const l = t.labVersions;
  // The beacon glides between chips via a shared layoutId (transform-only).
  // Reduced motion keeps the same DOM and jumps instantly.
  const glide: Transition = still
    ? { duration: 0 }
    : { type: "spring", stiffness: 380, damping: 32 };

  return (
    <section
      aria-labelledby="lab-versions-title"
      className="relative mt-4 rounded-xl border border-foreground/[0.10] bg-background/80 px-5 py-4 backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3
          id="lab-versions-title"
          className="text-base font-mono font-semibold uppercase tracking-wider text-foreground"
        >
          {l.title}
        </h3>
        <p className="text-base text-foreground/70">{l.hint}</p>
      </div>
      <p className="sr-only" aria-live="polite">
        {l.nowLive.replace("{version}", ledger.liveId)}
      </p>

      <ol className="relative mt-4 grid gap-3 sm:grid-cols-2">
        {ledger.rows.map((row) => (
          <VersionChip
            key={row.id}
            row={row}
            live={row.id === ledger.liveId}
            baseline={row.id === ledger.baselineId}
            delta={deltaVsBaseline(ledger, row.id)}
            labels={l}
            glide={glide}
            onActivate={() => dispatch({ type: "activate", id: row.id })}
            onPin={() => dispatch({ type: "baseline", id: row.id })}
          />
        ))}
      </ol>
    </section>
  );
}

function formatDelta(delta: number | null): string {
  if (delta === null) return "—";
  return delta > 0 ? `+${delta}` : String(delta);
}

function VersionChip({
  row,
  live,
  baseline,
  delta,
  labels: l,
  glide,
  onActivate,
  onPin,
}: {
  row: LedgerRow;
  live: boolean;
  baseline: boolean;
  delta: number | null;
  labels: Translations["labVersions"];
  glide: Transition;
  onActivate: () => void;
  onPin: () => void;
}) {
  const regression = isRegression(delta);
  return (
    <li
      data-lab-version={row.id}
      className={`relative rounded-lg border px-4 py-3 transition-colors ${
        live
          ? "border-brand-emerald/40 bg-brand-emerald/[0.05]"
          : "border-foreground/[0.10] bg-foreground/[0.02]"
      }`}
    >
      {live && (
        <motion.span
          layoutId="lab-live-beacon"
          transition={glide}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-brand-emerald/70"
        />
      )}
      <div className="relative flex items-center justify-between gap-2">
        <span className="font-mono text-lg font-semibold text-foreground">{row.id}</span>
        <span className="flex items-center gap-2 text-base font-mono uppercase tracking-wider">
          {baseline && (
            <span className="flex items-center gap-1 text-brand-amber">
              <Pin className="h-3.5 w-3.5" aria-hidden />
              {l.baseline}
            </span>
          )}
          {live ? (
            <span className="flex items-center gap-1.5 text-brand-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" aria-hidden />
              {l.live}
            </span>
          ) : (
            <span className="text-foreground/70">{l.experimental}</span>
          )}
        </span>
      </div>

      <dl className="relative mt-3 grid grid-cols-2 gap-3 font-mono">
        <div>
          <dt className="text-base uppercase tracking-wider text-foreground/60">{l.rating}</dt>
          <dd className="text-2xl font-bold tabular-nums text-foreground">{row.rating}</dd>
        </div>
        <div>
          <dt className="text-base uppercase tracking-wider text-foreground/60">
            {l.deltaVsBaseline}
          </dt>
          <dd
            className={`flex items-center gap-1.5 text-2xl font-bold tabular-nums ${
              regression ? "text-brand-rose" : "text-foreground/85"
            }`}
          >
            {formatDelta(delta)}
            {regression && (
              <span className="flex items-center gap-1 rounded-full border border-brand-rose/40 px-2 py-0.5 text-base font-medium uppercase tracking-wider">
                <AlertTriangle className="h-3 w-3" aria-hidden />
                {l.regression}
              </span>
            )}
          </dd>
        </div>
      </dl>

      <div className="relative mt-3 flex flex-wrap gap-2">
        {!live && (
          <button
            type="button"
            onClick={onActivate}
            aria-label={l.activateVersion.replace("{version}", row.id)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-brand-emerald/40 bg-brand-emerald/10 px-3 text-base font-mono uppercase tracking-wider text-brand-emerald transition-colors hover:bg-brand-emerald/15"
          >
            <Rocket className="h-3.5 w-3.5" aria-hidden />
            {l.activate}
          </button>
        )}
        {!baseline && (
          <button
            type="button"
            onClick={onPin}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-foreground/[0.12] px-3 text-base font-mono uppercase tracking-wider text-foreground/80 transition-colors hover:bg-foreground/[0.04]"
          >
            <Pin className="h-3.5 w-3.5" aria-hidden />
            {l.pinBaseline}
          </button>
        )}
      </div>
    </li>
  );
}
