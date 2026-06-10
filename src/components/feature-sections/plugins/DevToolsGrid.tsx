"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

import { AthenaOrb, FleetCell } from "./dev-tools-grid/AthenaFleetParts";
import {
  CELLS,
  CYCLE,
  ORB_STOPS,
  orbAt,
  stateAt,
  type CellState,
} from "./dev-tools-grid/athenaFleetData";

const TICK_MS = 1200;
// Reduced-motion static frame: mid-triage — orb resolving a cell, one stale,
// one still awaiting, the rest working. The whole scenario in one image.
const INITIAL_TICK = 12;

const NEEDS_STATES: CellState[] = ["awaiting", "stale"];

export default function DevToolsGrid() {
  const reduced = useReducedMotion() ?? false;
  const [tick, setTick] = useState(INITIAL_TICK);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced]);

  const phase = tick % CYCLE;
  const states = CELLS.map((_, i) => stateAt(i, phase));
  const spawned = states.filter((s) => s !== "hidden").length;
  const needs = states.filter((s) => NEEDS_STATES.includes(s)).length;
  const done = states.filter((s) => s === "done").length;
  const working = spawned - needs - done;
  const resolved = ORB_STOPS.filter((s) => phase >= s.depart).length;
  const orb = orbAt(phase);

  const statusLine =
    phase < 3
      ? `spawning ${spawned}/16…`
      : phase < 9
        ? needs > 0
          ? `${needs} blocked — Athena dispatching`
          : "fleet working"
        : phase < 17
          ? `Athena triaging · ${resolved}/4 resolved`
          : done === CELLS.length
            ? "16/16 green · 0 human interruptions"
            : `wrapping up · ${done}/16 green`;

  return (
    <div className="p-5">
      {/* Header — the fleet, with Athena on watch */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Image
            src="/athena/athena_baseline.jpg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-full border border-brand-cyan/30 object-cover shadow-[0_0_10px_rgba(34,211,238,0.35)]"
            aria-hidden="true"
          />
          <div>
            <div className="text-base font-semibold leading-tight text-foreground">Agent fleet</div>
            <div className="text-base font-mono text-foreground/60">16 CLIs · Athena on watch</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {needs > 0 && <SummaryPill dot="bg-violet-400" text="text-violet-300" label="Blocked" n={needs} />}
          {working > 0 && <SummaryPill dot="bg-blue-400" text="text-blue-300" label="Working" n={working} />}
          {done > 0 && <SummaryPill dot="bg-emerald-400" text="text-emerald-300" label="Done" n={done} />}
        </div>
      </div>

      {/* The grid, with Athena floating over it */}
      <div className="relative h-[300px]">
        <div className="grid h-full grid-cols-4 grid-rows-4 gap-2">
          {CELLS.map((cell, i) => (
            <FleetCell
              key={cell.name}
              name={cell.name}
              state={states[i]}
              ask={cell.ask}
              reduced={reduced}
            />
          ))}
        </div>
        <AthenaOrb x={orb.x} y={orb.y} resolving={orb.resolving} caption={orb.caption} reduced={reduced} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-foreground/[0.06] pt-3 text-base font-mono uppercase tracking-widest text-foreground/60">
        <span>{statusLine}</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
          autonomous
        </span>
      </div>
    </div>
  );
}

function SummaryPill({ dot, text, label, n }: { dot: string; text: string; label: string; n: number }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-foreground/[0.08] bg-foreground/[0.02] px-2 py-0.5 text-sm">
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      <span className="text-foreground/70">{label}</span>
      <span className={`font-semibold tabular-nums ${text}`}>{n}</span>
    </span>
  );
}
