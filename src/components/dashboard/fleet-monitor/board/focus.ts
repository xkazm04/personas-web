import { attentionOf, type Attention } from "../attention";
import { stateText, taskText, type BoardCopy } from "./copy";
import { TEAM_BY_ID, orderInBay, type SimAgent } from "./model";

/* ── Find and focus ─────────────────────────────────────────────────
 *
 * At 99 agents the operator looks for one ("the invoice one"), or for a kind
 * ("everything in finance that failed"). The board answers by dimming what
 * does not match instead of removing it: tiles keep their places, so the
 * spatial memory of the field survives the search.
 */

export interface FocusFilter {
  /** Free text: every word must appear in the agent's callsign, name, team, task or state. */
  query: string;
  /** Piles to show; empty shows all. */
  piles: readonly Attention[];
}

export const NO_FOCUS: FocusFilter = { query: "", piles: [] };

export const isFocusing = (f: FocusFilter) => f.query.trim() !== "" || f.piles.length > 0;

/** The words a search runs against, lower-cased once per agent. */
export function haystack(a: SimAgent, c: BoardCopy): string {
  return `${a.callsign} ${a.name} ${TEAM_BY_ID[a.team]?.name ?? ""} ${taskText(a, c, "")} ${stateText(a, c)}`.toLowerCase();
}

export function matchesQuery(a: SimAgent, query: string, c: BoardCopy): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = haystack(a, c);
  return words.every((w) => hay.includes(w));
}

export function inFocus(a: SimAgent, f: FocusFilter, c: BoardCopy): boolean {
  return (f.piles.length === 0 || f.piles.includes(attentionOf(a))) && matchesQuery(a, f.query, c);
}

/** Toggle one pile in the filter. */
export function togglePile(f: FocusFilter, p: Attention): FocusFilter {
  return { ...f, piles: f.piles.includes(p) ? f.piles.filter((x) => x !== p) : [...f.piles, p] };
}

/** What a focus filter shows: the matching agents in the field's reading order
 *  (Enter opens the first), their ids for dimming (null when not focusing),
 *  and the rail's scope (narrowed by the search only, never by piles). */
export function focusView(scope: readonly SimAgent[], teamIds: readonly string[], f: FocusFilter, c: BoardCopy) {
  const reading = teamIds.flatMap((t) => orderInBay(scope.filter((a) => a.team === t)));
  const focusing = isFocusing(f);
  const matches = focusing ? reading.filter((a) => inFocus(a, f, c)) : reading;
  return {
    matches,
    matchIds: focusing ? new Set(matches.map((a) => a.id)) : null,
    railScope: f.query.trim() ? scope.filter((a) => matchesQuery(a, f.query, c)) : [...scope],
    narrowed: f.query.trim() !== "",
  };
}
