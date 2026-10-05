"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import { FLEET, type FleetScale } from "../fleet-data";
import Backdrop from "./Backdrop";
import Building, { type Att } from "./Building";
import { DH, DW, GROUND, layoutCity } from "./city-layout";
import { placeLanterns, skyObstacles } from "./lantern-placement";
import { BeamDefs, Beams, Tags } from "./Lanterns";
import Legend from "./Legend";
import Moon, { meters } from "./Moon";
import { setPendingAgent } from "./nightStore";
import Packets from "./Packets";
import { Display, MoonLabels, moonText, Summary, summaryText } from "./SkyDisplay";
import Ticker from "./Ticker";
import { useFitStage } from "./useFitStage";
import { ranked, useNightSim } from "./useNightSim";
import Vehicles from "./Vehicles";
import { AgentWires, RoofWires } from "./Wires";
import s from "./night.module.css";

interface NightCityProps {
  scale: FleetScale;
  onOpenTeam: (teamId: string) => void;
}

const DOLLY_MS = 650;

/**
 * Variant 2, "Night Shift": the fleet as a small city at night. Each team is a
 * building drawn for its trade, each agent a window; every window that needs
 * you throws a beam into the sky with a lantern naming it. Hover or focus a
 * window and the sky becomes its stage; open a building and the camera dollies
 * in before the office takes over. Demo fleet, stylised illustration.
 */
