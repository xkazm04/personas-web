/**
 * WAITLIST API - SERVERLESS LIMITATIONS & PRODUCTION WARNING
 *
 * 1. DEVELOPMENT ONLY: This implementation uses the local filesystem (.data/waitlist.json)
 *    for storage. On serverless platforms (Vercel, AWS Lambda), the filesystem is ephemeral.
 *    Data will be LOST on every cold start or redeploy.
 *
 * 2. DATABASE REQUIRED: Production deployment requires a persistent database backend.
 *    Supabase (PostgreSQL) is already integrated into the project's Auth context and
 *    is the recommended path for production waitlist storage.
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
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { isValidEmail } from "@/lib/validation";
import { withWriteLock } from "@/lib/fileLock";

const DATA_DIR = path.join(process.cwd(), ".data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");

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

const rateBuckets = new Map<string, number[]>();

function rateLimit(ip: string, limit: number): boolean {
  const now = Date.now();
  let timestamps = rateBuckets.get(ip);
  if (!timestamps) {
    timestamps = [];
    rateBuckets.set(ip, timestamps);
  }
  // Prune old entries
  const filtered = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  rateBuckets.set(ip, filtered);

  if (filtered.length >= limit) return false;
  filtered.push(now);
  return true;
}

// Periodic cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of rateBuckets) {
      const filtered = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
      if (filtered.length === 0) {
        rateBuckets.delete(ip);
      } else {
        rateBuckets.set(ip, filtered);
      }
    }
  }, 5 * 60_000).unref();
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// --- O(1) indices (populated on first read, kept in sync on writes) ---

let dedupIndex: Set<string> | null = null;
let platformCounts: Map<string, number> | null = null;

function dedupKey(email: string, platform: string): string {
  return `${email}:${platform}`;
}

async function readWaitlist(): Promise<WaitlistData> {
  try {
    const raw = await fs.readFile(WAITLIST_FILE, "utf-8");
    const data = JSON.parse(raw) as WaitlistData;
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
  } catch {
    if (!dedupIndex) dedupIndex = new Set();
    if (!platformCounts) platformCounts = new Map();
    return { entries: [] };
  }
}

async function writeWaitlist(data: WaitlistData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Atomic write: write to a temp file then rename, so readers never see
  // a partially-written file and a crash mid-write won't corrupt the data.
  const tmpFile = path.join(DATA_DIR, `.waitlist-${randomBytes(6).toString("hex")}.tmp`);
  await fs.writeFile(tmpFile, JSON.stringify(data, null, 2));
  await fs.rename(tmpFile, WAITLIST_FILE);
}

// GET — return counts per platform
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(ip, RATE_LIMIT_GET)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
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
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: { email?: string; platform?: string; earlyBeta?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, platform, earlyBeta } = body;

  // Email validation
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  const trimmedEmail = email.trim().toLowerCase();
  if (!isValidEmail(trimmedEmail)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  // Platform validation — whitelist
  if (!platform || typeof platform !== "string") {
    return NextResponse.json({ error: "Platform is required" }, { status: 400 });
  }
  if (!VALID_PLATFORMS.has(platform)) {
    return NextResponse.json(
      { error: `Platform must be one of: ${[...VALID_PLATFORMS].join(", ")}` },
      { status: 400 }
    );
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
