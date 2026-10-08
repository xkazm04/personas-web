"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLoopGate } from "@/hooks/useLoopGate";
import { fillTemplate } from "@/lib/fillTemplate";
import { AthenaOrb } from "@/components/feature-sections/plugins/dev-tools-grid/AthenaFleetParts";
import {
  CELLS,
  CYCLE,
  ORB_STOPS,
  cellStatusText,
  orbAt,
  stateAt,
} from "@/components/feature-sections/plugins/dev-tools-grid/athenaFleetData";
import FleetCell from "./FleetCell";
import { TONE, mixC, progressAt } from "./fleetTone";
import { pluginsExtraCopy } from "@/i18n/pending/pluginsExtra";

const TICK_MS = 1200;
// Still frame (reduced motion / off screen): mid-triage, the whole story in one image.
const STILL_TICK = 12;

/**
 * Dev Tools at work: the live showcase's deterministic fleet clock (16
 * sessions spawn, three block on questions, one goes quiet, Athena glides to
 * each and answers on-policy), relit. The 16-segment meter in the header is
 * the fleet itself, one segment per session in its state colour.
 */
export default function FleetScene() {
  const copy = pluginsExtraCopy.fleet;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { run } = useLoopGate(rootRef);
  const [tick, setTick] = useState(STILL_TICK);

  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [run]);

  const phase = tick % CYCLE;
  const states = CELLS.map((_, i) => stateAt(i, phase));
  const needs = states.filter((s) => s === "awaiting" || s === "stale").length;
  const done = states.filter((s) => s === "done").length;
  const spawned = states.filter((s) => s !== "hidden").length;
  const resolved = ORB_STOPS.filter((s) => phase >= s.depart).length;
  const orb = orbAt(phase);

  const statusLine =
    phase < 3
      ? fillTemplate(copy.statusSpawning, { spawned })
      : phase < 9
        ? needs > 0
          ? fillTemplate(copy.statusBlocked, { needs })
          : copy.statusWorking
        : phase < 17
          ? fillTemplate(copy.statusTriaging, { resolved })
          : done === CELLS.length
            ? copy.statusAllGreen
            : fillTemplate(copy.statusWrapping, { done });

  return (
    <div ref={rootRef} className="flex h-full flex-col px-5 pb-4 pt-4">
      <div className="mb-3 flex items-center gap-3">
        <Image
          src="/athena/athena_baseline.jpg"
          alt=""
          aria-hidden="true"
          width={36}
          height={36}
          className="h-9 w-9 rounded-full border border-brand-cyan/40 object-cover"
        />
        <div className="min-w-0">
          <div className="text-[17px] font-semibold leading-tight text-foreground">{copy.title}</div>
          <div className="font-mono text-[13px] text-foreground/65">{copy.subtitle}</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex gap-[3px]" aria-hidden="true">
            {states.map((s, i) => (
              <span
                key={CELLS[i].name}
                className="h-5 w-[7px] rounded-[2px] transition-colors duration-500"
                style={{ background: s === "hidden" ? mixC("var(--foreground)", 10) : TONE[s].c }}
              />
            ))}
          </div>
          <span className="font-mono text-[15px] font-semibold tabular-nums text-foreground">
            {done}
            <span className="text-foreground/60">/{CELLS.length}</span>
          </span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="grid h-full grid-cols-4 grid-rows-4 gap-2">
          {CELLS.map((cell, i) => (
            <FleetCell
              key={cell.name}
              name={cell.name}
              state={states[i]}
              status={cellStatusText(states[i], copy.cell, cell.askKey && copy.asks[cell.askKey])}
              progress={progressAt(i, phase)}
              run={run}
            />
          ))}
        </div>
        <AthenaOrb x={orb.x} y={orb.y} resolving={orb.resolving} caption={orb.caption && copy.captions[orb.caption]} reduced={!run} />
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-[13px] uppercase tracking-[0.18em] text-foreground/65">
        <span aria-live="off">{statusLine}</span>
        <span className="flex items-center gap-2 text-brand-cyan">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" aria-hidden="true" />
          {copy.autonomous}
        </span>
      </div>
    </div>
  );
}
