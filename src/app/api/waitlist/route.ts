/**
 * WAITLIST API - SERVERLESS LIMITATIONS & PRODUCTION WARNING
 *
 * 1. STORAGE: signups persist to the Supabase waitlist_entries table ONLY when
 *    a *writable* server client exists. Otherwise this falls back to the local
 *    filesystem (.data/waitlist.json), which is ephemeral on serverless
 *    (Vercel, AWS Lambda) — data is LOST on every cold start or redeploy, so
 *    the FS path is for local dev only.
 *
 *    ── Env matrix (which store this route picks) ─────────────────────────
 *    NEXT_PUBLIC_SUPABASE_URL | ANON_KEY | SUPABASE_SERVICE_ROLE_KEY | store
 *    ------------------------ | -------- | ------------------------- | -----
 *    unset                    | any      | any                       | file
 *    set                      | any      | unset                     | file
 *    set                      | any      | set                       | Supabase
 *    unset                    | any      | set                       | file
 *
 *    Why the service-role key (and not the anon key) is the switch:
 *    `getSupabaseAdmin()` prefers the service-role client but silently falls
 *    back to the anon client when the key is missing, and
 *    scripts/harden-voting-rls.sql does
 *    `revoke all on public.waitlist_entries from anon`. So a URL+anon-only
 *    deployment used to route every insert into a client that has no grants —
 *    every signup died as a generic 500. The file store is lossy, but it is
 *    never silent about it and never eats a signup at request time.
 *    See `hasSupabaseServiceRole()` in src/lib/server/env.ts.
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
import { hasSupabaseServiceRole } from "@/lib/server/env";
import { getClientIp, parseJsonBody, apiError, type ApiErrorCode } from "@/lib/server/request";
import { rateLimitGuard } from "@/lib/server/rate-limit";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

const WAITLIST_FILE = "waitlist.json";
const WAITLIST_TABLE = "waitlist_entries";

/**
 * The subset of the shared `ApiErrorCode` union this route can emit. Narrowing
 * the shared union (rather than re-declaring a parallel one) keeps the codes
 * the browser already translates byte-identical while making it impossible for
 * this route to invent a code no other route knows about. Never reword a code
 * — see the union's docs in src/lib/server/request.ts.
 */
type WaitlistErrorCode = Extract<
  ApiErrorCode,
  "rate_limited" | "invalid_email" | "invalid_platform" | "store_unavailable"
>;

/** Shared `{ error, code }` refusal, narrowed to this route's codes. */
function waitlistError(
  error: string,
  code: WaitlistErrorCode,
  status: number,
  headers?: HeadersInit,
): NextResponse {
  return apiError(error, code, status, headers);
}

// Persist to Supabase only when a WRITABLE server client is available (see the
// env matrix in the file header); the .data/*.json path is the local-dev
// fallback (ephemeral on serverless — signups would be lost on cold start).
// GET and POST must agree on the store, or the counts would come from one
// backend while the entries land in the other.
function hasSupabase(): boolean {
  return hasSupabaseServiceRole();
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

/**
 * Returns the 429 to send, or `null` to serve the request.
 *
 * This replaces a `boolean`-returning `rateLimit(ip, limit)` helper whose two
 * call sites both branched on its negation, so the first N requests per minute
 * were refused and everything past the limit was let through. The guard has no
 * polarity to get wrong: the only value it can return is the refusal itself.
 */
function rateLimit(ip: string, limit: number): NextResponse | null {
  return rateLimitGuard({
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
  const refusal = rateLimit(ip, RATE_LIMIT_GET);
  if (refusal) return refusal;

  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    // One `head: true` count query per platform (3 total) instead of selecting
    // every row and counting in JS: the old shape transferred and parsed the
    // whole table on every poll, so cost grew linearly with signups. Response
    // shape is unchanged.
    const counts: Record<string, number> = {};
    let failed: unknown = null;
    await Promise.all(
      [...VALID_PLATFORMS].map(async (platform) => {
        const { count, error } = await sb
          .from(WAITLIST_TABLE)
          .select("*", { count: "exact", head: true })
          .eq("platform", platform);
        if (error) failed ??= error;
        counts[platform] = error ? 0 : (count ?? 0);
      }),
    );
    if (failed) {
      // Counts are non-PII, but a zeroed 200 is indistinguishable from an
      // empty waitlist. Report the fault to Sentry AND refuse the request —
      // a read that could not reach its store must not fabricate zeros.
      captureExceptionScrubbed(
        new Error(`waitlist count query failed (code=${(failed as { code?: string }).code ?? "unknown"})`),
        { tags: { scope: "api/waitlist", reason: "supabase-count-failed" } },
      );
      return waitlistError(
        "Waitlist counts are temporarily unavailable",
        "store_unavailable",
        503,
      );
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
  const refusal = rateLimit(ip, RATE_LIMIT_POST);
  if (refusal) return refusal;

  const parsed = await parseJsonBody<{ email?: string; platform?: string; earlyBeta?: boolean }>(req);
  if (!parsed.ok) return parsed.response;

  const { email, platform, earlyBeta } = parsed.data;

  // Email validation
  if (!email || typeof email !== "string") {
    return waitlistError("Email is required", "invalid_email", 400);
  }
  const trimmedEmail = email.trim().toLowerCase();
  if (!isValidEmail(trimmedEmail)) {
    return waitlistError("Invalid email format", "invalid_email", 400);
  }

  // Platform validation — whitelist
  if (!platform || typeof platform !== "string") {
    return waitlistError("Platform is required", "invalid_platform", 400);
  }
  if (!VALID_PLATFORMS.has(platform)) {
    return waitlistError(`Platform must be one of: ${[...VALID_PLATFORMS].join(", ")}`, "invalid_platform", 400);
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
      // Anything else (missing grants, table absent, network) is an
      // infrastructure fault, not a user error — say so, make it retryable, and
      // surface it instead of swallowing the signup behind a generic 500.
      //
      // PII: the Postgres error message can echo the offending row (i.e. the
      // email), so only the error *code* and the platform are reported, and the
      // whole payload still goes through the scrubber (src/lib/sentry-pii.ts).
      captureExceptionScrubbed(
        new Error(`waitlist insert failed (code=${error.code ?? "unknown"})`),
        {
          tags: { scope: "api/waitlist", reason: "supabase-insert-failed" },
          extra: { code: error.code ?? null, platform },
        },
      );
      return waitlistError(
        "Could not save your spot right now — please try again in a moment.",
        "store_unavailable",
        503,
        { "Retry-After": "30" },
      );
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
