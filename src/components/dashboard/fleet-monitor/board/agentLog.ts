import { FLEET } from "../fleet-data";
import { hash, mulberry32, type SimAgent } from "./model";

/* ── An agent's run, as a console would show it ─────────────────────
 *
 * The demo fleet carries counts (tool calls, runs today, the last 12 results)
 * but no transcript, so the agent console draws a stylised one from them, the
 * way the run trace is drawn: deterministic per agent and run, labelled as an
 * illustration on screen. Tool names are demo data per team, like the task
 * lines in fleet.json; the words around them come from copy.
 */

export const STEP_KEYS = ["plan", "gather", "tools", "check", "write", "handoff"] as const;
export type StepKey = (typeof STEP_KEYS)[number];

const TEAM_TOOLS: Record<string, string[]> = {
  finance: ["ledger.query", "bank.statements", "erp.invoice", "sheets.write", "fx.rates"],
  support: ["helpdesk.search", "kb.lookup", "mail.draft", "crm.contact", "status.page"],
  growth: ["cms.draft", "analytics.query", "seo.audit", "social.schedule", "ab.results"],
  eng: ["github.diff", "ci.logs", "tests.run", "issues.search", "release.notes"],
  sales: ["crm.lookup", "mail.sequence", "calendar.slots", "pricing.quote", "notes.sync"],
  legal: ["docs.search", "playbook.compare", "redline.write", "registry.check", "policy.lookup"],
  data: ["warehouse.query", "notebook.run", "csv.profile", "dedupe.scan", "chart.render"],
  people: ["hris.lookup", "calendar.check", "policy.search", "survey.results", "mail.draft"],
  infra: ["metrics.query", "dns.lookup", "pager.status", "cluster.describe", "logs.tail"],
};

const DETAILS = ["200 OK", "{n} rows", "{n} matched", "{n} items", "no change", "{n} files", "cached", "{n} records"];

export interface LogLine {
  key: string;
  /** Epoch ms on the demo clock. */
  tsMs: number;
  step: StepKey;
  tool: string;
  detail: string;
  latencyMs: number;
  /** The line that ends the visible run: failed, or paused for an answer. */
  end?: "failed" | "paused";
}

/** The step a run is on, from its progress (failed and paused runs stop where they stopped). */
export function currentStep(a: SimAgent): number {
  if (a.state === "running") return Math.min(STEP_KEYS.length - 1, Math.floor((a.progress ?? 0) * STEP_KEYS.length));
  if (a.state === "failed") return 2;
  if (a.state === "input_required") return 3;
  if (a.state === "draft_ready") return 4;
  return -1;
}

/**
 * The newest `max` tool calls of the current run, oldest first. A line per tool
 * call the fleet counted, spread over the run's age; a failed or paused run
 * ends on its stop line. Resting agents have no run to show (empty).
 */
export function runLog(a: SimAgent, simMs: number, max = 40): LogLine[] {
  const step = currentStep(a);
  if (step < 0) return [];
  const tools = TEAM_TOOLS[a.team] ?? TEAM_TOOLS.data;
  const runSeed = hash(`${a.id}:${a.startSim ?? "x"}:${a.runsToday}`);
  const running = a.state === "running";
  const total = running ? a.liveToolCalls : (hash(a.id) % 18) + 8;
  // A stopped run sat still from a fixed moment before the demo's "now".
  const stoppedAt = FLEET.nowMs - ((hash(a.id) % 40) + 3) * 60_000;
  let timeOf = running ? callTime(a) : null;
  if (!timeOf) {
    // Walk back from the stop, one seeded gap per call, so times only rise.
    const at: number[] = new Array(total);
    let t = stoppedAt;
    for (let i = total - 1; i >= 0; i--) {
      t -= 20_000 + (hash(`${a.id}${i}`) % 40_000);
      at[i] = t;
    }
    timeOf = (i: number) => at[i];
  }
  const lines: LogLine[] = [];
  for (let i = Math.max(0, total - max); i < total; i++) {
    const r = mulberry32(runSeed + i * 7919);
    const frac = total <= 1 ? 1 : i / (total - 1);
    lines.push({
      key: `${runSeed}-${i}`,
      tsMs: Math.round(timeOf(i)),
      step: STEP_KEYS[Math.min(step, Math.floor(frac * (step + 1)))],
      tool: tools[Math.floor(r() * tools.length)],
      detail: DETAILS[Math.floor(r() * DETAILS.length)].replace("{n}", String(2 + Math.floor(r() * 400))),
      latencyMs: Math.round(40 + r() * r() * 1800),
    });
  }
  if (!running) {
    const last = lines[lines.length - 1];
    lines.push({ key: `${runSeed}-end`, tsMs: stoppedAt, step: STEP_KEYS[step], tool: last?.tool ?? tools[0], detail: "", latencyMs: a.state === "failed" ? 30_000 : 0, end: a.state === "failed" ? "failed" : "paused" });
  }
  return lines;
}

