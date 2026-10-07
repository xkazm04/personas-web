/**
 * Can this browser reach the user's desktop app right now? The online gate of
 * the phone command plane (docs/concepts/mobile-revival/PHASE2-SPEC.md section 4).
 *
 * `synced_devices.last_seen_at` is the heartbeat: the desktop upserts it first
 * in every sync pass (every 45 s, plus 2 s after any change), under the same
 * gates as its command poll, and the server stamps it (trg_stamp_device_seen).
 * A fresh heartbeat therefore means "a command inserted now will be seen".
 *
 * Pure: every input, including `now`, is passed in, so the tier table is
 * testable and nothing here reads a clock in a render path.
 */

/**
 * How fresh a heartbeat must be to count as online: 120 s is 2.7 missed 45 s
 * passes, so one slow pass does not flap the gate. Shared with
 * `supabaseApi.getHealth/getStatus`, so the header and the gate never disagree.
 */
export const DEVICE_FRESH_MS = 120_000;

/** A row of `synced_devices`, camelCased. */
export interface SyncedDevice {
  deviceId: string;
  name: string | null;
  platform: string | null;
  lastSeenAt: string | null;
}

/**
 * - `demo`: a visitor on mocks; actions run against the simulated desktop.
 * - `no-account`: not signed in.
 * - `never-synced`: signed in, but no desktop has ever synced (app not
 *   installed, sync never turned on, or another Google account). Download CTA.
 * - `offline`: a desktop has synced, but its heartbeat is stale. Actions are
 *   blocked (nothing is queued, PLAN M12); no download CTA.
 * - `online-unpaired`: the desktop is reachable but this browser holds no
 *   active controller key, so it cannot sign a command.
 * - `online`: reachable and paired.
 */
export type ReachabilityTier =
  | "demo"
  | "no-account"
  | "never-synced"
  | "offline"
  | "online-unpaired"
  | "online";

/** The demo-only `?desktop=` switch, for review and e2e. */
export type DemoDesktop = "online" | "offline" | "never";

export interface ReachabilityInput {
  isDemo: boolean;
  isAuthenticated: boolean;
  /** The live plane is the desktop -> Supabase mirror (NEXT_PUBLIC_DATA_SOURCE=supabase). */
  supabasePlane: boolean;
  devices: readonly SyncedDevice[];
  /** This browser holds a controller key the desktop has activated. */
  paired: boolean;
  /** The device that owns the persona being acted on; null = the newest device. */
  ownerDeviceId?: string | null;
  /** Demo only: `?desktop=offline|never` turns the simulated desktop off or away. */
  demoDesktop?: DemoDesktop;
  now: number;
}

export interface Reachability {
  tier: ReachabilityTier;
  /** The device the tier was judged on (for "Open Personas on <name>"), if any. */
  device: SyncedDevice | null;
}

/** The heartbeat time in ms, or null when the row has none or it is unparseable. */
export function lastSeenMs(device: SyncedDevice): number | null {
  if (!device.lastSeenAt) return null;
  const ms = new Date(device.lastSeenAt).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function isDeviceOnline(device: SyncedDevice, now: number): boolean {
  const seen = lastSeenMs(device);
  return seen !== null && now - seen <= DEVICE_FRESH_MS;
}

/** The most recently seen device, or null for an empty list. */
export function newestDevice(devices: readonly SyncedDevice[]): SyncedDevice | null {
  let best: SyncedDevice | null = null;
  let bestMs = -Infinity;
  for (const d of devices) {
    const ms = lastSeenMs(d) ?? -Infinity;
    if (best === null || ms > bestMs) {
      best = d;
      bestMs = ms;
    }
  }
  return best;
}

export function computeReachability(input: ReachabilityInput): Reachability {
  const { devices, now } = input;
  const owner =
    (input.ownerDeviceId ? devices.find((d) => d.deviceId === input.ownerDeviceId) : undefined) ??
    newestDevice(devices);

  if (input.isDemo) {
    // The demo's devices are simulated by the caller; only the switch matters.
    if (input.demoDesktop === "never") return { tier: "never-synced", device: null };
    if (input.demoDesktop === "offline") return { tier: "offline", device: owner };
    return { tier: "demo", device: owner };
  }
  if (!input.isAuthenticated) return { tier: "no-account", device: null };
  // The orchestrator plane has no heartbeat: from here the desktop cannot be reached.
  if (!input.supabasePlane || devices.length === 0 || owner === null) {
    return { tier: "never-synced", device: null };
  }
  if (!isDeviceOnline(owner, now)) return { tier: "offline", device: owner };
  return { tier: input.paired ? "online" : "online-unpaired", device: owner };
}

/** Persona actions are possible in these tiers (demo runs them against the simulated desktop). */
export function actionsEnabled(tier: ReachabilityTier): boolean {
  return tier === "demo" || tier === "online";
}

/**
 * Can a review verdict be given here (PLAN M20)? On a command plane (the live
 * mirror, the demo) a verdict is a `review_decide` command, so it follows the
 * online gate like the persona actions (null = not judged yet: no). The
 * orchestrator plane writes the verdict itself and has no gate.
 */
export function verdictsEnabled(tier: ReachabilityTier | null, commandPlane: boolean): boolean {
  if (!commandPlane) return true;
  return tier !== null && actionsEnabled(tier);
}

/**
 * The desktop download CTA shows only where a real user cannot sync (PLAN M7):
 * no account, or an account whose desktop has never synced. A synced user whose
 * desktop is merely closed is told to open it, not to download it again, and the
 * demo never shows it (owner, 2026-10-06): the demo is a tour of the dashboard,
 * not a sign-up funnel.
 */
export function showsDownloadCta(tier: ReachabilityTier): boolean {
  return tier === "no-account" || tier === "never-synced";
}

/** Parse the demo `?desktop=` switch from a query string. */
export function parseDemoDesktop(search: string): DemoDesktop {
  const value = new URLSearchParams(search).get("desktop");
  return value === "offline" || value === "never" ? value : "online";
}
