// ── PII Policy ──────────────────────────────────────────────────────────
// This route collects: feature request text (user-submitted content).
// IP addresses are used ONLY for transient in-memory rate limiting and
// are NEVER persisted to the database or filesystem.
// No email, no cookies, no fingerprints are collected by this endpoint.
// ────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per-IP, resets on deploy)
// ---------------------------------------------------------------------------

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;

const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

// ---------------------------------------------------------------------------
// Supabase helpers (production)
// ---------------------------------------------------------------------------

function hasSupabase(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function getSupabaseClient() {
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}

// ---------------------------------------------------------------------------
// Filesystem fallback (local dev only)
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), ".data");
const REQUESTS_FILE = path.join(DATA_DIR, "feature-requests.json");

interface FeatureRequestEntry {
  text: string;
  created_at: string;
}

interface RequestsData {
  entries: FeatureRequestEntry[];
}

async function readRequests(): Promise<RequestsData> {
  try {
    const raw = await fs.readFile(REQUESTS_FILE, "utf-8");
    return JSON.parse(raw) as RequestsData;
  } catch {
    return { entries: [] };
  }
}

async function writeRequests(data: RequestsData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(REQUESTS_FILE, JSON.stringify(data, null, 2));
}

// ---------------------------------------------------------------------------
// POST — save a feature request
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 1000) {
    return NextResponse.json(
      { error: "Text is required (max 1000 chars)" },
      { status: 400 },
    );
  }

  // --- Supabase path (production) ---
  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    const { error } = await sb.from("feature_requests").insert({
      text,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to save request" },
        { status: 500 },
      );
    }

    return NextResponse.json({ saved: true });
  }

  // --- Filesystem fallback ---
  const data = await readRequests();
  data.entries.push({
    text,
    created_at: new Date().toISOString(),
  });
  await writeRequests(data);

  return NextResponse.json({ saved: true });
}
