"use client";

import { useEffect, useRef } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import type { FleetProcess } from "../fleet-data";
import { DW, GROUND } from "./city-layout";
import { textTone } from "./palette";
import { fill, fmtAgo, fmtDur, type CityCopy } from "./vocab";
import { LABEL } from "./lantern-placement";

const LO = 40;
const vw = (label: string, sub: string) => Math.round(label.length * 9.2 + sub.length * 8 + 46);

function Vehicle({ kind, label, sub, color, w }: { kind: "tram" | "van"; label: string; sub: string; color: string; w: number }) {
  return (
    <>
      {kind === "tram" && <path d={`M ${w * 0.45} 0 L ${w * 0.52} -14 L ${w * 0.6} 0`} style={{ stroke: "var(--ns-rail)" }} strokeWidth={2} fill="none" />}
      <rect width={w} height={34} rx={kind === "tram" ? 9 : 8} style={{ fill: `color-mix(in oklab, ${color} 12%, var(--background))`, stroke: color }} strokeWidth={1.5} />
      {kind === "tram" && <rect x={6} y={5} width={w - 12} height={4} rx={2} style={{ fill: color }} opacity={0.5} />}
      <circle cx={22} cy={36} r={6} style={{ fill: "var(--background)", stroke: "var(--ns-rail)" }} strokeWidth={2} />
      <circle cx={w - 22} cy={36} r={6} style={{ fill: "var(--background)", stroke: "var(--ns-rail)" }} strokeWidth={2} />
      <text x={14} y={23} fontSize={LABEL} className="font-sans" style={{ fill: "var(--foreground)" }}>
        <tspan fontWeight={700}>{label}</tspan>
        <tspan dx={8} style={{ fill: textTone(color) }}>{sub}</tspan>
      </text>
    </>
  );
}

/**
 * The app's own work, which belongs to no agent: the running process is a tram
 * shuttling along the street, the queued one waits at the stop, the finished
 * one is parked. Stylised.
 */
export default function Vehicles({ copy, procs, simMs }: { copy: CityCopy; procs: FleetProcess[]; simMs: number }) {
  const still = useStillMotion();
  const hidden = usePageVisibility();
  const tramRef = useRef<SVGGElement>(null);
  const run = procs.find((p) => p.status === "running");
  const queued = procs.find((p) => p.status === "queued");
  const done = procs.find((p) => p.status === "completed");

  const runSub = run ? fill(copy.vehicles.running, { t: fmtDur(run.startedAgoMs + simMs) }) : "";
  const tramW = run ? vw(run.label, runSub) : 0;
  const doneSub = done ? fill(copy.vehicles.done, { age: fmtAgo(copy, (done.startedAgoMs + simMs) / 60000) }) : "";
  const doneW = done ? vw(done.label, doneSub) : 0;
  const doneX = DW - 36 - doneW;
  const qW = queued ? vw(queued.label, copy.vehicles.waiting) : 0;
  const qX = doneX - qW - 44;

  useEffect(() => {
    if (still || hidden || !run) return;
    let id = 0;
    const span = DW - 80 - tramW;
    const frame = (t: number) => {
      // The tram shuttles along its line, easing into each terminus.
      const ph = (t % 52000) / 52000;
      const k = ph < 0.5 ? ph * 2 : 2 - ph * 2;
      const x = LO + span * k * k * (3 - 2 * k);
      tramRef.current?.setAttribute("transform", `translate(${x.toFixed(1)} ${GROUND + 18})`);
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [still, hidden, run, tramW]);

  return (
    <g pointerEvents="none" aria-hidden="true">
      {done && (
        <g transform={`translate(${doneX} ${GROUND + 54})`}>
          <Vehicle kind="van" label={done.label} sub={doneSub} color="var(--status-success)" w={doneW} />
        </g>
      )}
      {queued && (
        <g transform={`translate(${qX} ${GROUND + 54})`}>
          <rect x={qW + 12} y={-2} width={3} height={40} style={{ fill: "var(--ns-rail)" }} />
          <circle cx={qW + 13.5} cy={-4} r={8} style={{ fill: "var(--brand-amber)" }} opacity={0.85} />
          <Vehicle kind="van" label={queued.label} sub={copy.vehicles.waiting} color="var(--brand-amber)" w={qW} />
        </g>
      )}
      {run && (
        <g ref={tramRef} transform={`translate(${LO} ${GROUND + 18})`}>
          <Vehicle kind="tram" label={run.label} sub={runSub} color="var(--brand-cyan)" w={tramW} />
        </g>
      )}
    </g>
  );
}
