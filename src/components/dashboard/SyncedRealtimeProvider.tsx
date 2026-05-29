"use client";

import { useSyncedRealtime } from "@/hooks/useSyncedRealtime";
import { useReviewVoice } from "@/hooks/useReviewVoice";

/**
 * Mounts the Supabase Realtime subscription for the dashboard's lifetime.
 * Renders nothing — it just runs the live-update hook. Placed inside the
 * dashboard's AuthGuard so it only subscribes once auth is initialized.
 *
 * Also mounts the review voice-announcer, which listens on the same in-app
 * signal bus the Realtime hook emits to. It runs in every mode (including the
 * demo) so the settings "Preview" trigger works without a live Supabase tenant.
 */
export default function SyncedRealtimeProvider() {
  useSyncedRealtime();
  useReviewVoice();
  return null;
}
