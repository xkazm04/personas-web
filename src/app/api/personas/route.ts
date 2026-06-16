/**
 * GET /api/personas — browse the public persona gallery.
 *   ?sort=popular|recent   (default popular — by install_count)
 *   ?category=<cat>        (optional filter)
 *   ?limit=<n>             (default 60, max 100)
 * Returns public projections only (never the bundle or install_id).
 */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import {
  type SharedPersonaRow,
  toPublic,
  hasSupabase,
  getSupabaseClient,
  readAll,
} from "./storage";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const sort = sp.get("sort") === "recent" ? "recent" : "popular";
  const category = sp.get("category");
  const limit = Math.min(Math.max(Number(sp.get("limit")) || 60, 1), 100);

  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    let q = sb
      .from("shared_personas")
      .select("slug,name,description,icon,color,category,publisher,install_count,created_at")
      .eq("status", "public");
    if (category) q = q.eq("category", category);
    q =
      sort === "recent"
        ? q.order("created_at", { ascending: false })
        : q.order("install_count", { ascending: false }).order("created_at", { ascending: false });
    const { data, error } = await q.limit(limit);
    if (error) return NextResponse.json({ error: "browse failed" }, { status: 500 });
    return NextResponse.json({ entries: (data ?? []).map((r) => toPublic(r as SharedPersonaRow)) });
  }

  const all = await readAll();
  let rows = all.entries.filter((e) => e.status === "public");
  if (category) rows = rows.filter((e) => e.category === category);
  rows.sort((a, b) =>
    sort === "recent"
      ? b.created_at.localeCompare(a.created_at)
      : b.install_count - a.install_count || b.created_at.localeCompare(a.created_at),
  );
  return NextResponse.json({ entries: rows.slice(0, limit).map(toPublic) });
}
