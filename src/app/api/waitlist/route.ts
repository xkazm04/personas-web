/**
 * WAITLIST API - SERVERLESS LIMITATIONS & PRODUCTION WARNING
 *
 * 1. STORAGE: When Supabase is configured (NEXT_PUBLIC_SUPABASE_URL + a key),
 *    signups persist to the waitlist_entries table via the server-only client.
 *    Otherwise this falls back to the local filesystem (.data/waitlist.json),
 *    which is ephemeral on serverless (Vercel, AWS Lambda) — data is LOST on
 *    every cold start or redeploy, so the FS path is for local dev only.
 *
 * 2. DATABASE: For production, configure Supabase and create the
 *    waitlist_entries table (scripts/harden-voting-rls.sql).
 *
 * 3. RATE LIMITING: The rate limiter uses an in-memory Map. On serverless, this state
 *    is reset per invocation and shared only within the same warm instance, providing
 *    no reliable protection against distributed attacks or high-volume spam.
 *
 * ── PII Policy ──────────────────────────────────────────────────────
 * This route collects:
 * - email: provided voluntarily by the user to join the waitlist
 * - platform: the platform the user is interested in (not PII)
 * IP addresses are used ONLY for transient in-memory rate limiting
 * and are NEVER persisted to the database or filesystem.
 * ────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/validation";
import { withWriteLock } from "@/lib/fileLock";
import { readJsonFile, writeJsonFile } from "@/lib/server/json-file-store";
import { hasSupabaseEnv } from "@/lib/server/env";
import { getClientIp, jsonError, parseJsonBody } from "@/lib/server/request";
import { isRateLimited as isSharedRateLimited } from "@/lib/server/rate-limit";

const WAITLIST_FILE = "waitlist.json";
const WAITLIST_TABLE = "waitlist_entries";

// Persist to Supabase when configured; the .data/*.json path is a local-dev
// fallback only (ephemeral on serverless — signups would be lost on cold start).
function hasSupabase(): boolean {
  return hasSupabaseEnv();
}

async function getSupabaseClient() {
  const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
  return getSupabaseAdmin();
}

interface WaitlistEntry {
  email: string;
  platform: string;
  earlyBeta: boolean;
  createdAt: string;
}

interface WaitlistData {
  entries: WaitlistEntry[];
}

// --- Input validation ---

const VALID_PLATFORMS = new Set(["macos", "windows", "linux"]);

// --- Rate limiting (in-memory, per IP, sliding window) ---

const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_POST = 5;     // max 5 signups per minute per IP
const RATE_LIMIT_GET = 30;     // max 30 reads per minute per IP

function rateLimit(ip: string, limit: number): boolean {
  return isSharedRateLimited({
    namespace: "waitlist",
    key: ip,
    limit,
    windowMs: RATE_WINDOW_MS,
  });
}

// --- O(1) indices (populated on first read, kept in sync on writes) ---

let dedupIndex: Set<string> | null = null;
let platformCounts: Map<string, number> | null = null;

function dedupKey(email: string, platform: string): string {
  return `${email}:${platform}`;
}

async function readWaitlist(): Promise<WaitlistData> {
  const data = await readJsonFile<WaitlistData>(WAITLIST_FILE, { entries: [] });
  // Build indices on first read
  if (!dedupIndex || !platformCounts) {
    dedupIndex = new Set();
    platformCounts = new Map();
    for (const e of data.entries) {
      dedupIndex.add(dedupKey(e.email, e.platform));
      platformCounts.set(e.platform, (platformCounts.get(e.platform) || 0) + 1);
    }
  }
  return data;
}

async function writeWaitlist(data: WaitlistData): Promise<void> {
  await writeJsonFile(WAITLIST_FILE, data);
}

// GET — return counts per platform
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(ip, RATE_LIMIT_GET)) {
    return jsonError("Too many requests", 429, { "Retry-After": "60" });
  }

  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    const counts: Record<string, number> = {};
    for (const platform of VALID_PLATFORMS) counts[platform] = 0;
    const { data, error } = await sb.from(WAITLIST_TABLE).select("platform");
    if (!error && data) {
      for (const row of data as { platform: string }[]) {
        if (row.platform in counts) counts[row.platform]++;
      }
    }
    return NextResponse.json({ counts });
  }

  // Use in-memory counts if available to avoid disk I/O and O(n) scan
  if (!platformCounts) {
    await readWaitlist();
  }

  const counts: Record<string, number> = {};
  for (const platform of VALID_PLATFORMS) {
    counts[platform] = platformCounts!.get(platform) || 0;
  }

  return NextResponse.json({ counts });
}

// POST — add an email to the waitlist
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(ip, RATE_LIMIT_POST)) {
    return jsonError("Too many requests", 429, { "Retry-After": "60" });
  }

  const parsed = await parseJsonBody<{ email?: string; platform?: string; earlyBeta?: boolean }>(req);
  if (!parsed.ok) return parsed.response;

  const { email, platform, earlyBeta } = parsed.data;

  // Email validation
  if (!email || typeof email !== "string") {
    return jsonError("Email is required", 400);
  }
  const trimmedEmail = email.trim().toLowerCase();
  if (!isValidEmail(trimmedEmail)) {
    return jsonError("Invalid email format", 400);
  }

  // Platform validation — whitelist
  if (!platform || typeof platform !== "string") {
    return jsonError("Platform is required", 400);
  }
  if (!VALID_PLATFORMS.has(platform)) {
    return jsonError(`Platform must be one of: ${[...VALID_PLATFORMS].join(", ")}`, 400);
  }

  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    const { error } = await sb.from(WAITLIST_TABLE).insert({
      email: trimmedEmail,
      platform,
      early_beta: !!earlyBeta,
    });
    if (error) {
      // 23505 = unique_violation on (email, platform) → already signed up.
      if (error.code === "23505") {
        return NextResponse.json({ message: "Already on the waitlist", duplicate: true });
      }
      return jsonError("Failed to join waitlist", 500);
    }
    const { count } = await sb
      .from(WAITLIST_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("platform", platform);
    return NextResponse.json({ message: "Added to waitlist", count: count ?? 0 });
  }

  // Serialize read-modify-write to prevent TOCTOU race conditions.
  // Concurrent POSTs are queued and processed one at a time.
  const result = await withWriteLock("waitlist", async () => {
    const data = await readWaitlist();

    // Check for duplicate — O(1) Set lookup
    const key = dedupKey(trimmedEmail, platform);
    if (dedupIndex!.has(key)) {
      return { duplicate: true, count: 0 } as const;
    }

    data.entries.push({
      email: trimmedEmail,
      platform,
      earlyBeta: !!earlyBeta,
      createdAt: new Date().toISOString(),
    });

    await writeWaitlist(data);
    dedupIndex!.add(key);

    // Update in-memory counts (write-through)
    const currentCount = (platformCounts!.get(platform) || 0) + 1;
    platformCounts!.set(platform, currentCount);

    return { duplicate: false, count: currentCount } as const;
  });

  if (result.duplicate) {
    return NextResponse.json({ message: "Already on the waitlist", duplicate: true });
  }

  return NextResponse.json({ message: "Added to waitlist", count: result.count });
}
