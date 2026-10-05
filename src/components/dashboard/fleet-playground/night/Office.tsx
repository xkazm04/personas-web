"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import FleetFrame from "../FleetFrame";
import NeedsYouRail from "../NeedsYouRail";
import { FLEET, type FleetScale } from "../fleet-data";
import AgentRoom from "./AgentRoom";
import type { Att } from "./Building";
import Cutaway from "./Cutaway";
import FloorView from "./FloorView";
import { clearPendingAgent, peekPendingAgent } from "./nightStore";
import { railItems } from "./rail";
import { AttentionSummary, BottomStrip, Chip } from "./Strips";
import { TeamFooter, TeamTop } from "./TeamParts";
import { ranked, useNightSim } from "./useNightSim";
import s from "./night.module.css";
import o from "./office.module.css";

interface OfficeSceneProps {
  scale: FleetScale;
  /** null: the whole office floor (L0); a team: its building opened up (L1). */
  teamId: string | null;
  onTeamChange: (teamId: string | null) => void;
}

/**
 * Variant 2, "Night Shift", inside. L0 is the whole fleet as one open-plan
 * floor; L1 is one department's building cut away into rooms; L2 is one
 * agent's room over the whole frame. Escape steps back one level, to wherever
 * the agent was opened from.
 */
export default function OfficeScene({ scale, teamId, onTeamChange }: OfficeSceneProps) {
  const { t } = useTranslation();
  const city = t.fleetPlayground.city;
  const copy = t.fleetPlayground.office;
  const still = useStillMotion();
  const sim = useNightSim(scale);

  // A window clicked in the city opens straight into its room (from L1).
  const [agentId, setAgentId] = useState<string | null>(() => peekPendingAgent());
  useEffect(() => clearPendingAgent(), []);
  const [origin, setOrigin] = useState({ x: "50%", y: "50%" });
  const [hover, setHover] = useState<Att>(null);
  const [focus, setFocus] = useState<Att>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<string | null>(null);

  const present = useMemo(() => FLEET.teams.filter((tm) => sim.scoped.some((a) => a.team === tm.id)), [sim.scoped]);
  const team = teamId ? present.find((tm) => tm.id === teamId) ?? present[0] : null;
  const members = team ? sim.scoped.filter((a) => a.team === team.id) : sim.scoped;
  const agent = agentId ? sim.scoped.find((a) => a.id === agentId) ?? null : null;
  const queue = useMemo(() => ranked(members), [members]);
  const items = useMemo(() => railItems(city, queue, sim.simMs), [city, queue, sim.simMs]);
  const att = hover ?? focus;

  const openAgent = (id: string, el?: Element | null) => {
    const root = rootRef.current;
    if (el && root) {
      const r = el.getBoundingClientRect();
      const R = root.getBoundingClientRect();
      setOrigin({ x: `${r.left + r.width / 2 - R.left}px`, y: `${r.top + r.height / 2 - R.top}px` });
    }
    returnTo.current = id;
    setHover(null);
    setFocus(null);
    setAgentId(id);
  };
  const toFloor = () => { setAgentId(null); onTeamChange(null); };
  const toTeam = (id: string) => { setAgentId(null); onTeamChange(id); };
  const fieldEl = (id: string) => document.getElementById(team ? `ns-room-${id}` : `ns-desk-${id}`);

  // Hand focus back to the room or desk the agent was opened from.
  useEffect(() => {
    if (agent || !returnTo.current) return;
    fieldEl(returnTo.current)?.focus({ preventScroll: true });
    returnTo.current = null;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.ctrlKey || e.metaKey || e.altKey || tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        if (agentId) { e.preventDefault(); setAgentId(null); }
        else if (teamId) { e.preventDefault(); onTeamChange(null); }
      } else if ((e.key === "n" || e.key === "N") && queue.length) {
        e.preventDefault();
        setAgentId(queue[(queue.findIndex((a) => a.id === agentId) + 1) % queue.length].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [agentId, teamId, queue, onTeamChange]);

  const runs = sim.scoped.reduce((n, a) => n + a.runsToday, 0);
  const cost = sim.scoped.reduce((n, a) => n + a.costTodayUsd, 0);
  const success = sim.scoped.reduce((n, a) => n + a.successRate, 0) / Math.max(1, sim.scoped.length);

  const top = team ? (
    <TeamTop copy={copy} team={team} teams={present} scoped={sim.scoped} onFloor={toFloor} onTeam={toTeam} />
  ) : (
    <>
      <AttentionSummary agents={sim.scoped} />
      <div className="ml-auto flex items-center gap-1.5">
        <Chip><b className="text-foreground">{runs}</b> {copy.runsToday}</Chip>
        <Chip><b className="text-foreground">{Math.round(success * 100)}%</b> {copy.successRate}</Chip>
        <Chip><b className="text-foreground">${cost.toFixed(2)}</b> {copy.costToday}</Chip>
      </div>
    </>
  );

  const main = team ? (
    <div className={`${s.sky} absolute inset-0 overflow-hidden px-4 pb-2 pt-3`} style={{ ["--team" as string]: `hsl(${team.hue} 50% 50%)` }}>
      <div className={o.bg} />
      <div className={`relative h-full ${still ? "" : o.enter}`}>
        <Cutaway key={`${team.id}-${scale}`} team={team} members={members} city={city} copy={copy} still={still} onOpen={openAgent} onAttend={(id) => setHover(id ? { kind: "agent", id } : null)} />
      </div>
    </div>
  ) : (
    <FloorView scoped={sim.scoped} city={city} copy={copy} still={still} att={att} simMs={sim.simMs} setHover={setHover} setFocus={setFocus} openAgent={openAgent} openTeam={toTeam} />
  );

  return (
    <div ref={rootRef} className={`${s.theme} ${still ? s.still : ""} relative h-full`}>
      <div inert={!!agent} className="h-full">
        <FleetFrame
          label={team ? copy.label : copy.floorLabel}
          top={top}
          main={main}
          rail={
            <NeedsYouRail
              items={items}
              activeId={att?.kind === "agent" ? att.id : null}
              onHover={(id) => setHover(id ? { kind: "agent", id } : null)}
              onSelect={(id) => openAgent(id, fieldEl(id))}
              footer={team ? <TeamFooter copy={copy} members={members} events={sim.scopedEvents} byId={sim.byId} /> : undefined}
            />
          }
          bottom={<BottomStrip copy={city} events={sim.scopedEvents} byId={sim.byId} procs={sim.procs} simMs={sim.simMs} />}
        />
      </div>
      {agent && (
        <AgentRoom
          key={agent.id}
          a={agent}
          team={FLEET.teams.find((tm) => tm.id === agent.team) ?? present[0]}
          events={sim.scopedEvents}
          byId={sim.byId}
          simMs={sim.simMs}
          origin={origin}
          city={city}
          copy={copy}
          still={still}
          onBack={() => setAgentId(null)}
          onFloor={toFloor}
          onTeam={() => toTeam(agent.team)}
        />
      )}
    </div>
  );
}
