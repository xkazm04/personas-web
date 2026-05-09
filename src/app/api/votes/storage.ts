/**
 * Storage abstraction for feature votes + shipped-features registry.
 * Supabase in production (when env vars are present), filesystem fallback
 * otherwise. The FS fallback uses atomic temp-file writes and is guarded
 * by withWriteLock at the call site to prevent TOCTOU races.
 */

import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

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
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getSupabaseClient() {
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}

/* ── Filesystem fallback ───────────────────────────────────────────── */

const DATA_DIR = path.join(process.cwd(), ".data");
const VOTES_FILE = path.join(DATA_DIR, "votes.json");
const SHIPPED_FILE = path.join(DATA_DIR, "shipped.json");

export async function readVotes(): Promise<VotesData> {
  try {
    const raw = await fs.readFile(VOTES_FILE, "utf-8");
    return JSON.parse(raw) as VotesData;
  } catch {
    return { entries: [] };
  }
}

export async function writeVotes(data: VotesData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpFile = path.join(
    DATA_DIR,
    `.votes-${randomBytes(6).toString("hex")}.tmp`,
  );
  await fs.writeFile(tmpFile, JSON.stringify(data, null, 2));
  await fs.rename(tmpFile, VOTES_FILE);
}

export async function readShipped(): Promise<ShippedData> {
  try {
    const raw = await fs.readFile(SHIPPED_FILE, "utf-8");
    return JSON.parse(raw) as ShippedData;
  } catch {
    return { entries: [] };
  }
}