/** When call `i` (0-based) of a running agent's run landed: inside the tick that
 *  added it, or, for calls made before the page started watching, spread evenly
 *  from the run's start to the first watched tick. Stable as new calls arrive. */
function callTime(a: SimAgent): (i: number) => number {
  const start = FLEET.nowMs + (a.startSim ?? 0);
  const ticks = a.callTicks;
  const first = ticks[0];
  const base = first ? first.from : a.liveToolCalls;
  // The calls made before the first watched tick end where that tick's own span begins.
  const firstAt = Math.max(start, FLEET.nowMs + (first ? first.at - 1000 : 0));
  return (i) => {
    if (i < base) return start + ((i + 1) / Math.max(1, base)) * (firstAt - start);
    for (let k = 0; k < ticks.length; k++) {
      const t = ticks[k];
      if (i < t.to) {
        const prevAt = k ? FLEET.nowMs + ticks[k - 1].at : firstAt;
        return prevAt + ((i - t.from + 1) / (t.to - t.from)) * (FLEET.nowMs + t.at - prevAt);
      }
    }
    return FLEET.nowMs + (ticks[ticks.length - 1]?.at ?? 0);
  };
}

const TEAM_TRIGGERS: Record<string, string[]> = {
  finance: ["new statement in the bank feed", "invoice posted in the ERP", "month-end close opened"],
  support: ["new ticket in the help desk", "SLA timer under 1 h", "status page incident"],
  growth: ["draft marked ready in the CMS", "campaign window opens", "weekly analytics export"],
  eng: ["pull request opened", "CI run failed on main", "release tag pushed"],
  sales: ["new lead in the CRM", "meeting booked", "quote expires in 48 h"],
  legal: ["contract uploaded", "clause flagged by a reviewer", "registry change notice"],
  data: ["new export in the warehouse", "notebook scheduled", "duplicate rate above 2%"],
  people: ["leave request submitted", "new hire starts in 7 days", "survey closed"],
  infra: ["alert fired in monitoring", "certificate expires in 14 days", "deploy finished"],
};

const CADENCES = [15, 30, 60, 120, 240, null] as const;

export interface AgentPlan {
  /** Minutes between scheduled runs; null when it only runs on its trigger. */
  everyMin: number | null;
  /** Epoch ms of the next scheduled run (demo clock), or null. */
  nextMs: number | null;
  trigger: string;
}

/** What starts this agent: a schedule (or none) and its event trigger. Demo
 *  data drawn per agent, stable across renders; the next run is the next slot
 *  of its schedule on the demo clock. */
export function agentPlan(a: SimAgent, simMs: number): AgentPlan {
  const h = hash(`${a.id}:plan`);
  const everyMin = CADENCES[h % CADENCES.length];
  const triggers = TEAM_TRIGGERS[a.team] ?? TEAM_TRIGGERS.data;
  const now = FLEET.nowMs + simMs;
  const slot = everyMin ? everyMin * 60_000 : 0;
  return { everyMin, nextMs: slot ? Math.ceil((now + 1) / slot) * slot : null, trigger: triggers[(h >>> 4) % triggers.length] };
}

export interface RunRow {
  key: string;
  result: "completed" | "failed";
  /** Epoch ms on the demo clock. */
  endedMs: number;
  durationMs: number;
  costUsd: number;
}

/**
 * The last 12 runs (newest first) from the fleet's result beads, each with a
 * duration, an end time and a cost drawn per run: run k of today keeps its
 * numbers when a newer run pushes it down the list.
 */
export function runHistory(a: SimAgent, simMs: number): RunRow[] {
  const now = FLEET.nowMs + simMs;
  const midnight = Math.floor(now / 86_400_000) * 86_400_000;
  // Today's runs (the fleet's count) fit between midnight and now; older ones
  // fall before midnight, so "0 runs today" never shows a run from today.
  const todayN = Math.min(a.runsToday, a.recentStatuses.length);
  const firstEnd = a.state === "running" ? (a.startSim ?? 0) + FLEET.nowMs - 90_000 : now - 4 * 60_000;
  let end = todayN ? Math.min(firstEnd, now) : midnight - 25 * 60_000;
  const todayGap = todayN > 1 ? Math.max(4 * 60_000, (end - midnight) / todayN) : 0;
  return a.recentStatuses.map((result, i) => {
    const k = a.runsToday - i;
    const r = mulberry32(hash(`${a.id}#${k}`));
    const durationMs = Math.round((2 + r() * 11) * 60_000 + r() * 59_000);
    const row = { key: `${a.id}#${k}`, result, endedMs: Math.round(end), durationMs, costUsd: Math.round((0.02 + r() * 0.16) * 100) / 100 };
    const nextToday = i + 1 < todayN;
    end = nextToday ? end - todayGap * (0.6 + r() * 0.8) : Math.min(end, midnight) - durationMs - (20 + r() * 220) * 60_000;
    if (nextToday) end = Math.max(end, midnight + 60_000 * (todayN - i));
    return row;
  });
}
