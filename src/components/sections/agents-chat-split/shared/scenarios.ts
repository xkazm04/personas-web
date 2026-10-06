import { BRAND_VAR } from "@/lib/brand-theme";

/* Structure behind the How lab chat variants. The words live in
 * `t.howSections.chat` (en.ts), indexed the same way as `SCENARIOS`; this module
 * holds what is not copy: when each line lands on the shared clock (seconds
 * after the customer hits send, carried over from the live section's
 * transcripts), its tone, the customer rating, how the scripted bot and the
 * agent read each part of the message (v2), and which track the scripted bot
 * is switched onto (v3). */

export type Tone = "neutral" | "thinking" | "warning" | "error" | "success";
export interface Line {
  at: number;
  tone: Tone;
}

/** How the agent reads one part of the message (v2). */
export type Role = "drop" | "fix" | "ask" | "info" | "plain";
export interface Segment {
  role: Role;
  /** Index into the scenario's `tags` copy. */
  tag?: number;
}

export interface Scenario {
  scripted: Line[];
  agent: Line[];
  stars: { scripted: number; agent: number };
  segments: Segment[];
  /** The scripted track it is switched onto (v3). */
  track: number;
}

const L = (at: number, tone: Tone): Line => ({ at, tone });

export const SCENARIOS: Scenario[] = [
  {
    scripted: [L(1, "neutral"), L(3, "neutral"), L(5, "warning"), L(8, "error"), L(10, "error")],
    agent: [L(1, "thinking"), L(2, "neutral"), L(4, "success")],
    stars: { scripted: 2, agent: 5 },
    segments: [
      { role: "drop", tag: 0 },
      { role: "drop" },
      { role: "drop" },
      { role: "fix", tag: 1 },
      { role: "ask", tag: 2 },
      { role: "info", tag: 3 },
    ],
    track: 0,
  },
  {
    scripted: [L(1, "neutral"), L(3, "neutral"), L(6, "error"), L(9, "error"), L(12, "error")],
    agent: [L(1, "thinking"), L(3, "neutral"), L(4, "neutral"), L(6, "success")],
    stars: { scripted: 2, agent: 5 },
    segments: [
      { role: "ask", tag: 0 },
      { role: "info" },
      { role: "plain" },
      { role: "info", tag: 1 },
      { role: "plain" },
      { role: "info", tag: 2 },
    ],
    track: 1,
  },
  {
    scripted: [L(2, "neutral"), L(5, "neutral"), L(8, "warning"), L(14, "error"), L(18, "error")],
    agent: [L(2, "thinking"), L(5, "neutral"), L(8, "neutral"), L(12, "success")],
    stars: { scripted: 1, agent: 5 },
    segments: [
      { role: "ask", tag: 0 },
      { role: "info", tag: 1 },
      { role: "info", tag: 2 },
      { role: "info", tag: 3 },
    ],
    track: 2,
  },
  {
    scripted: [L(2, "neutral"), L(5, "error"), L(12, "error"), L(15, "error"), L(18, "error")],
    agent: [L(2, "thinking"), L(5, "neutral"), L(11, "neutral"), L(16, "success")],
    stars: { scripted: 1, agent: 5 },
    segments: [
      { role: "info", tag: 0 },
      { role: "info", tag: 1 },
      { role: "info", tag: 2 },
      { role: "plain" },
      { role: "ask", tag: 3 },
    ],
    track: 3,
  },
];

export const endOf = (lines: Line[]) => lines.at(-1)?.at ?? 0;
/** The slower lane's last line: when both outcomes are known. */
export const storyEnd = (s: Scenario) => Math.max(endOf(s.scripted), endOf(s.agent));

/** "0:07" from story seconds. */
export function clockText(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export const fill = (template: string, n: number | string) => template.replace("{n}", String(n));

/* Palette: rose for the script, emerald for the agent, every tint through
 * color-mix so all eleven themes keep their own values. */
export const SCRIPT = BRAND_VAR.rose;
export const AGENT = BRAND_VAR.emerald;
export const CUSTOMER = BRAND_VAR.cyan;
export const WARN = BRAND_VAR.amber;
export const FG = "var(--foreground)";
export const mix = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

export const TONE_COLOR: Record<Tone, string> = {
  neutral: FG,
  thinking: AGENT,
  warning: WARN,
  error: SCRIPT,
  success: AGENT,
};
