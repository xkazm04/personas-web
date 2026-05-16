/**
 * ── PII Policy ──────────────────────────────────────────────────────
 * This route stores an anonymous voter_id and a Ko-fi tier weight per
 * boost. IP addresses are used ONLY for transient in-memory rate
 * limiting and are NEVER persisted.
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidVoterId } from "@/lib/validation";
import { hasSupabaseEnv } from "@/lib/server/env";
import { readJsonFile, updateJsonFile } from "@/lib/server/json-file-store";
import { getClientIp, parseJsonBody } from "@/lib/server/request";
import { isRateLimited as isSharedRateLimited } from "@/lib/server/rate-limit";

const ALLOWED_FEATURES = new Set(["macos", "i18n", "dashboard", "enterprise"]);
const MAX_WEIGHT = 1000;
const MAX_TIER_VALUE = 1000;

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
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
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
  if (
    !Number.isInteger(weight) ||
    (weight as number) <= 0 ||
    (weight as number) > MAX_WEIGHT
  ) {
    return NextResponse.json({ error: "Invalid weight" }, { status: 400 });
  }
  if (
    !Number.isInteger(tierValue) ||
    (tierValue as number) <= 0 ||
    (tierValue as number) > MAX_TIER_VALUE
  ) {
    return NextResponse.json({ error: "Invalid tier value" }, { status: 400 });
  }

  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    const { error } = await sb.from("feature_boosts").insert({
      feature_id: featureId,
      voter_id: voterId,
      weight,
      tier_value: tierValue,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to save boost" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  }

  // FS fallback
  await updateJsonFile<FSBoosts>(
    "feature-boosts",
    "boosts.json",
    { entries: [] },
    (current) => ({
      entries: [
        ...current.entries,
        {
          feature_id: featureId,
          voter_id: voterId!,
          weight: weight as number,
          tier_value: tierValue as number,
          created_at: new Date().toISOString(),
        },
      ],
    }),
  );

  return NextResponse.json({ ok: true });
}
