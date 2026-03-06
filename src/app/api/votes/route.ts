import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isValidEmail } from "@/lib/validation";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const ALLOWED_FEATURES = new Set(["macos", "i18n", "dashboard", "enterprise"]);

// Seed counts shown until real votes accumulate
const SEED_COUNTS: Record<string, number> = {
  macos: 342,
  i18n: 189,
  dashboard: 276,
  enterprise: 214,
};

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per-IP, resets on deploy)
// ---------------------------------------------------------------------------

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

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
const VOTES_FILE = path.join(DATA_DIR, "votes.json");

interface VoteEntry {
  feature_id: string;
  voter_id: string;
  email?: string;
  created_at: string;
}

interface VotesData {
  entries: VoteEntry[];
}

async function readVotes(): Promise<VotesData> {
  try {
    const raw = await fs.readFile(VOTES_FILE, "utf-8");
    return JSON.parse(raw) as VotesData;
  } catch {
    return { entries: [] };
  }
}

async function writeVotes(data: VotesData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(VOTES_FILE, JSON.stringify(data, null, 2));
}

// ---------------------------------------------------------------------------
// Shipped features registry (filesystem)
// ---------------------------------------------------------------------------

const SHIPPED_FILE = path.join(DATA_DIR, "shipped.json");

export interface ShippedEntry {
  feature_id: string;
  changelog: string;
  link: string;
  shipped_at: string;
}

interface ShippedData {
  entries: ShippedEntry[];
}

async function readShipped(): Promise<ShippedData> {
  try {
    const raw = await fs.readFile(SHIPPED_FILE, "utf-8");
    return JSON.parse(raw) as ShippedData;
  } catch {
    return { entries: [] };
  }
}

// ---------------------------------------------------------------------------
// GET — return vote counts per feature + user's votes + shipped features
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const voterId = req.nextUrl.searchParams.get("voterId") ?? "";

  if (hasSupabase()) {
    const sb = await getSupabaseClient();

    const [votesResult, shippedResult] = await Promise.all([
      sb.from("feature_votes").select("feature_id, voter_id, email"),
      sb.from("shipped_features").select("feature_id, changelog, link, shipped_at"),
    ]);

    if (votesResult.error) {
      return NextResponse.json(
        { error: "Failed to read votes" },
        { status: 500 },
      );
    }

    const counts: Record<string, number> = { ...SEED_COUNTS };
    const userVotes: string[] = [];
    let userEmail: string | null = null;

    for (const row of votesResult.data ?? []) {
      counts[row.feature_id] = (counts[row.feature_id] || 0) + 1;
      if (row.voter_id === voterId) {
        userVotes.push(row.feature_id);
        if (row.email) userEmail = row.email;
      }
    }

    const shipped: ShippedEntry[] = shippedResult.data ?? [];

    return NextResponse.json({ counts, userVotes, userEmail, shipped });
  }

  // Filesystem fallback
  const [data, shippedData] = await Promise.all([readVotes(), readShipped()]);
  const counts: Record<string, number> = { ...SEED_COUNTS };
  const userVotes: string[] = [];
  let userEmail: string | null = null;

  for (const entry of data.entries) {
    counts[entry.feature_id] = (counts[entry.feature_id] || 0) + 1;
    if (entry.voter_id === voterId) {
      userVotes.push(entry.feature_id);
      if (entry.email) userEmail = entry.email;
    }
  }

  return NextResponse.json({
    counts,
    userVotes,
    userEmail,
    shipped: shippedData.entries,
  });
}

// ---------------------------------------------------------------------------
// POST — toggle a vote for a feature
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { featureId?: string; voterId?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { featureId, voterId, email } = body;
  const normalizedEmail =
    email && typeof email === "string" && isValidEmail(email)
      ? email.trim().toLowerCase()
      : undefined;

  if (!featureId || !ALLOWED_FEATURES.has(featureId)) {
    return NextResponse.json(
      { error: "Invalid feature ID" },
      { status: 400 },
    );
  }

  if (!voterId || typeof voterId !== "string" || voterId.length < 8) {
    return NextResponse.json(
      { error: "Valid voter ID is required" },
      { status: 400 },
    );
  }

  // --- Supabase path (production) ---
  if (hasSupabase()) {
    const sb = await getSupabaseClient();

    // Check if already voted
    const { data: existing } = await sb
      .from("feature_votes")
      .select("id")
      .eq("feature_id", featureId)
      .eq("voter_id", voterId)
      .limit(1)
      .single();

    if (existing) {
      // If email provided, update it on existing vote instead of removing
      if (normalizedEmail) {
        await sb
          .from("feature_votes")
          .update({ email: normalizedEmail })
          .eq("feature_id", featureId)
          .eq("voter_id", voterId);
        return NextResponse.json({ action: "email_saved" });
      }
      // Remove vote (toggle off)
      await sb
        .from("feature_votes")
        .delete()
        .eq("feature_id", featureId)
        .eq("voter_id", voterId);

      return NextResponse.json({ action: "removed" });
    }

    // Add vote
    const { error } = await sb.from("feature_votes").insert({
      feature_id: featureId,
      voter_id: voterId,
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to record vote" },
        { status: 500 },
      );
    }

    return NextResponse.json({ action: "added" });
  }

  // --- Filesystem fallback ---
  const data = await readVotes();

  const existingIdx = data.entries.findIndex(
    (e) => e.feature_id === featureId && e.voter_id === voterId,
  );

  if (existingIdx !== -1) {
    // If email provided, update it on existing vote instead of removing
    if (normalizedEmail) {
      data.entries[existingIdx].email = normalizedEmail;
      await writeVotes(data);
      return NextResponse.json({ action: "email_saved" });
    }
    // Remove vote (toggle off)
    data.entries.splice(existingIdx, 1);
    await writeVotes(data);
    return NextResponse.json({ action: "removed" });
  }

  // Add vote
  data.entries.push({
    feature_id: featureId,
    voter_id: voterId,
    ...(normalizedEmail ? { email: normalizedEmail } : {}),
    created_at: new Date().toISOString(),
  });

  await writeVotes(data);
  return NextResponse.json({ action: "added" });
}
