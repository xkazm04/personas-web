import { describe, expect, it } from "vitest";
import { itemsOf, triageItems, triageList } from "./triage";
import { initSim, simReducer } from "./sim";
import { queueOf } from "./model";
import { toAction } from "./useCommands";

const s0 = initSim(99);
const scope = s0.agents.slice(0, 99);

describe("triage queue", () => {
  it("is one item per decision, in the needs-you queue's agent order", () => {
    const items = triageItems(scope);
    const agentOrder = [...new Set(items.map((i) => i.agentId))];
    expect(agentOrder).toEqual(queueOf(scope).map((a) => a.id));
    const reviews = scope.reduce((n, a) => n + a.reviews.length, 0);
    expect(items.filter((i) => i.kind === "review").length).toBe(reviews);
    expect(new Set(items.map((i) => i.key)).size).toBe(items.length);
  });

  it("takes an agent's failure or question before its reviews, most severe review first", () => {
    const a = scope.find((x) => x.state === "input_required" && x.reviews.length > 1)!;
    const items = itemsOf(a);
    expect(items[0].kind).toBe("input");
    const sev = items.slice(1).map((i) => a.reviews.find((r) => r.id === i.rid)!.severity);
    const rank = { critical: 0, warning: 1, info: 2 };
    expect(sev).toEqual([...sev].sort((x, y) => rank[x] - rank[y]));
  });

  it("keeps the frozen order, skips handled items, drops resolved ones and appends new ones", () => {
    const snapshot = triageItems(scope).map((i) => i.key);
    const first = snapshot[0];
    expect(triageList(snapshot, scope, new Set([first]))[0].key).toBe(snapshot[1]);
    // Resolve the first failed agent elsewhere: its item drops out.
    const failed = scope.find((a) => a.state === "failed" && !a.reviews.length)!;
    const after = simReducer(s0, { type: "retry", id: failed.id }).agents.slice(0, 99);
    expect(triageList(snapshot, after, new Set()).some((i) => i.agentId === failed.id)).toBe(false);
    // An item not in the snapshot joins at the end.
    const short = snapshot.slice(1);
    expect(triageList(short, scope, new Set()).at(-1)!.key).toBe(first);
  });
});

describe("draft verdicts and answers", () => {
  it("a draft with no review publishes or goes back to revise", () => {
    const d = scope.find((a) => a.state === "draft_ready" && !a.reviews.length)!;
    expect(itemsOf(d).map((i) => i.kind)).toEqual(["draft"]);
    const pub = simReducer(s0, toAction({ verb: "publish", agentId: d.id })!);
    expect(pub.agents.find((a) => a.id === d.id)!.state).toBe("idle");
    expect(pub.events[0]).toMatchObject({ decision: { act: "publish" } });
    const rev = simReducer(s0, toAction({ verb: "revise", agentId: d.id })!);
    expect(["running", "queued"]).toContain(rev.agents.find((a) => a.id === d.id)!.state);
  });

  it("an answer carries its words into the log and resumes only a waiting agent", () => {
    const w = scope.find((a) => a.state === "input_required")!;
    const s1 = simReducer(s0, toAction({ verb: "answer", agentId: w.id, text: "  Use the safer option " })!);
    expect(s1.events[0]).toMatchObject({ decision: { act: "answer", text: "Use the safer option" } });
    const idle = scope.find((a) => a.state === "idle")!;
    expect(simReducer(s0, { type: "answer", id: idle.id })).toBe(s0);
  });
});
