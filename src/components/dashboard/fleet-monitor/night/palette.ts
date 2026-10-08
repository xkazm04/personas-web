import type { AgentState, FleetAgent, Severity } from "../fleet-data";

/* ── Night Shift palette ────────────────────────────────────────────
 *
 * Every colour is a site token (or a data hue mixed against one), so the city
 * follows all 11 themes: a night city in the dark presets, a dusk city in the
 * light ones. Values are CSS strings for `style` props — SVG presentation
 * attributes do not take `var()` reliably, `style` does.
 */

export type WindowState = AgentState | "off";

export const STATE_COLOR: Record<WindowState, string> = {
  running: "var(--brand-cyan)",
  failed: "var(--status-error)",
  input_required: "color-mix(in oklab, var(--brand-amber) 62%, var(--brand-rose))",
  draft_ready: "var(--brand-purple)",
  queued: "color-mix(in oklab, var(--brand-amber) 55%, var(--text-secondary))",
  attention: "var(--status-warning)",
  idle: "var(--text-disabled)",
  off: "color-mix(in oklab, var(--text-disabled) 70%, var(--background))",
};

export const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "var(--status-error)",
  warning: "var(--status-warning)",
  info: "var(--status-info)",
};

export const KIND_COLOR: Record<string, string> = {
  run_completed: "var(--brand-cyan)",
  run_failed: "var(--status-error)",
  review_requested: "var(--status-warning)",
  message: "color-mix(in oklab, var(--brand-cyan) 70%, var(--foreground))",
  handoff: "var(--brand-amber)",
  self_heal: "var(--brand-emerald)",
};

export function windowState(a: Pick<FleetAgent, "enabled" | "state">): WindowState {
  return a.enabled ? a.state : "off";
}

export const stateColor = (a: Pick<FleetAgent, "enabled" | "state">) => STATE_COLOR[windowState(a)];

/** Mix `color` into the page background: 0 = background, 100 = the colour. */
export const onBg = (color: string, pct: number) =>
  `color-mix(in oklab, ${color} ${pct}%, var(--background))`;

/** A team hue, mixed against the background so it sits in both light and dark. */
export const hue = (h: number, pct: number, l = 50, s = 48) => onBg(`hsl(${h} ${s}% ${l}%)`, pct);

/** A state or severity colour used as TEXT: full strength on the night sky,
 *  pulled toward the foreground on the pale dusk sky of the light themes so it
 *  keeps AA contrast (`--ns-text-mix` is set per theme in night.module.css). */
export const textTone = (color: string) => `color-mix(in oklab, ${color} var(--ns-text-mix), var(--foreground))`;

/** Readable text in a team hue: leans on the foreground token. */
export const hueText = (h: number) => `color-mix(in oklab, hsl(${h} 72% 62%) 58%, var(--foreground))`;

/** Building parts per team hue (body, rim, roof, lamp, highlight). */
export function teamTones(h: number) {
  return {
    body: hue(h, 16, 42, 40),
    rim: hue(h, 48, 48, 50),
    roof: hue(h, 30, 40, 42),
    lamp: hue(h, 78, 58, 62),
    glow: hue(h, 88, 72, 70),
    sign: hue(h, 9, 40, 35),
  };
}

/** Deterministic PRNG: the city is drawn and simulated from a seed, never Math.random. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const f1 = (n: number) => Math.round(n * 10) / 10;
