"use client";

import { AGENT, CUSTOMER, FG, SCRIPT, mix } from "../shared/scenarios";
import { AGENT_PATH, AGENT_PTS, BEADS_X, AGENT_Y, BUMPER_X, DRAIN_PATH, FEED_PATH, ORIGIN, QUEUE, RESOLVED, ROWS, STATIONS, SWITCH, W, H, trackPath, type Pt } from "./geometry";

const poly = (pts: Pt[]) => pts.map((p) => p.join(",")).join(" ");

/** The drawn map. Rails are rose: dim for the tracks not taken, brighter for
 *  the one the keyword switch picked, and bright where the train has already
 *  run. The agent's route is emerald and draws itself as the agent moves. */
export default function TrackMap({
  row,
  route,
  routeTotal,
  trainD,
  train,
  agentD,
  agentTotal,
  agent,
  passed,
  beadsLit,
  queued,
  resolved,
  label,
}: {
  row: number;
  route: Pt[];
  routeTotal: number;
  trainD: number;
  train: Pt;
  agentD: number;
  agentTotal: number;
  agent: Pt;
  passed: number;
  beadsLit: number;
  queued: boolean;
  resolved: boolean;
  label: string;
}) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={label} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Rails: every track the script knows. */}
      {ROWS.map((y, r) => (
        <g key={r}>
          <path d={trackPath(r)} stroke={SCRIPT} strokeOpacity={r === row ? 0.45 : 0.16} strokeWidth={r === row ? 5 : 4} />
          {STATIONS.map((x, k) => (
            <circle key={k} cx={x} cy={y} r={r === row ? 8 : 6} fill="var(--background)" stroke={SCRIPT} strokeOpacity={r === row ? (k < passed ? 1 : 0.6) : 0.22} strokeWidth={3} />
          ))}
          {/* Bumper: the end of this rule. */}
          <path d={`M ${BUMPER_X} ${y - 13} L ${BUMPER_X} ${y + 13}`} stroke={SCRIPT} strokeOpacity={r === row ? 0.9 : 0.3} strokeWidth={6} />
        </g>
      ))}
      <path d={DRAIN_PATH} stroke={SCRIPT} strokeOpacity={0.28} strokeWidth={4} strokeDasharray="2 10" />
      <path d={FEED_PATH} stroke={FG} strokeOpacity={0.35} strokeWidth={5} />

      {/* Where the train has been. */}
      <polyline points={poly(route)} stroke={SCRIPT} strokeWidth={5} strokeDasharray={`${routeTotal} ${routeTotal}`} strokeDashoffset={routeTotal - trainD} />

      {/* The keyword switch. */}
      <rect x={SWITCH[0] - 12} y={SWITCH[1] - 12} width={24} height={24} rx={4} transform={`rotate(45 ${SWITCH[0]} ${SWITCH[1]})`} fill="var(--background)" stroke={FG} strokeOpacity={0.7} strokeWidth={3} />

      {/* The human queue terminal. */}
      <path d={`M ${QUEUE[0]} ${QUEUE[1] - 18} L ${QUEUE[0]} ${QUEUE[1] + 18}`} stroke={SCRIPT} strokeWidth={8} strokeOpacity={queued ? 1 : 0.4} />

      {/* The agent's route: faint whole, bright where it has gone. */}
      <path d={AGENT_PATH} stroke={AGENT} strokeOpacity={0.14} strokeWidth={4} strokeDasharray="1 12" />
      <polyline points={poly(AGENT_PTS)} stroke={mix(AGENT, 30)} strokeWidth={16} strokeDasharray={`${agentTotal} ${agentTotal}`} strokeDashoffset={agentTotal - agentD} />
      <polyline points={poly(AGENT_PTS)} stroke={AGENT} strokeWidth={5} strokeDasharray={`${agentTotal} ${agentTotal}`} strokeDashoffset={agentTotal - agentD} />
      {BEADS_X.map((x, k) => (
        <circle key={k} cx={x} cy={AGENT_Y} r={k < beadsLit ? 9 : 6} fill={k < beadsLit ? AGENT : "var(--background)"} stroke={AGENT} strokeOpacity={k < beadsLit ? 1 : 0.35} strokeWidth={3} />
      ))}
      <circle cx={RESOLVED[0]} cy={RESOLVED[1]} r={resolved ? 16 : 12} fill={resolved ? AGENT : "var(--background)"} stroke={AGENT} strokeOpacity={resolved ? 1 : 0.4} strokeWidth={3} />
      {resolved && <path d={`M ${RESOLVED[0] - 7} ${RESOLVED[1]} l 5 5 l 9 -10`} stroke="var(--background)" strokeWidth={3.5} />}

      {/* Origin: where the customer's message enters. */}
      <circle cx={ORIGIN[0]} cy={ORIGIN[1]} r={11} fill={CUSTOMER} />
      <circle cx={ORIGIN[0]} cy={ORIGIN[1]} r={20} fill={mix(CUSTOMER, 18)} />

      {/* The two travellers. */}
      <circle cx={train[0]} cy={train[1]} r={22} fill={mix(SCRIPT, 22)} />
      <rect x={train[0] - 13} y={train[1] - 8} width={26} height={16} rx={5} fill={SCRIPT} />
      <circle cx={agent[0]} cy={agent[1]} r={24} fill={mix(AGENT, 24)} />
      <circle cx={agent[0]} cy={agent[1]} r={10} fill={AGENT} />
    </svg>
  );
}
