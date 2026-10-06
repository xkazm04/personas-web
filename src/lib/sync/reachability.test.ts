import { describe, expect, it } from "vitest";
import {
  DEVICE_FRESH_MS,
  actionsEnabled,
  computeReachability,
  newestDevice,
  parseDemoDesktop,
  showsDownloadCta,
  type ReachabilityInput,
  type SyncedDevice,
} from "./reachability";

const NOW = Date.parse("2026-10-06T12:00:00.000Z");
const seenAgo = (deviceId: string, seconds: number, name: string | null = null): SyncedDevice => ({
  deviceId,
  name,
  platform: "windows",
  lastSeenAt: new Date(NOW - seconds * 1000).toISOString(),
});

const live = (over: Partial<ReachabilityInput>): ReachabilityInput => ({
  isDemo: false,
  isAuthenticated: true,
  supabasePlane: true,
  devices: [],
  paired: true,
  now: NOW,
  ...over,
});

describe("reachability tiers (PHASE2-SPEC 4.3)", () => {
  it("the freshness window is 120 s", () => {
    expect(DEVICE_FRESH_MS).toBe(120_000);
  });

  it("119 s since the heartbeat is online, 121 s is offline", () => {
    expect(computeReachability(live({ devices: [seenAgo("d1", 119)] })).tier).toBe("online");
    expect(computeReachability(live({ devices: [seenAgo("d1", 120)] })).tier).toBe("online");
    expect(computeReachability(live({ devices: [seenAgo("d1", 121)] })).tier).toBe("offline");
  });

  it("0 devices is never-synced", () => {
    expect(computeReachability(live({ devices: [] }))).toEqual({ tier: "never-synced", device: null });
  });

  it("a device row with no heartbeat at all is offline, not never-synced", () => {
    const d: SyncedDevice = { deviceId: "d1", name: null, platform: null, lastSeenAt: null };
    expect(computeReachability(live({ devices: [d] })).tier).toBe("offline");
  });

  it("online but unpaired is online-unpaired", () => {
    expect(computeReachability(live({ devices: [seenAgo("d1", 5)], paired: false })).tier).toBe("online-unpaired");
  });

  it("offline wins over unpaired: the desktop being closed is the thing to fix first", () => {
    expect(computeReachability(live({ devices: [seenAgo("d1", 600)], paired: false })).tier).toBe("offline");
  });

  it("not signed in is no-account", () => {
    expect(computeReachability(live({ isAuthenticated: false, devices: [seenAgo("d1", 5)] })).tier).toBe("no-account");
  });

  it("the orchestrator plane has no heartbeat, so it reads as never-synced", () => {
    expect(computeReachability(live({ supabasePlane: false, devices: [seenAgo("d1", 5)] })).tier).toBe("never-synced");
  });

  it("demo is demo whatever else is true, and its ?desktop= switch maps to offline / never-synced", () => {
    const demo = live({ isDemo: true, isAuthenticated: false, supabasePlane: false, paired: false, devices: [seenAgo("demo", 7 * 60)] });
    expect(computeReachability(demo).tier).toBe("demo");
    expect(computeReachability({ ...demo, demoDesktop: "offline" }).tier).toBe("offline");
    expect(computeReachability({ ...demo, demoDesktop: "never" })).toEqual({ tier: "never-synced", device: null });
  });

  it("the tier is judged on the device that owns the persona, not the newest one", () => {
    const devices = [seenAgo("laptop", 10, "Laptop"), seenAgo("studio", 900, "Studio PC")];
    expect(computeReachability(live({ devices })).tier).toBe("online");
    const owned = computeReachability(live({ devices, ownerDeviceId: "studio" }));
    expect(owned.tier).toBe("offline");
    expect(owned.device?.name).toBe("Studio PC");
    // An owner the mirror does not know falls back to the newest device.
    expect(computeReachability(live({ devices, ownerDeviceId: "gone" })).device?.deviceId).toBe("laptop");
  });

  it("newestDevice picks the latest heartbeat and ranks a missing one last", () => {
    const none: SyncedDevice = { deviceId: "n", name: null, platform: null, lastSeenAt: null };
    expect(newestDevice([none, seenAgo("a", 300), seenAgo("b", 30)])?.deviceId).toBe("b");
    expect(newestDevice([])).toBeNull();
  });
});

describe("what each tier allows (M7, M12)", () => {
  it("actions run only in demo and online", () => {
    const enabled = (["demo", "no-account", "never-synced", "offline", "online-unpaired", "online"] as const).filter(actionsEnabled);
    expect(enabled).toEqual(["demo", "online"]);
  });

  it("the download CTA shows only where the user cannot sync", () => {
    const cta = (["demo", "no-account", "never-synced", "offline", "online-unpaired", "online"] as const).filter(showsDownloadCta);
    expect(cta).toEqual(["demo", "no-account", "never-synced"]);
  });

  it("parses the demo switch, defaulting to online", () => {
    expect(parseDemoDesktop("?desktop=offline")).toBe("offline");
    expect(parseDemoDesktop("?tour=1&desktop=never")).toBe("never");
    expect(parseDemoDesktop("?desktop=banana")).toBe("online");
    expect(parseDemoDesktop("")).toBe("online");
  });
});
