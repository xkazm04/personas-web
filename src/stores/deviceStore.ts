import { create } from "zustand";
import { getSupabase } from "@/lib/supabase";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";
import type { SyncedDevice } from "@/lib/sync/reachability";

/**
 * The user's desktop installs (`synced_devices`) and their heartbeats: the
 * input of the online gate (`useSyncReachability`). Read once, then kept
 * current by the `synced_devices` Realtime payloads `useSyncedRealtime`
 * routes here. Live plane only; demo synthesizes its device in the hook.
 */

interface DeviceRow {
  device_id: string;
  name: string | null;
  platform: string | null;
  last_seen_at: string | null;
}

function mapDevice(r: DeviceRow): SyncedDevice {
  return { deviceId: r.device_id, name: r.name, platform: r.platform, lastSeenAt: r.last_seen_at };
}

interface DeviceState {
  devices: SyncedDevice[];
  /** The first read has landed (an empty list then means "never synced", not "not loaded"). */
  loaded: boolean;
  error: string | null;
  fetchDevices: () => Promise<void>;
  /** A Realtime change on `synced_devices`: upsert on INSERT/UPDATE, drop on DELETE. */
  applyRealtime: (payload: { eventType?: string; new?: Record<string, unknown> | null; old?: Record<string, unknown> | null }) => void;
  reset: () => void;
}

let inflight: Promise<void> | null = null;

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  loaded: false,
  error: null,
  fetchDevices: () => {
    if (inflight) return inflight;
    inflight = (async () => {
      try {
        const { data, error } = await getSupabase()
          .from("synced_devices")
          .select("device_id,name,platform,last_seen_at");
        if (error) throw new Error(error.message);
        set({ devices: ((data ?? []) as DeviceRow[]).map(mapDevice), loaded: true, error: null });
      } catch (err) {
        captureExceptionScrubbed(err, { tags: { scope: "fetchDevices" } });
        set({ error: err instanceof Error ? err.message : "Failed to load devices", loaded: true });
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  },
  applyRealtime: (payload) => {
    if (payload.eventType === "DELETE") {
      const id = payload.old?.device_id;
      if (typeof id === "string") set((s) => ({ devices: s.devices.filter((d) => d.deviceId !== id) }));
      return;
    }
    const row = payload.new;
    if (!row || typeof row.device_id !== "string") return;
    const next = mapDevice(row as unknown as DeviceRow);
    set((s) => {
      const rest = s.devices.filter((d) => d.deviceId !== next.deviceId);
      return { devices: [...rest, next] };
    });
  },
  reset: () => {
    inflight = null;
    set({ devices: [], loaded: false, error: null });
  },
}));
