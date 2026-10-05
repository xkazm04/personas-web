import { r2 } from "../shared/motion";

/* Geometry and patch data for V3 "Patch bay" (viewBox 1200 x 580): agents on the
 * left are cabled to engine modules on the right - Claude's rack on top, the
 * Ollama module (on this PC) below. Each module has three ports. */

export type Engine = "opus" | "sonnet" | "haiku" | "ollama";
export type AgentKey = "codeReview" | "inbox" | "brief" | "support" | "journal";
export type Patch = Record<AgentKey, Engine>;

export const W = 1200;
export const H = 580;
export const ENGINES: Engine[] = ["opus", "sonnet", "haiku", "ollama"];
export const NAMES: Record<Engine, string> = { opus: "Opus", sonnet: "Sonnet", haiku: "Haiku", ollama: "Ollama" };
export const AGENTS: AgentKey[] = ["codeReview", "inbox", "brief", "support", "journal"];
const PORTS = 3;

/** Agent rows: the button box and the jack at its right edge. */
export const LIST = { x: 40, w: 330, top: 112, gap: 84, h: 64 };
export const JACK_X = 404;
export const agentY = (i: number) => LIST.top + i * LIST.gap;

export const RACK = { x: 740, w: 420, claudeTop: 40, claudeH: 356, localTop: 422, localH: 142 };
export const PORT_X = 790;
export const MODULE_Y: Record<Engine, number> = { opus: 142, sonnet: 236, haiku: 330, ollama: 506 };
export const MODULE_H = 84;

/** Server render and the demo's first frame: three on Sonnet, two on Haiku. */
export const START: Patch = { codeReview: "sonnet", inbox: "sonnet", brief: "sonnet", support: "haiku", journal: "haiku" };
/** The resolved picture (and what reduced motion shows). */
export const FINAL: Patch = { codeReview: "opus", inbox: "haiku", brief: "sonnet", support: "haiku", journal: "ollama" };
/** The demo's re-patches, in order: the private one goes home first. */
export const STEPS: [AgentKey, Engine][] = [
  ["journal", "ollama"],
  ["codeReview", "opus"],
  ["inbox", "haiku"],
];

const count = (p: Patch, e: Engine) => AGENTS.filter((a) => p[a] === e).length;

/** The next engine with a free port, after the agent's current one. */
export function nextEngine(p: Patch, a: AgentKey): Engine {
  const from = ENGINES.indexOf(p[a]);
  for (let k = 1; k <= ENGINES.length; k++) {
    const e = ENGINES[(from + k) % ENGINES.length];
    if (count(p, e) < PORTS) return e;
  }
  return p[a];
}

/** Where agent a's cable plugs in: its engine's module, port by agent order. */
export function portOf(p: Patch, a: AgentKey): [number, number] {
  const e = p[a];
  const k = AGENTS.filter((b) => p[b] === e).indexOf(a);
  return [PORT_X, MODULE_Y[e] + (k - 1) * 24];
}

/** A hanging cable from (x1, y1) to (x2, y2); `sway` nudges its sag. */
export function cable(x1: number, y1: number, x2: number, y2: number, sway: number): string {
  const sag = 46 + Math.abs(y2 - y1) * 0.12 + sway;
  const lo = Math.max(y1, y2) + sag;
  return `M ${x1} ${y1} C ${r2(x1 + 150)} ${r2(lo)} ${r2(x2 - 170)} ${r2(lo)} ${r2(x2)} ${r2(y2)}`;
}
