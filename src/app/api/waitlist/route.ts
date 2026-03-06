import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

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

/** Basic RFC 5322 email pattern — intentionally simple to avoid ReDoS */
const EMAIL_RE = /^[^\s@<>'"`;(){}[\]\\]+@[^\s@<>'"`;(){}[\]\\]+\.[a-zA-Z]{2,}$/;
const MAX_EMAIL_LENGTH = 254;

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

async function readWaitlist(): Promise<WaitlistData> {
  try {
    const raw = await fs.readFile(WAITLIST_FILE, "utf-8");
    return JSON.parse(raw) as WaitlistData;
  } catch {
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

// --- In-process mutex for read-modify-write serialization ---
// Chains all mutating operations so concurrent POSTs are serialized.
let writeLock = Promise.resolve();

function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeLock.then(fn, fn);
  // Update the chain so subsequent callers wait for this one.
  // Swallow errors to prevent a failed request from breaking the chain.
  writeLock = next.then(() => {}, () => {});
  return next;
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

  const data = await readWaitlist();
  const counts: Record<string, number> = {};
  for (const entry of data.entries) {
    counts[entry.platform] = (counts[entry.platform] || 0) + 1;
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
  if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
    return NextResponse.json({ error: "Email is too long" }, { status: 400 });
  }
  if (!EMAIL_RE.test(trimmedEmail)) {
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
  const result = await withWriteLock(async () => {
    const data = await readWaitlist();

    // Check for duplicate
    const exists = data.entries.some(
      (e) => e.email === trimmedEmail && e.platform === platform
    );
    if (exists) {
      return { duplicate: true, count: 0 } as const;
    }

    data.entries.push({
      email: trimmedEmail,
      platform,
      earlyBeta: !!earlyBeta,
      createdAt: new Date().toISOString(),
    });

    await writeWaitlist(data);

    const count = data.entries.filter((e) => e.platform === platform).length;
    return { duplicate: false, count } as const;
  });

  if (result.duplicate) {
    return NextResponse.json({ message: "Already on the waitlist" });
  }

  return NextResponse.json({ message: "Added to waitlist", count: result.count });
}
