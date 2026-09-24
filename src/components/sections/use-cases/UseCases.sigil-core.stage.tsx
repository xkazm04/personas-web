"use client";

import type { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import ConnectorIcon from "./components/ConnectorIcon";
import { tools } from "./data";
import PersonaSigil from "./UseCases.sigil-core.sigil";
import {
  DIMS, PERSONA, STAGE, TOOL_DIMS, TOOL_COUNT, jobsFor, lift, petalAngle, polar, portAngle,
} from "./UseCases.sigil-core.model";

/**
 * The stage: the persona sigil fixed in the centre, the eight real tools on an
 * outer ring of ports (offset from the petals - a tool is not a petal), and a
 * spoke from each plugged-in port to the core. Ports are a tablist; the jobs
 * panel is their tabpanel.
 */
export default function SigilStage({
  names,
  attached,
  selected,
  armed,
  onChoose,
  idPrefix,
  panelId,
}: {
  names: string[];
  attached: number;
  selected: number;
  armed: boolean;
  onChoose: (i: number) => void;
  idPrefix: string;
  panelId: string;
}) {
  const lit = attached > 0 ? TOOL_DIMS : new Set<never>();
  const jobs = jobsFor(attached);
  const sigilInset = (100 - STAGE.sigil) / 2;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (selected + step + TOOL_COUNT) % TOOL_COUNT;
    onChoose(next);
    document.getElementById(`${idPrefix}-port-${next}`)?.focus();
  };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] text-foreground">
      {/* Ring and spokes: which tools are plugged into the one core. */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="50" cy="50" r={STAGE.portR} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.25" />
        {tools.map((tl, i) => {
          const a = polar(portAngle(i), STAGE.portR - 5.6);
          const b = polar(portAngle(i), STAGE.coreR + 1.2);
          const on = i < attached;
          const sel = on && i === selected;
          return (
            <motion.line
              key={tl.id}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              strokeWidth={sel ? 0.55 : 0.35}
              strokeDasharray={sel ? undefined : "0.8 1.2"}
              strokeLinecap="round"
              style={{ stroke: lift(tl.color) }}
              initial={false}
              animate={{ opacity: sel ? 0.95 : on ? 0.3 : 0 }}
              transition={{ duration: 0.35 }}
            />
          );
        })}
      </svg>

      <div className="absolute" style={{ left: `${sigilInset}%`, top: `${sigilInset}%`, width: `${STAGE.sigil}%`, height: `${STAGE.sigil}%` }}>
        <PersonaSigil lit={lit} flashKey={attached} animate={armed} className="h-full w-full" />
      </div>

      {/* Petal labels: the app's eight dimension names. */}
      {DIMS.map((d, i) => {
        const p = polar(petalAngle(i), STAGE.petalLabelR);
        const on = lit.has(d.dim);
        return (
          <span
            key={d.dim}
            aria-hidden
            className={`absolute hidden -translate-x-1/2 -translate-y-1/2 font-mono text-xs uppercase tracking-wider transition-colors duration-500 sm:block ${on ? "" : "text-muted-dark"}`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, color: on ? BRAND_VAR[d.brand] : undefined }}
          >
            {d.label}
          </span>
        );
      })}

      {/* Core: the identity that never changes, and what it has picked up. */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center leading-tight">
        <span className="text-sm font-bold" style={{ color: BRAND_VAR[PERSONA.brand] }}>{PERSONA.name}</span>
        <span className="font-mono text-xs tabular-nums text-muted">{jobs} jobs</span>
      </div>

      <div role="tablist" aria-label="Tools this persona can use" onKeyDown={onKey}>
        {tools.map((tl, i) => {
          const p = polar(portAngle(i), STAGE.portR);
          const on = i < attached;
          const sel = on && i === selected;
          const edge = lift(tl.color);
          return (
            <div key={tl.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              <button
                id={`${idPrefix}-port-${i}`}
                type="button"
                role="tab"
                aria-selected={sel}
                aria-controls={panelId}
                aria-label={`${names[i]}${on ? "" : " (not plugged in yet)"}`}
                tabIndex={i === selected ? 0 : -1}
                onClick={() => onChoose(i)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-[background-color,border-color,box-shadow,opacity] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan sm:h-11 sm:w-11 ${on ? "" : "border-dashed border-glass-hover opacity-60"}`}
                style={on ? {
                  borderColor: sel ? edge : `color-mix(in srgb, ${edge} 30%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${tl.color} ${sel ? 16 : 8}%, transparent)`,
                  boxShadow: sel ? `0 0 18px color-mix(in srgb, ${edge} 35%, transparent)` : undefined,
                } : undefined}
              >
                <ConnectorIcon src={tl.icon.src} size={18} />
              </button>
              <span
                aria-hidden
                className={`absolute left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-xs sm:block ${p.y < 50 ? "bottom-full mb-1" : "top-full mt-1"} ${sel ? "text-foreground" : "text-muted-dark"}`}
              >
                {names[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
