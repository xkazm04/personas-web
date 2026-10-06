"use client";

import { Fragment } from "react";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { MONO, fsOf } from "../shared/frame";
import { place } from "../shared/place";
import type { SceneState } from "./data";
import type { MapGeo } from "./geometry";

/**
 * The map's own furniture: its title with a compass, the end-of-road label,
 * and the ledger in the corner - how many questions each trip took. The
 * second number is the claim: zero.
 */
export default function Ledger({ geo, scene }: { geo: MapGeo; scene: SceneState }) {
  const { t } = useTranslation();
  const c = t.athenaLab.memory.v3;
  const fs = fsOf(geo.W);
  const at = place(geo);
  const end = geo.stops[geo.stops.length - 1];
  const start = geo.stops[0];
  const rows = [
    { label: c.firstTime, n: scene.asked, on: scene.trip >= 1, lit: false },
    { label: c.later, n: 0, on: scene.trip === 2, lit: scene.secondDone },
  ];

  return (
    <>
      <span className={`absolute flex items-center gap-[0.6em] text-muted-dark ${MONO}`} style={{ ...at(geo.title), ...fs(geo.fs.label, 12) }}>
        <svg viewBox="-12 -12 24 24" className="h-[1.6em] w-[1.6em]" fill="none" aria-hidden="true">
          <circle r={10.5} stroke="currentColor" strokeWidth={1.2} />
          <path d="M 0 -8.5 L 2.6 0 L 0 8.5 L -2.6 0 Z" fill={BRAND_VAR.cyan} fillOpacity={0.8} />
        </svg>
        {c.title}
      </span>

      <span
        className={`absolute -translate-x-1/2 text-foreground ${MONO}`}
        style={{ ...at({ x: start.x, y: start.y + 24 }), ...fs(geo.fs.label, 12) }}
      >
        {c.you}
      </span>
      <span
        className={`absolute -translate-x-1/2 ${MONO}`}
        style={{ ...at({ x: end.x, y: end.y + 46 }), ...fs(geo.fs.label, 12), color: BRAND_VAR.cyan }}
      >
        {c.done}
      </span>

      <div
        className="absolute grid grid-cols-[auto_auto] items-baseline gap-x-[1.2em] gap-y-[0.1em]"
        style={{ ...at(geo.ledger), ...fs(geo.fs.label, 12) }}
      >
        <span className={`col-span-2 mb-[0.3em] text-muted-dark ${MONO}`}>{c.asked}</span>
        {rows.map((r) => (
          <Fragment key={r.label}>
            <span className={`text-muted-dark duration-500 transition-opacity ${MONO}`} style={{ opacity: r.on ? 1 : 0.5 }}>
              {r.label}
            </span>
            <span
              className="font-semibold tabular-nums leading-none duration-500 transition-opacity"
              style={{ ...fs(geo.fs.count, 22), color: r.lit ? BRAND_VAR.cyan : "var(--foreground)", opacity: r.on ? 1 : 0.35 }}
            >
              {r.on ? r.n : "-"}
            </span>
          </Fragment>
        ))}
      </div>
    </>
  );
}
