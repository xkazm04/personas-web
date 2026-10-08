"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/stores/authStore";
import { useDeviceStore } from "@/stores/deviceStore";
import { useControllerStore } from "@/stores/controllerStore";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { api } from "@/lib/api";
import {
  computeReachability,
  parseDemoDesktop,
  type DemoDesktop,
  type Reachability,
  type SyncedDevice,
} from "@/lib/sync/reachability";

const IS_SUPABASE = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";
const IS_DESKTOP = process.env.NEXT_PUBLIC_DATA_SOURCE === "desktop";

/** The desktop plane has no heartbeat row: its gate is a health probe, repeated on this clock while visible. */
const DESKTOP_PROBE_MS = 30_000;

/** Staleness is the ABSENCE of heartbeats, so no event announces "offline": re-judge on a clock. */
const TICK_MS = 10_000;

/** The demo's simulated desktop (a fixture name, like the demo personas). */
export const DEMO_DEVICE_ID = "demo-desktop";
const DEMO_DEVICE_NAME = "Studio PC";
/** How long ago the demo desktop was seen when `?desktop=offline`. */
const DEMO_OFFLINE_AGO_MS = 7 * 60_000;

function demoDevices(mode: DemoDesktop, now: number): SyncedDevice[] {
  if (mode === "never") return [];
  const ago = mode === "offline" ? DEMO_OFFLINE_AGO_MS : 8_000;
  return [{ deviceId: DEMO_DEVICE_ID, name: DEMO_DEVICE_NAME, platform: "windows", lastSeenAt: new Date(now - ago).toISOString() }];
}

export interface SyncReachability extends Reachability {
  /**
   * The inputs have landed. Until then the tier would read "never synced" for
   * a user whose devices are still loading, so callers show neither a banner
   * nor a CTA while this is false.
   */
  ready: boolean;
  /** The clock the tier was judged at (for "last seen 3 minutes ago"). */
  now: number;
  /** The newest device's id: where a command goes when the persona names no owner. */
  fallbackDeviceId: string | null;
  /** The tier for one persona, judged on the device that owns it. */
  tierFor: (ownerDeviceId: string | null | undefined) => Reachability;
  /**
   * Actions here are commands to the desktop (the demo's scripted desktop, or
   * the live sync mirror), not the orchestrator's direct writes. Review
   * verdicts follow the online gate only on a command plane (M20).
   */
  commandPlane: boolean;
  /** The live plane is the desktop's local API: some actions are unsupported there (`desktopUnsupported`). */
  desktopPlane: boolean;
}

/**
 * Can this browser reach the user's desktop right now (PHASE2-SPEC.md 4.2)?
 * Reads `synced_devices` once (live Realtime payloads keep it current through
 * `deviceStore`), loads this browser's controller phase, and re-judges every
 * 10 s while the tab is visible. In demo the desktop is simulated, and the
 * `?desktop=offline|never` switch turns it off or away for review and e2e.
 */
export function useSyncReachability(): SyncReachability {
  const { isDemo, isAuthenticated } = useAuthStore(
    useShallow((s) => ({ isDemo: s.isDemo, isAuthenticated: s.isAuthenticated })),
  );
  const live = IS_SUPABASE && isAuthenticated && !isDemo;
  const probing = IS_DESKTOP && isAuthenticated && !isDemo;
  const liveDevices = useDeviceStore((s) => s.devices);
  const devicesLoaded = useDeviceStore((s) => s.loaded);
  const phase = useControllerStore((s) => s.phase);
  const hidden = usePageVisibility();

  // Client-only view (next/dynamic ssr:false), so reading the URL once is safe.
  const [demoDesktop] = useState<DemoDesktop>(() =>
    typeof window === "undefined" ? "online" : parseDemoDesktop(window.location.search),
  );
  const [desktopSeenAt, setDesktopSeenAt] = useState<number | null>(null);
  const [probeSettled, setProbeSettled] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (hidden) return;
    const tick = () => setNow(Date.now());
    // Coming back to a visible tab re-judges at once, then on the clock.
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, TICK_MS);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [hidden]);

  useEffect(() => {
    if (!live) return;
    void useDeviceStore.getState().fetchDevices();
    if (useControllerStore.getState().phase === "unknown") void useControllerStore.getState().load();
  }, [live]);

  useEffect(() => {
    if (!probing || hidden) return;
    let cancelled = false;
    const probe = () => {
      api.getHealth().then(
        () => {
          if (cancelled) return;
          setDesktopSeenAt(Date.now());
          setProbeSettled(true);
        },
        () => {
          // A closed desktop is the expected cause: keep the old value, which
          // ages out through DEVICE_FRESH_MS, and say nothing.
          if (!cancelled) setProbeSettled(true);
        },
      );
    };
    probe();
    const id = setInterval(probe, DESKTOP_PROBE_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [probing, hidden]);

  const devices = useMemo(
    () => (isDemo ? demoDevices(demoDesktop, now) : liveDevices),
    [isDemo, demoDesktop, now, liveDevices],
  );

  const tierFor = useCallback(
    (ownerDeviceId: string | null | undefined) =>
      computeReachability({
        isDemo,
        isAuthenticated,
        supabasePlane: IS_SUPABASE,
        desktopPlane: IS_DESKTOP,
        desktopSeenAt,
        devices,
        paired: phase === "active",
        ownerDeviceId,
        demoDesktop,
        now,
      }),
    [isDemo, isAuthenticated, devices, phase, demoDesktop, desktopSeenAt, now],
  );

  const overall = tierFor(null);
  const ready = probing
    ? probeSettled
    : !live || (devicesLoaded && phase !== "unknown" && phase !== "loading");
  return { ...overall, ready, now, fallbackDeviceId: overall.device?.deviceId ?? null, tierFor, commandPlane: isDemo || IS_SUPABASE, desktopPlane: IS_DESKTOP && !isDemo };
}
