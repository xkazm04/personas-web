import { FLEET, type FleetAgent } from "../fleet-data";
import { arcPath, type CityLayout } from "./city-layout";

/** Who talks to whom, merged per pair of rooftops so 99 agents read as a few
 *  quiet lines; heavier traffic draws a brighter wire. */
export function RoofWires({ layout, byId }: { layout: CityLayout; byId: Map<string, FleetAgent> }) {
  const pairs = new Map<string, number>();
  for (const e of FLEET.channelEdges) {
    if (!layout.win.has(e.a) || !layout.win.has(e.b)) continue;
    const ta = byId.get(e.a)?.team;
    const tb = byId.get(e.b)?.team;
    if (!ta || !tb || ta === tb) continue;
    const k = ta < tb ? `${ta}|${tb}` : `${tb}|${ta}`;
    pairs.set(k, (pairs.get(k) ?? 0) + e.messages);
  }
  const roof = new Map(layout.teams.map((b) => [b.t.id, b]));
  return (
    <g pointerEvents="none" style={{ stroke: "var(--ns-wire)" }} fill="none">
      {[...pairs].map(([k, n]) => {
        const [p, q] = k.split("|");
        const A = roof.get(p);
        const B = roof.get(q);
        if (!A || !B) return null;
        const ay = A.anchor + 6;
        const by = B.anchor + 6;
        const sag = 16 + Math.abs(B.cx - A.cx) * 0.05;
        return <path key={k} d={`M ${A.cx} ${ay} Q ${(A.cx + B.cx) / 2} ${Math.max(ay, by) + sag} ${B.cx} ${by}`} strokeWidth={1} opacity={0.06 + Math.min(n, 5) * 0.025} />;
      })}
      {layout.teams.map((b) => (
        <circle key={b.t.id} cx={b.cx} cy={b.anchor + 6} r={2.5} style={{ fill: "var(--ns-wire)", stroke: "none" }} opacity={0.4} />
      ))}
    </g>
  );
}

/** The wires of the agent under attention, lit window to window. */
export function AgentWires({ layout, agentId }: { layout: CityLayout; agentId: string | null }) {
  if (!agentId || !layout.win.has(agentId)) return null;
  const paths: { k: string; d: string }[] = [];
  for (const e of FLEET.channelEdges) {
    const other = e.a === agentId ? e.b : e.b === agentId ? e.a : null;
    if (!other) continue;
    const d = arcPath(layout, agentId, other);
    if (d) paths.push({ k: other, d });
  }
  return (
    <g pointerEvents="none" fill="none" style={{ stroke: "var(--ns-wire)" }}>
      {paths.map((p) => (
        <path key={p.k} d={p.d} strokeWidth={1.6} opacity={0.6} strokeDasharray="2 5" />
      ))}
    </g>
  );
}
