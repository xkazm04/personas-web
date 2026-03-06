import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/validation";
import { DEVELOPMENT } from "@/lib/dev";

const ALLOWED_PLATFORMS = new Set(["Windows", "macOS", "Linux"]);

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per-IP, resets on deploy)
// ---------------------------------------------------------------------------

const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 5; // max requests per window

const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Opportunistically evict expired entries to avoid unbounded growth.
  for (const [key, value] of hits) {
    if (now > value.resetAt) {
      hits.delete(key);
    }
  }

  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

// ---------------------------------------------------------------------------
// Referral code generation
// ---------------------------------------------------------------------------

const REFERRAL_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generateReferralCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += REFERRAL_CHARS[Math.floor(Math.random() * REFERRAL_CHARS.length)];
  }
  return code;
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

async function getSupabaseClient() {
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}

// ---------------------------------------------------------------------------
// GET — return counts per platform
// ---------------------------------------------------------------------------

export async function GET() {
  if (DEVELOPMENT) {
    return NextResponse.json({
      counts: { Windows: 142, macOS: 89, Linux: 67 },
    });
  }

  const sb = await getSupabaseClient();
  const counts: Record<string, number> = {
    Windows: 0,
    macOS: 0,
    Linux: 0,
  };

  // Preferred path: DB-side grouped aggregation if the RPC exists.
  const grouped = await sb.rpc("waitlist_platform_counts");
  if (!grouped.error && Array.isArray(grouped.data)) {
    for (const row of grouped.data as Array<{ platform?: string; count?: number }>) {
      const platform = row.platform;
      if (platform && platform in counts) {
        counts[platform] = Number(row.count ?? 0);
      }
    }
    return NextResponse.json({ counts });
  }

  // Fallback path: single lightweight read and in-memory fold.
  const { data, error } = await sb.from("waitlist").select("platform");
  if (error) {
    return NextResponse.json({ error: "Failed to read waitlist" }, { status: 500 });
  }

  for (const row of data ?? []) {
    const platform = row.platform as string;
    if (platform in counts) {
      counts[platform] += 1;
    }
  }

  return NextResponse.json({ counts });
}

// ---------------------------------------------------------------------------
// POST — add an email to the waitlist
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: {
    email?: string;
    platform?: string;
    earlyBeta?: boolean;
    referredBy?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, platform, earlyBeta, referredBy } = body;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Valid email is required" },
      { status: 400 },
    );
  }

  if (
    !platform ||
    typeof platform !== "string" ||
    !ALLOWED_PLATFORMS.has(platform)
  ) {
    return NextResponse.json(
      { error: "Platform must be one of: Windows, macOS, Linux" },
      { status: 400 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const referralCode = generateReferralCode();

  if (DEVELOPMENT) {
    return NextResponse.json({
      message: "Added to waitlist",
      count: 143,
      referralCode,
      position: 143,
    });
  }

  const sb = await getSupabaseClient();
  const sanitizedReferredBy =
    referredBy && typeof referredBy === "string" && referredBy.length === 8
      ? referredBy
      : null;

  // Check for duplicate
  const { data: existing } = await sb
    .from("waitlist")
    .select("id, referral_code")
    .eq("email", normalizedEmail)
    .eq("platform", platform)
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json({
      message: "Already on the waitlist",
      referralCode: existing.referral_code,
    });
  }

  const { error } = await sb.from("waitlist").insert({
    email: normalizedEmail,
    platform,
    early_beta: !!earlyBeta,
    referral_code: referralCode,
    referred_by: sanitizedReferredBy,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 },
    );
  }

  // Get count for this platform
  const { count } = await sb
    .from("waitlist")
    .select("*", { count: "exact", head: true })
    .eq("platform", platform);

  return NextResponse.json({
    message: "Added to waitlist",
    count: count ?? 0,
    referralCode,
    position: count ?? 0,
  });
}
