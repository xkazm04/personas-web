/**
 * ── PII Policy ──────────────────────────────────────────────────────
 * This route stores user-submitted comment text + a client-chosen
 * anonymous author handle. IP addresses are used ONLY for transient
 * in-memory rate limiting and are NEVER persisted.
 */

import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/server/env";
import { ALLOWED_FEATURES } from "@/lib/feature-ids";
import { updateJsonFile, readJsonFile } from "@/lib/server/json-file-store";
import { getClientIp, parseJsonBody } from "@/lib/server/request";
import { rateLimitGuard } from "@/lib/server/rate-limit";

// Aligned to the UI's 280-char comment cap (CommentInput's `maxLength={280}`),
// plus a small tolerance margin so legitimate edge cases (IME composition,
// paste normalization differences between client and server) aren't rejected.
const MAX_TEXT_LEN = 300;
const MAX_AUTHOR_LEN = 64;
// The GET serves the newest MAX_COMMENTS, oldest first, so its cost no longer
// grows with the table (and stays under PostgREST's 1000-row cap).
const MAX_COMMENTS = 500;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface CommentRow {
  id: string;
  featureId: string;
  parentId: string | null;
  author: string;
  text: string;
  timestamp: number;
}

interface FSComments {
  entries: CommentRow[];
}

function hasSupabase(): boolean {
  return hasSupabaseEnv();
}

/** The service-role client, or the 503 `store_unavailable` refusal (src/lib/supabase-admin.ts). */
async function getSupabaseClient() {
  const { getSupabaseAdminOrRefusal } = await import("@/lib/supabase-admin");
  return getSupabaseAdminOrRefusal();
}

/** Returns the 429 to send, or `null` to serve the request. */
function rateLimit(ip: string): NextResponse | null {
  return rateLimitGuard({
    namespace: "feature-comments",
    key: ip,
    limit: 30,
    windowMs: 60_000,
  });
}

/** The GET's budget, in a bucket of its own so reads never spend the POST's. */
function rateLimitRead(ip: string): NextResponse | null {
  return rateLimitGuard({
    namespace: "feature-comments-read",
    key: ip,
    limit: 60,
    windowMs: 60_000,
  });
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_TEXT_LEN) return null;
  return trimmed;
}

function normalizeAuthor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_AUTHOR_LEN) return null;
  return trimmed;
}

/* ── GET — the newest comments across features, oldest first ────────── */

export async function GET(req: NextRequest) {
  const refusal = rateLimitRead(getClientIp(req));
  if (refusal) return refusal;

  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    if (sb instanceof Response) return sb;
    const { data, error } = await sb
      .from("feature_comments")
      .select("id, feature_id, parent_id, author, text, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_COMMENTS);

    if (error) {
      return NextResponse.json(
        { error: "Failed to read comments" },
        { status: 500 },
      );
    }

    const comments: CommentRow[] = (data ?? []).reverse().map((row) => ({
      id: row.id,
      featureId: row.feature_id,
      parentId: row.parent_id,
      author: row.author,
      text: row.text,
      timestamp: new Date(row.created_at).getTime(),
    }));

    return NextResponse.json({ comments });
  }

  const data = await readJsonFile<FSComments>("comments.json", { entries: [] });
  return NextResponse.json({ comments: data.entries.slice(-MAX_COMMENTS) });
}

/* ── POST — add a comment ───────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const refusal = rateLimit(ip);
  if (refusal) return refusal;

  const parsed = await parseJsonBody<{
    featureId?: string;
    parentId?: string | null;
    text?: string;
    author?: string;
  }>(req, { maxBytes: 8 * 1024 });
  if (!parsed.ok) return parsed.response;

  const { featureId, parentId, text, author } = parsed.data;

  if (typeof featureId !== "string" || !ALLOWED_FEATURES.has(featureId)) {
    return NextResponse.json({ error: "Invalid feature ID" }, { status: 400 });
  }
  const cleanText = normalizeText(text);
  if (!cleanText) {
    return NextResponse.json({ error: "Invalid comment text" }, { status: 400 });
  }
  const cleanAuthor = normalizeAuthor(author);
  if (!cleanAuthor) {
    return NextResponse.json({ error: "Invalid author" }, { status: 400 });
  }
  const normalizedParent =
    typeof parentId === "string" && UUID_RE.test(parentId)
      ? parentId
      : parentId == null
        ? null
        : undefined;
  if (normalizedParent === undefined) {
    return NextResponse.json({ error: "Invalid parent ID" }, { status: 400 });
  }

  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    if (sb instanceof Response) return sb;
    // The thread model is one level deep. Reject a reply whose parent is itself
    // a reply (or doesn't exist), so stored comments can never exceed the
    // renderable depth and vanish. UUID shape alone isn't enough.
    if (normalizedParent !== null) {
      const { data: parent, error: parentErr } = await sb
        .from("feature_comments")
        .select("id, parent_id, feature_id")
        .eq("id", normalizedParent)
        .maybeSingle();
      if (parentErr) {
        return NextResponse.json({ error: "Failed to save comment" }, { status: 500 });
      }
      if (!parent || parent.parent_id !== null || parent.feature_id !== featureId) {
        return NextResponse.json({ error: "Invalid parent ID" }, { status: 400 });
      }
    }
    const { data, error } = await sb
      .from("feature_comments")
      .insert({
        feature_id: featureId,
        parent_id: normalizedParent,
        author: cleanAuthor,
        text: cleanText,
      })
      .select("id, created_at")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to save comment" },
        { status: 500 },
      );
    }

    const row: CommentRow = {
      id: data.id,
      featureId,
      parentId: normalizedParent,
      author: cleanAuthor,
      text: cleanText,
      timestamp: new Date(data.created_at).getTime(),
    };
    return NextResponse.json({ comment: row });
  }

  // FS fallback
  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const row: CommentRow = {
    id,
    featureId,
    parentId: normalizedParent,
    author: cleanAuthor,
    text: cleanText,
    timestamp: Date.now(),
  };
  await updateJsonFile<FSComments>(
    "feature-comments",
    "comments.json",
    { entries: [] },
    (current) => ({ entries: [...current.entries, row] }),
  );
  return NextResponse.json({ comment: row });
}
