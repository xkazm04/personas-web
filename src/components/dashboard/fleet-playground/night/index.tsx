"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import FleetFrame from "../FleetFrame";
import NeedsYouRail from "../NeedsYouRail";
import { FLEET, type FleetScale } from "../fleet-data";
import type { Att } from "./Building";
import CityField from "./CityField";
import { layoutCity } from "./city-layout";
import Legend from "./Legend";
import { meters } from "./Moon";
import { setPendingAgent } from "./nightStore";
import { railItems } from "./rail";
import { AttentionSummary, BottomStrip, MeterChips } from "./Strips";
import { useFieldSize } from "./useFieldSize";
import { ranked, useNightSim } from "./useNightSim";
import s from "./night.module.css";

interface NightCityProps {
  scale: FleetScale;
  onOpenTeam: (teamId: string) => void;
}

const DOLLY_MS = 650;

/**
 * Variant 2, "Night Shift": the fleet as a small city at night. Each team is a
 * building drawn for its trade, each agent a window in the playground's shared
 * state language; every window that needs you lights a beacon on its roof and
 * a row in the rail. Open a building and the camera dollies in before the
 * office takes over. Demo fleet, stylised illustration.
 */
export default function NightCity({ scale, onOpenTeam }: NightCityProps) {
  const { t } = useTranslation();
  const copy = t.fleetPlayground.city;
  const still = useStillMotion();
  const sim = useNightSim(scale);
  const fieldRef = useRef<HTMLDivElement>(null);
  const field = useFieldSize(fieldRef);

  const [hover, setHover] = useState<Att>(null);
  const [focus, setFocus] = useState<Att>(null);
  const [legend, setLegend] = useState(false);
  const [dolly, setDolly] = useState<string | null>(null);
  const timer = useRef(0);
  const legendBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const L = useMemo(() => (field.w && field.h ? layoutCity(sim.scoped, FLEET.teams, field.w, field.h) : null), [sim.scoped, field.w, field.h]);
  const queue = useMemo(() => ranked(sim.scoped), [sim.scoped]);
  const items = useMemo(() => railItems(copy, queue, sim.simMs), [copy, queue, sim.simMs]);
  const usage = meters(sim.simMs);
  const att = dolly ? null : hover ?? focus;
  const attAgentId = att?.kind === "agent" ? att.id : null;

  const goInside = useCallback(
    (teamId: string) => {
      if (still) return onOpenTeam(teamId);
      setDolly(teamId);
      timer.current = window.setTimeout(() => onOpenTeam(teamId), DOLLY_MS);
    },
    [still, onOpenTeam],
  );
  const openAgent = useCallback(
    (id: string) => {
      const a = sim.byId.get(id);
      if (!a) return;
      setPendingAgent(id);
      goInside(a.team);
    },
    [sim.byId, goInside],
  );

  // N walks everyone who needs you, most urgent first; Escape closes the legend.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.ctrlKey || e.metaKey || e.altKey || tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape" && legend) {
        e.preventDefault();
        setLegend(false);
        legendBtn.current?.focus();
      } else if ((e.key === "n" || e.key === "N") && queue.length) {
        e.preventDefault();
        const cur = queue.findIndex((a) => a.id === attAgentId);
        document.getElementById(`ns-w-${queue[(cur + 1) % queue.length].id}`)?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [legend, queue, attAgentId]);

  const top = (
    <>
      <AttentionSummary agents={sim.scoped} />
      <MeterChips copy={copy} meters={usage} />
      <span className="ml-auto hidden whitespace-nowrap text-xs text-muted-dark lg:inline">
        <kbd className="mr-1 rounded border border-glass-hover px-1.5 font-mono text-foreground">N</kbd>
        {copy.hintNext}
      </span>
      <button
        ref={legendBtn}
        type="button"
        aria-expanded={legend}
        aria-controls="ns-legend"
        onClick={() => setLegend((v) => !v)}
        className="flex-none rounded-lg border border-glass-hover px-2.5 py-0.5 text-sm text-foreground transition-colors hover:border-brand-cyan/60 focus-visible:outline-2 focus-visible:outline-brand-cyan lg:ml-0 ml-auto"
      >
        {copy.legendButton}
      </button>
    </>
  );

  const main = (
    <div ref={fieldRef} className={`${s.sky} ${still ? s.still : ""} absolute inset-0 overflow-hidden`}>
      {L && (
        <CityField
          L={L}
          scale={scale}
          copy={copy}
          still={still}
          att={att}
          byId={sim.byId}
          meters={usage}
          procs={sim.procs}
          packet={sim.packet}
          simMs={sim.simMs}
          dolly={dolly}
          setHover={setHover}
          setFocus={setFocus}
          openAgent={openAgent}
          openTeam={goInside}
        />
      )}
      {legend && <Legend copy={copy} still={still} />}
    </div>
  );

  return (
    <div className={`${s.theme} h-full`}>
      <FleetFrame
        label={copy.label}
        top={top}
        main={main}
        rail={<NeedsYouRail items={items} activeId={attAgentId} onHover={(id) => setHover(id ? { kind: "agent", id } : null)} onSelect={openAgent} />}
        bottom={<BottomStrip copy={copy} events={sim.scopedEvents} byId={sim.byId} procs={sim.procs} simMs={sim.simMs} />}
      />
    </div>
  );
}
