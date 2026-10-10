import { describe, expect, it } from "vitest";
import { downloadPlan } from "@/lib/release";
import { handoffRoutes, initialHandoff, reduce, view, type HandoffState } from "./handoffMachine";

const LIVE = "https://github.com/x/personas/releases/download/v1/setup.exe";
const NOT_LIVE = handoffRoutes(downloadPlan(undefined));

describe("handoffRoutes: the route comes from the release authority", () => {
  it("routes every platform to the waitlist when no installer is live", () => {
    expect(NOT_LIVE).toEqual({ windows: "waitlist", macos: "waitlist", linux: "waitlist" });
  });

  it("routes Windows to share once its installer is live, the others stay on the waitlist", () => {
    expect(handoffRoutes(downloadPlan(LIVE))).toEqual({ windows: "share", macos: "waitlist", linux: "waitlist" });
  });
});

describe("reduce: one submission at a time", () => {
  const idleWinShare: HandoffState = { phase: "idle", platform: "windows", route: "share", token: 0, error: null, manual: false };

  it("a submit on the share route goes busy with a fresh token and asks for a share", () => {
    const [state, effect] = reduce(idleWinShare, { type: "submit" });
    expect(state).toMatchObject({ phase: "busy", token: 1 });
    expect(effect).toMatchObject({ kind: "share", token: 1 });
  });

  it("a second submit while busy changes nothing and emits no effect (Enter cannot post twice)", () => {
    const [busy] = reduce(idleWinShare, { type: "submit" });
    const [again, effect] = reduce(busy, { type: "submit", email: "visitor@example.com" });
    expect(again).toBe(busy);
    expect(effect).toBeNull();
  });
});

describe("reduce: a result is matched to its submission", () => {
  it("drops a stale result after the platform changed mid-flight", () => {
    const busyMac: HandoffState = { phase: "busy", platform: "macos", route: "waitlist", token: 1 };
    const [switched] = reduce(busyMac, { type: "platform", platform: "linux" }, NOT_LIVE);
    const [after, effect] = reduce(switched, { type: "result", token: 1, outcome: "joined" }, NOT_LIVE);
    expect(after).toMatchObject({ phase: "idle", platform: "linux" });
    expect(after.phase).not.toBe("sent");
    expect(effect).toBeNull();
  });

  it("lands a duplicate on its own token as 'already' for the submitted platform", () => {
    const busyMac: HandoffState = { phase: "busy", platform: "macos", route: "waitlist", token: 2 };
    const [after] = reduce(busyMac, { type: "result", token: 2, outcome: "duplicate" });
    expect(after).toMatchObject({ phase: "sent", kind: "already", platform: "macos" });
  });
});

describe("view: the dock, hint and email field follow the route", () => {
  it("Windows on the waitlist route joins the list and claims no installer", () => {
    expect(view({ ...initialHandoff(NOT_LIVE), platform: "windows", route: "waitlist" })).toMatchObject({ dock: "join", hint: "hintWaitlist", showEmail: true });
  });

  it("Windows on the share route sends the link and hides the email field", () => {
    expect(view({ ...initialHandoff(NOT_LIVE), platform: "windows", route: "share" })).toMatchObject({ dock: "send", hint: "hintWin", showEmail: false });
  });
});
