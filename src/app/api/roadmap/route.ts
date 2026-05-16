import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/server/env";
import type { RoadmapResponse } from "./types";

export async function GET() {
  if (!hasSupabaseEnv()) {
    const body: RoadmapResponse = { items: [], source: "none" };
    return NextResponse.json(body);
  }

  const { getSupabase } = await import("@/lib/supabase");
  const sb = getSupabase();

  const { data, error } = await sb
    .from("roadmap_items")
    .select("id, name, description, status, priority, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[roadmap] Supabase error:", {
      code: error.code,
      message: error.message,
      hint: error.hint,
      details: error.details,
    });
    const body: RoadmapResponse = { items: [], source: "error" };
    return NextResponse.json(body, { status: 502 });
  }

  const body: RoadmapResponse = { items: data ?? [], source: "supabase" };
  return NextResponse.json(body);
}
