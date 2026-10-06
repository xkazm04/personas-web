"use client";

import { useEffect, useRef } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import type { FleetProcess } from "../fleet-data";

const TRAM_W = 64;

/**
 * Street art for the app's own work: while a system process runs, a small
 * tram shuttles along the street; the queued one waits at a stop. Text-free —
 * the bottom strip names them. Stylised.
 */
export default function Vehicles({ procs, W, ground, street }: { procs: FleetProcess[]; W: number; ground: number; street: number }) {
  const still = useStillMotion();
  const hidden = usePageVisibility();
  const tramRef = useRef<SVGGElement>(null);
  const running = procs.some((p) => p.status === "running");
  const queued = procs.some((p) => p.status === "queued");
  const h = Math.max(12, Math.min(22, street * 0.5));
  const y = ground + (street - h) / 2;

  useEffect(() => {
    if (still || hidden || !running) return;
    let id = 0;
    const span = W - 40 - TRAM_W;
    const frame = (t: number) => {
      // The tram shuttles along its line, easing into each terminus.
      const ph = (t % 52000) / 52000;
      const k = ph < 0.5 ? ph * 2 : 2 - ph * 2;
      tramRef.current?.setAttribute("transform", `translate(${(20 + span * k * k * (3 - 2 * k)).toFixed(1)} ${y})`);
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [still, hidden, running, W, y]);

  return (
    <g pointerEvents="none" aria-hidden="true">
      {queued && (
        <g transform={`translate(${W - 120} ${y})`}>
          <rect x={52} y={-6} width={2.5} height={h + 6} style={{ fill: "var(--ns-rail)" }} />
          <circle cx={53} cy={-7} r={4} style={{ fill: "var(--brand-amber)" }} />
          <rect width={44} height={h} rx={5} style={{ fill: "color-mix(in oklab, var(--brand-amber) 14%, var(--background))", stroke: "var(--brand-amber)" }} strokeWidth={1.2} />
        </g>
      )}
      {running && (
        <g ref={tramRef} transform={`translate(20 ${y})`}>
          <rect width={TRAM_W} height={h} rx={6} style={{ fill: "color-mix(in oklab, var(--brand-cyan) 14%, var(--background))", stroke: "var(--brand-cyan)" }} strokeWidth={1.2} />
          {[0.18, 0.42, 0.66].map((k) => (
            <rect key={k} x={TRAM_W * k} y={h * 0.25} width={TRAM_W * 0.16} height={h * 0.35} rx={1.5} style={{ fill: "var(--brand-cyan)" }} opacity={0.6} />
          ))}
        </g>
      )}
    </g>
  );
}
