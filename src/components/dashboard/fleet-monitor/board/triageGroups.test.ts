import { describe, expect, it, vi } from "vitest";
import { personasMonitorCopy } from "@/i18n/pending/personasMonitor";
import { initSim, simReducer } from "./sim";
import { triageItems, triageList } from "./triage";
import { groupItems, groupPredicate, groupRetry, groupVerdicts, markAll, reconcile, type TriageGroup } from "./triageGroups";
import { makeOperator } from "./operator";
import { planBatchUndo, type Command, type CommandSpec, type Commands } from "./useCommands";

/* Triage by question: the 45 decisions at 99 agents are 16 questions. One
 * judgment covers a homogeneous group; bulk-approve is withheld when any
 * member is critical; a batch is one Undo that reports a split honestly. */

const c = personasMonitorCopy.board;
const s0 = initSim(99);
const scope = s0.agents.slice(0, 99);
const empty = new Set<string>();
const items = triageList([], scope, empty);
const groups = groupItems(items, scope);
const byTitle = (t: string) => groups.find((g) => g.title === t)!;

describe("triage by question", () => {
  it("groups the 45 decisions into 16: failures, singleton answers, drafts and 8 review questions", () => {
    expect(items).toHaveLength(45);
    expect(groups).toHaveLength(16);
    const keys = groups.flatMap((g) => g.members.map((m) => m.key));
    expect(keys).toHaveLength(45);
    expect(new Set(keys)).toEqual(new Set(items.map((i) => i.key)));
    const of = (k: string) => groups.filter((g) => g.kind === k);
    expect(of("failed").map((g) => g.members.length)).toEqual([4]);
    expect(of("input").map((g) => g.members.length)).toEqual([1, 1, 1, 1, 1, 1]);
    expect(of("draft").map((g) => g.members.length)).toEqual([3]);
    expect(of("review")).toHaveLength(8);
    expect(byTitle("Merge needs a human look").members).toHaveLength(7);
  });

  it("withholds bulk approve when any member is critical", () => {
    expect(groupPredicate(byTitle("Merge needs a human look")).severities).toEqual({ critical: 5, warning: 2 });
    expect(groupVerdicts(byTitle("Merge needs a human look"))).toEqual(["sendback"]);
    expect(groupVerdicts(byTitle("Contract clause outside playbook"))).toEqual(["approve", "sendback"]);
  });

  it("carries its count and mix, loses a member decided elsewhere, and never gains a late arrival", () => {
    const g = byTitle("Confirm refund above limit");
    expect(groupPredicate(g)).toEqual({ n: 5, severities: { warning: 3, info: 2 } });
    // One member is decided in the console: the review resolves in the sim.
    const m = g.members[0];
    const s1 = simReducer(s0, { type: "review", id: m.agentId, rid: m.rid!, approve: true });
    const g1 = reconcile(g, triageList([], s1.agents.slice(0, 99), empty));
    expect(groupPredicate(g1).n).toBe(4);
    expect(g1.members.some((x) => x.key === m.key)).toBe(false);
    // A new review with the same question arrives after grouping: it does not join.
    const s2 = structuredClone(s1);
    const late = s2.agents.find((a) => a.state === "idle" && !a.reviews.length)!;
    late.reviews.push({ id: "late-1", severity: "info", title: g.title!, ageMin: 0 });
    late.state = "attention";
    const live = triageList([], s2.agents.slice(0, 99), empty);
    expect(live.some((i) => i.rid === "late-1")).toBe(true);
    expect(groupPredicate(reconcile(g, live)).n).toBe(4);
  });

  it("holds a batch verdict as one Undo and reports a split when a member already left", () => {
    const g = byTitle("Merge needs a human look");
    const sent: { spec: CommandSpec; hold?: boolean }[] = [];
    let id = 100;
    const send = vi.fn((spec: CommandSpec, hold?: boolean) => { sent.push({ spec, hold }); return ++id; });
    const commands = { cmds: [], send, undo: () => false, undoBatch: () => ({ undone: 0, alreadySent: 0 }), newBatch: () => 7 } as unknown as Commands;
    const op = makeOperator({ commands, toast: () => {}, copy: c, hostName: "Studio PC", offline: false, simMs: 0 });
    const batchId = op.verdictBatch(g, false, scope);
    expect(batchId).toBe(7);
    expect(sent).toHaveLength(7);
    expect(sent.every((x) => x.hold === true && x.spec.batch === 7 && x.spec.verb === "sendback")).toBe(true);

    const cmds: Command[] = sent.map((x, i) => ({ ...x.spec, id: 101 + i, status: "held" }));
    expect(planBatchUndo(cmds, 7)).toEqual({ undo: cmds.map((x) => x.id), alreadySent: 0 });
    const left = cmds.map((x, i) => (i === 2 ? { ...x, status: "sending" as const } : x));
    const plan = planBatchUndo(left, 7);
    expect({ undone: plan.undo.length, alreadySent: plan.alreadySent }).toEqual({ undone: 6, alreadySent: 1 });
  });

  it("offers Retry counting only the members the rulebook admits (a paused one is skipped)", () => {
    const g = groups.find((x) => x.kind === "failed")!;
    expect(g.members).toHaveLength(4);
    // initSim(99) has no paused failed agent: construct one.
    const paused = scope.map((a) => (a.id === g.members[1].agentId ? { ...a, enabled: false } : a));
    expect(groupRetry(g, paused)).toEqual({ verb: "retry", n: 3, skipped: 1 });
  });

  it("deciding a group adds its members to the tally and one-at-a-time resumes at the first undecided item", () => {
    const snapshot = triageItems(scope).map((i) => i.key);
    const g: TriageGroup = byTitle("Confirm refund above limit");
    const handled = markAll(new Map(), g.members.map((m) => m.key), "decided");
    expect([...handled.values()].filter((v) => v === "decided")).toHaveLength(5);
    const rest = triageList(snapshot, scope, new Set(handled.keys()));
    expect(rest).toHaveLength(40);
    expect(rest.some((i) => handled.has(i.key))).toBe(false);
    expect(rest[0].key).toBe(snapshot.find((k) => !handled.has(k)));
  });
});