export default function NightCity({ scale, onOpenTeam }: NightCityProps) {
  const { t } = useTranslation();
  const copy = t.fleetPlayground.city;
  const still = useStillMotion();
  const sim = useNightSim(scale);
  const frameRef = useRef<HTMLDivElement>(null);
  const fit = useFitStage(frameRef, DW, DH);

  const [hover, setHover] = useState<Att>(null);
  const [focus, setFocus] = useState<Att>(null);
  const [legend, setLegend] = useState(false);
  const [dolly, setDolly] = useState<string | null>(null);
  const timer = useRef(0);
  const legendBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const layout = useMemo(() => layoutCity(sim.scoped, FLEET.teams), [sim.scoped]);
  const queue = useMemo(() => ranked(sim.scoped), [sim.scoped]);
  const [five, seven] = meters(sim.simMs);
  // The summary and the moon block are obstacles for the tags, measured from
  // the same strings they render, in the same design units the tags use.
  const sum = summaryText(copy, sim.scoped);
  const moon = moonText(copy, five, seven);
  const obstacleKey = [sum.ny, sum.words, sum.sub, moon.fiveTitle, moon.five, moon.sevenTitle, moon.seven].join("|");
  const obstacles = useMemo(() => {
    const [ny, words, sub, ...moonLines] = obstacleKey.split("|");
    return skyObstacles(`${ny} ${words}`, sub, moonLines);
  }, [obstacleKey]);
  const { tags: lanterns, halos } = useMemo(() => placeLanterns(layout, queue, copy, obstacles), [layout, queue, copy, obstacles]);

  const att = dolly ? null : hover ?? focus;
  const attAgent = att?.kind === "agent" ? sim.byId.get(att.id) ?? null : null;
  const attTeamId = att?.kind === "team" ? att.id : attAgent?.team ?? null;
  const attBuilding = att?.kind === "team" ? layout.teams.find((b) => b.t.id === att.id) ?? null : null;

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
  const onTagHover = useCallback((id: string | null) => setHover(id ? { kind: "agent", id } : null), []);

  // N walks everyone who needs you, most urgent first; Escape closes the legend.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.ctrlKey || e.metaKey || e.altKey || tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape" && legend) {
        e.preventDefault();
        setLegend(false);
        legendBtn.current?.focus();
      } else if (e.key === "n" || e.key === "N") {
        if (!queue.length) return;
        e.preventDefault();
        const cur = attAgent ? queue.findIndex((a) => a.id === attAgent.id) : -1;
        document.getElementById(`ns-w-${queue[(cur + 1) % queue.length].id}`)?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [legend, queue, attAgent]);

  const dollyTarget = dolly ? layout.teams.find((b) => b.t.id === dolly) : null;
  let wrapStyle: React.CSSProperties | undefined;
  if (dollyTarget) {
    const top = dollyTarget.anchor - 10;
    const hgt = GROUND - top;
    const k = Math.min(3.2, 640 / hgt, 900 / dollyTarget.w);
    wrapStyle = { transform: `translate(${DW * 0.62 - dollyTarget.cx * k}px, ${DH * 0.55 - (top + hgt / 2) * k}px) scale(${k})`, opacity: 0 };
  }

  return (
    <div ref={frameRef} role="group" aria-label={copy.label} className={`${s.theme} ${still ? s.still : ""} h-full w-full overflow-hidden`}>
      <div
        className={`${s.stage} ${att ? s.hasAtt : ""}`}
        style={{ width: DW, height: DH, visibility: fit.scale ? "visible" : "hidden", transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale || 1})` }}
        onMouseLeave={() => setHover(null)}
      >
        <Backdrop />
        <div className={s.cityWrap} style={wrapStyle}>
          <svg className={s.overflowSvg} width={DW} height={DH} viewBox={`0 0 ${DW} ${DH}`}>
            <defs>
              <linearGradient id="ns-run-fill" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" style={{ stopColor: "var(--brand-cyan)" }} stopOpacity={0.75} />
                <stop offset="1" style={{ stopColor: "var(--brand-cyan)" }} stopOpacity={0.3} />
              </linearGradient>
              <BeamDefs lanterns={lanterns} />
            </defs>
            <Moon cx={DW - 100} cy={136} r={46} five={five} seven={seven} />
            <RoofWires layout={layout} byId={sim.byId} />
            <g className={`${s.fade} ${s.dimOnAtt}`}>
              <Beams lanterns={lanterns} halos={halos} />
            </g>
            {layout.teams.map((b) => (
              <Building
                key={`${b.t.id}-${scale}`}
                b={b}
                tier={layout.tier}
                copy={copy}
                still={still}
                entrance
                lifted={attTeamId === b.t.id}
                attAgent={attAgent?.team === b.t.id ? attAgent.id : null}
                attTeam={att?.kind === "team" && att.id === b.t.id}
                onHover={setHover}
                onFocusAtt={setFocus}
                onOpenAgent={openAgent}
                onOpenTeam={goInside}
              />
            ))}
            <AgentWires layout={layout} agentId={attAgent?.id ?? null} />
            <Packets packet={sim.packet} layout={layout} paused={!!dolly} />
            <Vehicles copy={copy} procs={sim.procs} simMs={sim.simMs} />
          </svg>
          <div className={`${s.fade} ${s.dimOnAtt} absolute inset-0`} style={{ pointerEvents: "none" }}>
            <Tags lanterns={lanterns} still={still} onHover={onTagHover} onOpen={openAgent} />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0" style={{ opacity: dolly ? 0 : 1, transition: "opacity .4s" }}>
          <Summary copy={copy} scoped={sim.scoped} />
          <MoonLabels copy={copy} five={five} seven={seven} />
          <Display copy={copy} agent={attAgent} team={attBuilding} teamName={attAgent ? FLEET.teams.find((x) => x.id === attAgent.team)?.name ?? "" : ""} simMs={sim.simMs} />
          <Ticker copy={copy} events={sim.scopedEvents} byId={sim.byId} width={DW} still={still} />
        </div>
      </div>

      <div className="absolute right-4 top-3 z-30 flex items-center gap-3 text-[15px] text-muted-dark">
        <span>
          <kbd className="mr-1 rounded border border-glass-hover px-1.5 font-mono text-foreground">N</kbd>
          {copy.hintNext}
        </span>
        <button
          ref={legendBtn}
          type="button"
          aria-expanded={legend}
          aria-controls="ns-legend"
          onClick={() => setLegend((v) => !v)}
          className="rounded-lg border border-glass-hover px-3 py-1 text-foreground transition-colors hover:border-brand-cyan/60 focus-visible:outline-2 focus-visible:outline-brand-cyan"
          style={{ background: "var(--ns-panel)" }}
        >
          {copy.legendButton}
        </button>
      </div>
      {legend && <Legend copy={copy} still={still} />}
    </div>
  );
}
