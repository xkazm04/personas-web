import { NextResponse } from "next/server";

function hasSupabase(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function GET() {
  if (!hasSupabase()) {
    return NextResponse.json({ items: [], source: "none" });
  }

  const { getSupabase } = await import("@/lib/supabase");
  const sb = getSupabase();

  const { data, error } = await sb
    .from("roadmap_items")
    .select("id, name, description, status, priority, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[roadmap] Supabase error:", error.message);
    return NextResponse.json({ items: [], source: "error" }, { status: 502 });
  }

  return NextResponse.json({ items: data ?? [], source: "supabase" });
}
