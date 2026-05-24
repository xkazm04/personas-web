/**
 * Storage abstraction for feature votes + shipped-features registry.
 * Supabase in production (when env vars are present), filesystem fallback
 * otherwise. The FS fallback uses atomic temp-file writes and is guarded
 * by withWriteLock at the call site to prevent TOCTOU races.
 */

import { hasSupabaseEnv } from "@/lib/server/env";
import { readJsonFile, writeJsonFile } from "@/lib/server/json-file-store";

export const ALLOWED_FEATURES = new Set([
  "macos",
  "i18n",
  "dashboard",
  "enterprise",
]);

/* ── Types ─────────────────────────────────────────────────────────── */

export interface VoteEntry {
  feature_id: string;
  voter_id: string;
  email?: string;
  created_at: string;
}

export interface VotesData {
  entries: VoteEntry[];
}

export interface ShippedEntry {
  feature_id: string;
  changelog: string;
  link: string;
  shipped_at: string;
}

export interface ShippedData {
  entries: ShippedEntry[];
}

/* ── Supabase helpers ──────────────────────────────────────────────── */

export function hasSupabase(): boolean {
  return hasSupabaseEnv();
}

export async function getSupabaseClient() {
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}

/* ── Filesystem fallback ───────────────────────────────────────────── */

export async function readVotes(): Promise<VotesData> {
  return readJsonFile<VotesData>("votes.json", { entries: [] });
}

export async function writeVotes(data: VotesData): Promise<void> {
  await writeJsonFile("votes.json", data);
}

export async function readShipped(): Promise<ShippedData> {
  return readJsonFile<ShippedData>("shipped.json", { entries: [] });
}
