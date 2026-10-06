"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { railItems } from "./rail";
import { AttentionSummary, BottomStrip, MeterChips } from "./Strips";
import { useFieldSize } from "./useFieldSize";
import { ranked, useNightSim } from "./useNightSim";
import s from "./night.module.css";

/**
 * Variant 2, "Night Shift": the fleet as a small city at night, kept as a
 * presentation piece. Each team is a building drawn for its trade, each agent
 * a window in the playground's shared state language; every window that needs
 * you lights a beacon on its roof and a row in the rail. Hovering shows a card;
 * clicking a window, a building or a rail row pins it (Esc or a click on the
 * sky unpins). Demo fleet, stylised illustration.
 */
export default function NightCity({ scale }: { scale: FleetScale }) {
  const { t } = useTranslation();
  const copy = t.personasMonitor.city;
  const still = useStillMotion();
  const sim = useNightSim(scale);
  const fieldRef = useRef<HTMLDivElement>(null);
  const field = useFieldSize(fieldRef);

  const [hover, setHover] = useState<Att>(null);
  const [focus, setFocus] = useState<Att>(null);
  const [pinned, setPinned] = useState<Att>(null);
  const [legend, setLegend] = useState(false);
  const legendBtn = useRef<HTMLButtonElement>(null);

  const L = useMemo(() => (field.w && field.h ? layoutCity(sim.scoped, FLEET.teams, field.w, field.h) : null), [sim.scoped, field.w, field.h]);
  const queue = useMemo(() => ranked(sim.scoped), [sim.scoped]);
  const items = useMemo(() => railItems(copy, queue, sim.simMs), [copy, queue, sim.simMs]);
  const usage = meters(sim.simMs);
  // Hover wins while it lasts; the pinned card comes back when it ends.
  const att = hover ?? focus ?? pinned;
  const attAgentId = att?.kind === "agent" ? att.id : null;
  const pinAgent = (id: string) => setPinned({ kind: "agent", id });
  const pinTeam = (id: string) => setPinned({ kind: "team", id });

  // N walks everyone who needs you, most urgent first; Escape closes the
  // legend first, then unpins the card.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.ctrlKey || e.metaKey || e.altKey || tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape" && legend) {
        e.preventDefault();
        setLegend(false);
        legendBtn.current?.focus();
      } else if (e.key === "Escape" && pinned) {
        e.preventDefault();
        setPinned(null);
      } else if ((e.key === "n" || e.key === "N") && queue.length) {
        e.preventDefault();
        const cur = queue.findIndex((a) => a.id === attAgentId);
        document.getElementById(`ns-w-${queue[(cur + 1) % queue.length].id}`)?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [legend, pinned, queue, attAgentId]);

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
          pinned={pinned}
          setHover={setHover}
          setFocus={setFocus}
          pinAgent={pinAgent}
          pinTeam={pinTeam}
          unpin={() => setPinned(null)}
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
        rail={<NeedsYouRail items={items} activeId={attAgentId} onHover={(id) => setHover(id ? { kind: "agent", id } : null)} onSelect={pinAgent} />}
        bottom={<BottomStrip copy={copy} events={sim.scopedEvents} byId={sim.byId} procs={sim.procs} simMs={sim.simMs} />}
      />
    </div>
  );
}
