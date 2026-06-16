/**
 * GET  /api/personas/<slug>  — fetch a shared persona (public meta + bundle).
 *                              Used by the /p/<slug> page and the desktop
 *                              "Open in Personas" deep-link import.
 * POST /api/personas/<slug>  — record an install (atomic install_count++).
 *                              Called by the desktop once an import succeeds —
 *                              this is the social-proof / K-factor counter.
 */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/server/request";
import { isRateLimited as isSharedRateLimited } from "@/lib/server/rate-limit";
import { withWriteLock } from "@/lib/fileLock";
import {
  type SharedPersonaDetail,
  toPublic,
  getBySlug,
  hasSupabase,
  getSupabaseClient,
  readAll,
  writeAll,
} from "../storage";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await getBySlug(slug);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  const detail: SharedPersonaDetail = { ...toPublic(row), bundle: row.bundle };
  return NextResponse.json(detail);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ip = getClientIp(req);
  if (isSharedRateLimited({ namespace: "persona-install", key: ip, limit: 30, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    const { data, error } = await sb.rpc("increment_shared_persona_installs", { p_slug: slug });
    if (error) return NextResponse.json({ error: "increment failed" }, { status: 500 });
    if (data == null) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ installCount: data });
  }

  let count = 0;
  let found = false;
  await withWriteLock("shared-personas", async () => {
    const all = await readAll();
    const row = all.entries.find((e) => e.slug === slug && e.status === "public");
    if (row) {
      row.install_count += 1;
      row.updated_at = new Date().toISOString();
      count = row.install_count;
      found = true;
      await writeAll(all);
    }
  });
  if (!found) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ installCount: count });
}
