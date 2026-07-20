/**
 * ── PII Policy ──────────────────────────────────────────────────────
 * This route collects:
 * - voter_id: a client-generated anonymous identifier (not PII)
 * IP addresses are used ONLY for transient in-memory rate limiting and
 * are NEVER persisted to the database or filesystem.
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidVoterId } from "@/lib/validation";
import { withWriteLock } from "@/lib/fileLock";
import { getClientIp, parseJsonBody } from "@/lib/server/request";
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
      // `email` is deliberately NOT selected: it must never leave the server
      // keyed off a client-suppliable voterId (which also travels in the GET
      // query string and lands in logs). Email is write-only here.
      sb.from("feature_votes").select("feature_id, voter_id"),
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

    for (const row of votesResult.data ?? []) {
      counts[row.feature_id] = (counts[row.feature_id] || 0) + 1;
      if (row.voter_id === voterId) {
        userVotes.push(row.feature_id);
      }
    }

    const shipped: ShippedEntry[] = shippedResult.data ?? [];

    return NextResponse.json({ counts, userVotes, shipped });
  }

  // Filesystem fallback
  const [data, shippedData] = await Promise.all([readVotes(), readShipped()]);
  const counts: Record<string, number> = {};
  const userVotes: string[] = [];

  for (const entry of data.entries) {
    counts[entry.feature_id] = (counts[entry.feature_id] || 0) + 1;
    if (entry.voter_id === voterId) {
      userVotes.push(entry.feature_id);
    }
  }

  return NextResponse.json({
    counts,
    userVotes,
    shipped: shippedData.entries,
  });
}

/* ── POST — toggle a vote for a feature ──────────────────────────── */

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = await parseJsonBody<{
    featureId?: string;
    voterId?: string;
  }>(req, { maxBytes: 10 * 1024 });
  if (!parsed.ok) return parsed.response;

  const { featureId, voterId } = parsed.data;

  if (!featureId || !ALLOWED_FEATURES.has(featureId)) {
    return NextResponse.json({ error: "Invalid feature ID" }, { status: 400 });
  }

  if (!isValidVoterId(voterId)) {
    return NextResponse.json(
      { error: "Valid voter ID is required" },
      { status: 400 },
    );
  }

  // --- Supabase path (production) ---
  if (hasSupabase()) {
    const sb = await getSupabaseClient();

    const { data: existing, error: lookupError } = await sb
      .from("feature_votes")
      .select("id")
      .eq("feature_id", featureId)
      .eq("voter_id", voterId)
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json(
        { error: "Failed to record vote" },
        { status: 500 },
      );
    }

    if (existing) {
      await sb
        .from("feature_votes")
        .delete()
        .eq("feature_id", featureId)
        .eq("voter_id", voterId);

      return NextResponse.json({ action: "removed" });
    }

    // Upsert with ignoreDuplicates (ON CONFLICT DO NOTHING). The
    // UNIQUE(feature_id, voter_id) constraint already guarantees one row per
    // voter; making the insert idempotent means two truly-concurrent requests
    // can't 500 the loser of the race — the duplicate is simply skipped.
    const { error } = await sb.from("feature_votes").upsert(
      {
        feature_id: featureId,
        voter_id: voterId,
      },
      { onConflict: "feature_id,voter_id", ignoreDuplicates: true },
    );

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
      data.entries.splice(existingIdx, 1);
      await writeVotes(data);
      return NextResponse.json({ action: "removed" });
    }

    data.entries.push({
      feature_id: featureId,
      voter_id: voterId,
      created_at: new Date().toISOString(),
    });

    await writeVotes(data);
    return NextResponse.json({ action: "added" });
  });
}
