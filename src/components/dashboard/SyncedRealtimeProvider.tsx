"use client";

import { useSyncedRealtime } from "@/hooks/useSyncedRealtime";

/**
 * Mounts the Supabase Realtime subscription for the dashboard's lifetime.
 * Renders nothing — it just runs the live-update hook. Placed inside the
 * dashboard's AuthGuard so it only subscribes once auth is initialized.
 */
export default function SyncedRealtimeProvider() {
  useSyncedRealtime();
  return null;
}
