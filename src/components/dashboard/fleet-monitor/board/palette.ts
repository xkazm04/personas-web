import { attentionOf, needsTone, type Attention, type AttentionTone } from "../attention";
import type { FleetScale, FleetTeam } from "../fleet-data";
import { countAttention } from "../attention";
import { shortState, type BoardCopy } from "./copy";
import { TEAM_BY_ID, fill, queueOf, type SimAgent } from "./model";
import { admit } from "./verbs";

/* ── The command palette's items, and how a query ranks them ──────── */

export type PaletteGroup = "actions" | "agents" | "teams" | "views";
export const GROUP_ORDER: readonly PaletteGroup[] = ["actions", "agents", "teams", "views"];

export interface PaletteItem {
  id: string;
  group: PaletteGroup;
  label: string;
  /** A second line: team and state for an agent, counts for a team. */
  meta?: string;
  /** The key that does the same outside the palette. */
  kbd?: string;
  tone?: Attention | AttentionTone;
  /** Extra words it answers to. */
  keywords?: string;
  disabled?: boolean;
  run: () => void;
}

/** Score an item for a query: every word must match; a word at the start of
 *  the label counts most, then at the start of any word, then anywhere. */
export function scoreItem(item: PaletteItem, query: string): number {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return 1;
  const label = item.label.toLowerCase();
  const hay = `${label} ${(item.meta ?? "").toLowerCase()} ${(item.keywords ?? "").toLowerCase()}`;
  let score = 0;
  for (const w of words) {
    const at = hay.indexOf(w);
    if (at < 0) return 0;
    score += label.startsWith(w) ? 4 : new RegExp(`(^|[\\s·(])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(hay) ? 2 : 1;
  }
  return score;
}

/** Items that match, best first, at most `perGroup` per group, in group order. */
export function rankItems(items: readonly PaletteItem[], query: string, perGroup = 7): PaletteItem[] {
  const scored = items.map((it, i) => ({ it, i, s: scoreItem(it, query) })).filter((x) => x.s > 0);
  scored.sort((a, b) => b.s - a.s || a.i - b.i);
  return GROUP_ORDER.flatMap((g) => scored.filter((x) => x.it.group === g).slice(0, perGroup).map((x) => x.it));
}

export type AgentVerb = "open" | "pause" | "resume" | "run" | "cancel";

/** A query that starts with a verb ("pause ir01") acts on the agents it names. */
export function parseVerb(query: string, verbs: Record<Exclude<AgentVerb, "open">, string>): { verb: AgentVerb; rest: string } {
  const [first = "", ...rest] = query.trim().split(/\s+/);
  const f = first.toLowerCase();
  for (const [verb, label] of Object.entries(verbs) as [Exclude<AgentVerb, "open">, string][]) {
    if (f.length >= 3 && label.toLowerCase().split(/\s+/)[0].startsWith(f)) return { verb, rest: rest.join(" ") };
  }
  return { verb: "open", rest: query };
}

export interface PaletteDeps {
  scope: readonly SimAgent[];
  teams: readonly FleetTeam[];
  copy: BoardCopy;
  hostName: string;
  offline: boolean;
  fleetPaused: number;
  scale: FleetScale;
  verb: AgentVerb;
  /** Whether an agent has an open run command (the palette then does not offer it a verb). */
  pending?: (agentId: string) => boolean;
  openAgent: (id: string) => void;
  openTeam: (id: string) => void;
  agentVerb: (verb: Exclude<AgentVerb, "open">, a: SimAgent) => void;
  nextNeeds: () => void;
  startTriage: () => void;
  pauseAll: () => void;
  resumeAll: () => void;
  showPile: (p: Attention) => void;
  clearFocus: () => void;
  toggleActivity: () => void;
  onView?: (v: "board" | "city") => void;
  onScale?: (n: FleetScale) => void;
}

/** Every item the palette can offer right now. */
export function buildItems(d: PaletteDeps): PaletteItem[] {
  const c = d.copy;
  const p = c.palette;
  const items: PaletteItem[] = [
    { id: "a:triage", group: "actions", label: p.actions.triage, kbd: "T", run: d.startTriage },
    { id: "a:next", group: "actions", label: p.actions.next, kbd: "N", run: d.nextNeeds },
    d.fleetPaused
      ? { id: "a:resumeAll", group: "actions", label: fill(p.actions.resumeAll, { n: d.fleetPaused }), disabled: d.offline, run: d.resumeAll }
      : { id: "a:pauseAll", group: "actions", label: fill(p.actions.pauseAll, { host: d.hostName }), disabled: d.offline, run: d.pauseAll },
    { id: "a:needs", group: "actions", label: p.actions.showNeeds, run: () => d.showPile("needs") },
    { id: "a:working", group: "actions", label: p.actions.showWorking, run: () => d.showPile("working") },
    { id: "a:off", group: "actions", label: p.actions.showOff, run: () => d.showPile("off") },
    { id: "a:clear", group: "actions", label: p.actions.clear, run: d.clearFocus },
    { id: "a:activity", group: "actions", label: p.actions.activity, kbd: "E", run: d.toggleActivity },
  ];
  const queue = new Map(queueOf([...d.scope]).map((a, i) => [a.id, i]));
  const agents = [...d.scope].sort((x, y) => (queue.get(x.id) ?? 999) - (queue.get(y.id) ?? 999) || x.idx - y.idx);
  for (const a of agents) {
    const pile = attentionOf(a);
    const verb = d.verb;
    if (verb !== "open" && admit(verb, a, { offline: d.offline, pending: d.pending?.(a.id) })) continue;
    items.push({
      id: `g:${verb}:${a.id}`,
      group: "agents",
      label: verb === "open" ? `${a.callsign} ${a.name}` : fill(p.agentVerb, { verb: c.cmd[verb], callsign: a.callsign, name: a.name }),
      meta: `${TEAM_BY_ID[a.team].name} · ${shortState(a, c)}`,
      keywords: `${a.callsign} ${a.name} ${a.task ?? ""}`,
      tone: pile === "needs" ? needsTone(a) : pile,
      run: () => (verb === "open" ? d.openAgent(a.id) : d.agentVerb(verb, a)),
    });
  }
  if (d.verb === "open") {
    for (const t of d.teams) {
      const n = countAttention(d.scope.filter((a) => a.team === t.id));
      items.push({ id: `t:${t.id}`, group: "teams", label: t.name, meta: fill(p.teamMeta, { n: n.total, need: n.needs }), run: () => d.openTeam(t.id) });
    }
    if (d.onView) {
      const onView = d.onView;
      items.push({ id: "v:city", group: "views", label: p.actions.city, run: () => onView("city") });
    }
    if (d.onScale) {
      const onScale = d.onScale;
      for (const n of [10, 30, 99] as const) if (n !== d.scale) items.push({ id: `v:scale${n}`, group: "views", label: fill(p.actions.scale, { n }), run: () => onScale(n) });
    }
  }
  return items;
}
