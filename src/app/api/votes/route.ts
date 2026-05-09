/**
 * ── PII Policy ──────────────────────────────────────────────────────
 * This route collects:
 * - voter_id: a client-generated anonymous identifier (not PII)
 * - email (optional): provided voluntarily for notifications
 * IP addresses are used ONLY for transient in-memory rate limiting and
 * are NEVER persisted to the database or filesystem.
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/validation";
import { withWriteLock } from "@/lib/fileLock";
import { isRateLimited } from "./rate-limit";
import {
  ALLOWED_FEATURES,
  hasSupabase,
  getSupabaseClient,
  readVotes,
  writeVotes,
  readShipped,
  type ShippedEntry,
} from "./storage";

/* ── GET — vote counts per feature + user's votes + shipped features ── */

export async function GET(req: NextRequest) {
  const voterId = req.nextUrl.searchParams.get("voterId") ?? "";

  if (hasSupabase()) {
    const sb = await getSupabaseClient();

    const [votesResult, shippedResult] = await Promise.all([
      sb.from("feature_votes").select("feature_id, voter_id, email"),
      sb
        .from("shipped_features")
        .select("feature_id, changelog, link, shipped_at"),
    ]);

    if (votesResult.error) {
      return NextResponse.json(
        { error: "Failed to read votes" },
        { status: 500 },
      );
    }

    // Vote counts reflect real engagement only. The client-side features
    // array in FeatureVoting.tsx holds seed display values shown until the
    // API responds, added on top of the real counts from this endpoint.
    const counts: Record<string, number> = {};
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
  const counts: Record<string, number> = {};
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

/* ── POST — toggle a vote for a feature ──────────────────────────── */

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
    return NextResponse.json({ error: "Invalid feature ID" }, { status: 400 });
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

    const { data: existing } = await sb
      .from("feature_votes")
      .select("id")
      .eq("feature_id", featureId)
      .eq("voter_id", voterId)
      .limit(1)
      .single();

    if (existing) {
      if (normalizedEmail) {
        await sb
          .from("feature_votes")
          .update({ email: normalizedEmail })
          .eq("feature_id", featureId)
          .eq("voter_id", voterId);
        return NextResponse.json({ action: "email_saved" });
      }
      await sb
        .from("feature_votes")
        .delete()
        .eq("feature_id", featureId)
        .eq("voter_id", voterId);

      return NextResponse.json({ action: "removed" });
    }

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

  // --- Filesystem fallback (serialize to prevent TOCTOU) ---
  return withWriteLock("votes", async () => {
    const data = await readVotes();

    const existingIdx = data.entries.findIndex(
      (e) => e.feature_id === featureId && e.voter_id === voterId,
    );

    if (existingIdx !== -1) {
      if (normalizedEmail) {
        data.entries[existingIdx].email = normalizedEmail;
        await writeVotes(data);
        return NextResponse.json({ action: "email_saved" });
      }
      data.entries.splice(existingIdx, 1);
      await writeVotes(data);
      return NextResponse.json({ action: "removed" });
    }

    data.entries.push({
      feature_id: featureId,
      voter_id: voterId,
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      created_at: new Date().toISOString(),
    });

    await writeVotes(data);
    return NextResponse.json({ action: "added" });
  });
}
