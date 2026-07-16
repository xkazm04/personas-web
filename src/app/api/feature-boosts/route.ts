/**
 * ── PII Policy ──────────────────────────────────────────────────────
 * This route stores an anonymous voter_id and a Ko-fi tier weight per
 * boost. IP addresses are used ONLY for transient in-memory rate
 * limiting and are NEVER persisted.
 *
 * ── Integrity note ──────────────────────────────────────────────────
 * A boost is recorded when the user clicks a Ko-fi tier — there is no
 * server-side proof a donation actually completed (that would require a
 * signed Ko-fi webhook, which doesn't exist yet). To bound abuse until
 * then we (1) pin weight/tier_value to the real tier set so a crafted
 * request can't submit an arbitrary amount, and (2) store ONE boost row
 * per (feature_id, voter_id) via upsert so a voter can't stack a feature's
 * total without limit. Re-boosting replaces the prior tier.
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidVoterId } from "@/lib/validation";
import { hasSupabaseEnv } from "@/lib/server/env";
import { readJsonFile, updateJsonFile } from "@/lib/server/json-file-store";
import { getClientIp, parseJsonBody } from "@/lib/server/request";
import { isRateLimited as isSharedRateLimited } from "@/lib/server/rate-limit";

const ALLOWED_FEATURES = new Set(["macos", "i18n", "dashboard", "enterprise"]);

// Allowed Ko-fi boost tiers. MUST stay in sync with BOOST_TIERS in
// src/components/sections/feature-voting/data.ts. The server pins to this
// exact set so a crafted request can't submit an arbitrary weight (e.g.
// 1000) and inflate a feature's boost total far beyond any real tier.
const ALLOWED_TIERS = new Set([5, 15, 25]);

interface BoostRow {
  feature_id: string;
  voter_id: string;
  weight: number;
  tier_value: number;
  created_at: string;
}

interface FSBoosts {
  entries: BoostRow[];
}

function hasSupabase(): boolean {
  return hasSupabaseEnv();
}

async function getSupabaseClient() {
  const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
  return getSupabaseAdmin();
}

function isRateLimited(ip: string): boolean {
  return isSharedRateLimited({
    namespace: "feature-boosts",
    key: ip,
    limit: 30,
    windowMs: 60_000,
  });
}

function totalsFromRows(rows: Array<{ feature_id: string; weight: number }>) {
  const totals: Record<string, number> = {};
  for (const row of rows) {
    totals[row.feature_id] = (totals[row.feature_id] || 0) + row.weight;
  }
  return totals;
}

/* ── GET — boost totals per feature ─────────────────────────────────── */

export async function GET() {
  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    const { data, error } = await sb
      .from("feature_boosts")
      .select("feature_id, weight");

    if (error) {
      return NextResponse.json(
        { error: "Failed to read boosts" },
        { status: 500 },
      );
    }

    return NextResponse.json({ totals: totalsFromRows(data ?? []) });
  }

  const data = await readJsonFile<FSBoosts>("boosts.json", { entries: [] });
  return NextResponse.json({ totals: totalsFromRows(data.entries) });
}

/* ── POST — append a boost ──────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = await parseJsonBody<{
    featureId?: string;
    voterId?: string;
    weight?: number;
    tierValue?: number;
  }>(req, { maxBytes: 4 * 1024 });
  if (!parsed.ok) return parsed.response;

  const { featureId, voterId, weight, tierValue } = parsed.data;

  if (typeof featureId !== "string" || !ALLOWED_FEATURES.has(featureId)) {
    return NextResponse.json({ error: "Invalid feature ID" }, { status: 400 });
  }
  if (!isValidVoterId(voterId)) {
    return NextResponse.json(
      { error: "Valid voter ID is required" },
      { status: 400 },
    );
  }
  if (!Number.isInteger(tierValue) || !ALLOWED_TIERS.has(tierValue as number)) {
    return NextResponse.json({ error: "Invalid tier value" }, { status: 400 });
  }
  // The weight is derived from the chosen tier, not a free parameter. Pin it
  // to tierValue so the two can't diverge (e.g. tier $5 but weight 1000).
  if (weight !== tierValue) {
    return NextResponse.json({ error: "Invalid weight" }, { status: 400 });
  }

  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    // Upsert on (feature_id, voter_id): one boost per voter per feature.
    // Re-boosting replaces the prior tier instead of stacking a new row.
    const { error } = await sb.from("feature_boosts").upsert(
      {
        feature_id: featureId,
        voter_id: voterId,
        weight,
        tier_value: tierValue,
      },
      { onConflict: "feature_id,voter_id" },
    );

    if (error) {
      return NextResponse.json(
        { error: "Failed to save boost" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  }

  // FS fallback — replace this voter's existing boost for the feature, if any.
  await updateJsonFile<FSBoosts>(
    "feature-boosts",
    "boosts.json",
    { entries: [] },
    (current) => {
      const row: BoostRow = {
        feature_id: featureId,
        voter_id: voterId!,
        weight: weight as number,
        tier_value: tierValue as number,
        created_at: new Date().toISOString(),
      };
      const idx = current.entries.findIndex(
        (e) => e.feature_id === featureId && e.voter_id === voterId,
      );
      if (idx !== -1) {
        const entries = current.entries.slice();
        entries[idx] = row;
        return { entries };
      }
      return { entries: [...current.entries, row] };
    },
  );

  return NextResponse.json({ ok: true });
}
