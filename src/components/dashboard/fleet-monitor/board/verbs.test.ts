import { describe, expect, it, vi } from "vitest";
import { personasMonitorCopy } from "@/i18n/pending/personasMonitor";
import { FLEET, type AgentState } from "../fleet-data";
import { buildItems, type PaletteDeps } from "./palette";
import { eligible } from "./fleetTable";
import { makeOperator } from "./operator";
import { initSim, simReducer, type SimState } from "./sim";
import { closeCommand, settle, type Command, type Commands } from "./useCommands";
import { RULE_VERBS, admit, offeredVerbs } from "./verbs";

/* One verb rulebook: every surface that offers a verb, and the machine that
 * applies it, answer "may this verb act on this agent now?" the same way. */

const c = personasMonitorCopy.board;
const noop = () => {};
const STATES: readonly AgentState[] = ["running", "failed", "input_required", "draft_ready", "queued", "attention", "idle"];

/** initSim(99) with its first agent forced into a state. */
function withAgent(state: AgentState, enabled: boolean): SimState {
  const s = initSim(99);
  const a = s.agents[0];
  s.agents[0] = { ...a, state, enabled, progress: state === "running" ? 0.4 : null, startSim: state === "running" ? 0 : null };
  return s;
}

const paletteDeps = (over: Partial<PaletteDeps>): PaletteDeps => ({
  scope: [], teams: FLEET.teams, copy: c, hostName: "Studio PC", offline: false, fleetPaused: 0, scale: 99, verb: "open",
  openAgent: noop, openTeam: noop, agentVerb: noop, nextNeeds: noop, startTriage: noop, pauseAll: noop, resumeAll: noop, showPile: noop, clearFocus: noop, toggleActivity: noop,
  ...over,
});

describe("verbs: one admission rule", () => {
  it("retry on a paused failed agent is refused 'paused', and the machine leaves it failed and off", () => {
    const s = withAgent("failed", false);
    const a = s.agents[0];
    expect(admit("retry", a)).toBe("paused");
    const next = simReducer(s, { type: "retry", id: a.id });
    expect(next.agents[0].state).toBe("failed");
    expect(next.agents[0].enabled).toBe(false);
  });

  it("parity sweep: palette, bulk eligibility, controls, admit and the reducer agree for every verb x state x enabled", () => {
    const mismatches: string[] = [];
    for (const verb of RULE_VERBS) for (const state of STATES) for (const enabled of [true, false]) {
      const s = withAgent(state, enabled);
      const a = s.agents[0];
      const answers: Record<string, boolean> = {
        admit: admit(verb, a) === null,
        reducer: simReducer(s, { type: verb, id: a.id }) !== s,
        controls: offeredVerbs(a).includes(verb),
      };
      if (verb !== "retry") {
        answers.palette = buildItems(paletteDeps({ scope: [a], verb })).some((it) => it.id === `g:${verb}:${a.id}`);
        answers.eligible = eligible(verb, a);
      }
      if (new Set(Object.values(answers)).size > 1) mismatches.push(`${verb} ${state} enabled=${enabled} ${JSON.stringify(answers)}`);
    }
    expect(mismatches).toEqual([]);
  });

  it("a cancel that lands after the run finished settles as refused 'notRunning', never done", () => {
    const s = withAgent("idle", true);
    const spec = { verb: "cancel" as const, agentId: s.agents[0].id };
    expect(settle(spec, s)).toEqual({ action: null, refusal: "notRunning" });
    const cmd: Command = { ...spec, id: 1, status: "acked" };
    expect(closeCommand(cmd, "notRunning")).toMatchObject({ status: "refused", reason: "notRunning" });
    expect(closeCommand(cmd, null).status).toBe("done");
  });

  it("bulk skips an agent that already has an open command on it", () => {
    const s = initSim(99);
    const busy = { ...s.agents.find((a) => a.enabled && a.state === "idle")! };
    const free = s.agents.find((a) => a.enabled && a.state === "idle" && a.id !== busy.id)!;
    const send = vi.fn(() => 1);
    const commands = { cmds: [{ id: 9, verb: "pause", agentId: busy.id, status: "sending" }], send, undo: () => false } as unknown as Commands;
    const op = makeOperator({ commands, toast: noop, copy: c, hostName: "Studio PC", offline: false, simMs: 0 });
    expect(op.bulk("pause", [busy, free])).toBe(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(admit("pause", busy, { pending: true })).toBe("pending");
  });

  it("guard: offline refuses every verb and the palette offers no agent for an action verb (pinned)", () => {
    const s = initSim(99);
    for (const verb of RULE_VERBS) for (const a of s.agents.slice(0, 20)) expect(admit(verb, a, { offline: true })).toBe("offline");
    for (const verb of ["pause", "resume", "run", "cancel"] as const) {
      expect(buildItems(paletteDeps({ scope: s.agents, verb, offline: true })).filter((it) => it.group === "agents")).toHaveLength(0);
    }
  });

  it("an approve whose review was already resolved settles as refused 'gone'", () => {
    const s = initSim(99);
    const a = s.agents.find((x) => x.reviews.length)!;
    const spec = { verb: "approve" as const, agentId: a.id, rid: "no-such-review" };
    expect(settle(spec, s)).toEqual({ action: null, refusal: "gone" });
    const real = { verb: "approve" as const, agentId: a.id, rid: a.reviews[0].id };
    expect(settle(real, s).refusal).toBeNull();
    expect(settle(real, s).action).toEqual({ type: "review", id: a.id, rid: a.reviews[0].id, approve: true });
  });
});
