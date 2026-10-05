"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { useStillMotion } from "@/hooks/useStillMotion";
import { FLEET, type FleetScale } from "../fleet-data";
import AgentRoom from "./AgentRoom";
import Cutaway from "./Cutaway";
import { clearPendingAgent, peekPendingAgent } from "./nightStore";
import OfficeInfo from "./OfficeInfo";
import { hueText, textTone } from "./palette";
import { ranked, useNightSim } from "./useNightSim";
import s from "./night.module.css";
import o from "./office.module.css";

interface OfficeSceneProps {
  scale: FleetScale;
  teamId: string;
  onTeamChange: (teamId: string) => void;
  onBack: () => void;
}

/**
 * Variant 2, "Night Shift": one team's building opened up. The roof stays on
 * top and every floor becomes rooms, a persona at each desk acting out its
 * state; open a room and the agent's own scene grows out of it. Escape steps
 * back one level: agent to office, office to the city.
 */
export default function OfficeScene({ scale, teamId, onTeamChange, onBack }: OfficeSceneProps) {
  const { t } = useTranslation();
  const city = t.fleetPlayground.city;
  const copy = t.fleetPlayground.office;
  const still = useStillMotion();
  const sim = useNightSim(scale);

  // The window clicked in the city opens straight into its room.
  const [agentId, setAgentId] = useState<string | null>(() => peekPendingAgent());
  useEffect(() => clearPendingAgent(), []);
  const [origin, setOrigin] = useState({ x: "60%", y: "50%" });
  const [attend, setAttend] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<string | null>(null);

  // Only teams with agents at this scale have a building; fall back to the first.
  const present = useMemo(() => FLEET.teams.filter((tm) => sim.scoped.some((a) => a.team === tm.id)), [sim.scoped]);
  const team = present.find((tm) => tm.id === teamId) ?? present[0];
  const members = sim.scoped.filter((a) => a.team === team.id);
  const agent = agentId ? sim.scoped.find((a) => a.id === agentId) ?? null : null;
  const agentTeam = agent ? FLEET.teams.find((tm) => tm.id === agent.team) ?? team : team;

  const openAgent = (id: string, el?: HTMLElement) => {
    const a = sim.byId.get(id);
    const root = rootRef.current;
    if (!a) return;
    if (a.team !== team.id) onTeamChange(a.team);
    if (el && root) {
      const r = el.getBoundingClientRect();
      const R = root.getBoundingClientRect();
      setOrigin({ x: `${r.left + r.width / 2 - R.left}px`, y: `${r.top + r.height / 2 - R.top}px` });
    }
    returnTo.current = id;
    setAttend(null);
    setAgentId(id);
  };
  const closeAgent = () => setAgentId(null);

  // Hand focus back to the room the agent was opened from.
  useEffect(() => {
    if (agent || !returnTo.current) return;
    document.getElementById(`ns-room-${returnTo.current}`)?.focus({ preventScroll: true });
    returnTo.current = null;
  }, [agent]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.ctrlKey || e.metaKey || e.altKey || tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        e.preventDefault();
        if (agentId) setAgentId(null);
        else onBack();
      } else if (e.key === "n" || e.key === "N") {
        const queue = ranked(sim.scoped);
        if (!queue.length) return;
        e.preventDefault();
        const next = queue[(queue.findIndex((a) => a.id === agentId) + 1) % queue.length];
        if (next.team !== team.id) onTeamChange(next.team);
        setAgentId(next.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [agentId, sim.scoped, team.id, onBack, onTeamChange]);

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={copy.label}
      className={`${s.theme} ${still ? s.still : ""} h-full w-full overflow-hidden`}
      style={{ ["--team" as string]: `hsl(${team.hue} 50% 50%)` }}
    >
      <div className={o.bg} />
      {/* Normal flow, top to bottom: navigation, the team switcher (one row,
          scrolls sideways when the teams outgrow it), then the floors. */}
      <div inert={!!agent} className={`absolute inset-0 flex flex-col gap-3 px-6 pb-3 pt-3 ${still ? "" : o.enter}`}>
        <header className="flex flex-none items-center gap-3 text-base">
          <button type="button" onClick={onBack} className="flex-none rounded-lg border border-brand-cyan/50 px-3 py-1 text-foreground transition-colors hover:bg-brand-cyan/10 focus-visible:outline-2 focus-visible:outline-brand-cyan" style={{ background: "var(--ns-panel)" }}>
            ← {copy.back}
          </button>
          <nav aria-label={copy.breadcrumb} className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={onBack} className="text-muted-dark hover:text-foreground hover:underline">{copy.city}</button>
            <span className="text-muted-dark">›</span>
            <span aria-current="page" className="truncate font-semibold text-foreground">{team.name}</span>
          </nav>
          <span className="ml-auto flex-none text-[13px] text-muted-dark">{copy.escHint}</span>
        </header>
        <div role="group" aria-label={copy.teamsLabel} className={`${o.switcher} flex flex-none gap-1.5 overflow-x-auto pb-1`}>
          {present.map((tm) => {
            const ny = ranked(sim.scoped.filter((a) => a.team === tm.id)).length;
            return (
              <button
                key={tm.id}
                type="button"
                aria-pressed={tm.id === team.id}
                onClick={() => { setAgentId(null); onTeamChange(tm.id); }}
                className={`flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${tm.id === team.id ? "border-glass-strong text-foreground" : "border-glass text-muted-dark hover:text-foreground"}`}
                style={tm.id === team.id ? { background: `color-mix(in oklab, ${hueText(tm.hue)} 16%, transparent)` } : undefined}
              >
                <i className="h-2 w-2 rounded-full" style={{ background: hueText(tm.hue) }} />
                {tm.name}
                {ny > 0 && <span className="font-semibold" style={{ color: textTone("var(--status-warning)") }}>{ny}</span>}
              </button>
            );
          })}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(260px,28%)_1fr] gap-6">
          <OfficeInfo
            team={team}
            members={members}
            events={sim.scopedEvents}
            byId={sim.byId}
            focus={attend ? members.find((a) => a.id === attend) ?? null : null}
            simMs={sim.simMs}
            city={city}
            copy={copy}
            onOpen={(id) => openAgent(id, document.getElementById(`ns-room-${id}`) ?? undefined)}
          />
          <Cutaway key={`${team.id}-${scale}`} team={team} members={members} city={city} copy={copy} still={still} onOpen={openAgent} onAttend={setAttend} />
        </div>
      </div>

      {agent && (
        <AgentRoom
          key={agent.id}
          a={agent}
          team={agentTeam}
          events={sim.scopedEvents}
          byId={sim.byId}
          simMs={sim.simMs}
          origin={origin}
          city={city}
          copy={copy}
          still={still}
          onBack={closeAgent}
          onCity={onBack}
        />
      )}
    </div>
  );
}
