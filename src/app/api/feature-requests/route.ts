// ── PII Policy ──────────────────────────────────────────────────────────
// This route collects: feature request text (user-submitted content).
// IP addresses are used ONLY for transient in-memory rate limiting and
// are NEVER persisted to the database or filesystem.
// No email, no cookies, no fingerprints are collected by this endpoint.
// ────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/server/env";
import { updateJsonFile } from "@/lib/server/json-file-store";
import { getClientIp, jsonError, parseJsonBody } from "@/lib/server/request";
import { rateLimitGuard } from "@/lib/server/rate-limit";

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per-IP, resets on deploy)
// ---------------------------------------------------------------------------

/** Returns the 429 to send, or `null` to serve the request. */
function rateLimit(ip: string): NextResponse | null {
  return rateLimitGuard({
    namespace: "feature-requests",
    key: ip,
    limit: 10,
    windowMs: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Supabase helpers (production)
// ---------------------------------------------------------------------------

function hasSupabase(): boolean {
  return hasSupabaseEnv();
}

async function getSupabaseClient() {
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}

// ---------------------------------------------------------------------------
// Filesystem fallback (local dev only)
// ---------------------------------------------------------------------------

const REQUESTS_FILE = "feature-requests.json";

interface FeatureRequestEntry {
  text: string;
  created_at: string;
}

interface RequestsData {
  entries: FeatureRequestEntry[];
}

// ---------------------------------------------------------------------------
// POST — save a feature request
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const refusal = rateLimit(ip);
  if (refusal) return refusal;

  const parsed = await parseJsonBody<{ text?: string }>(req, {
    maxBytes: 4 * 1024,
  });
  if (!parsed.ok) return parsed.response;

  const text = typeof parsed.data.text === "string" ? parsed.data.text.trim() : "";
  if (!text || text.length > 1000) {
    return jsonError("Text is required (max 1000 chars)", 400);
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
  await updateJsonFile<RequestsData>(
    "feature-requests",
    REQUESTS_FILE,
    { entries: [] },
    (data) => ({
      entries: [
        ...data.entries,
        {
          text,
          created_at: new Date().toISOString(),
        },
      ],
    }),
  );

  return NextResponse.json({ saved: true });
}
