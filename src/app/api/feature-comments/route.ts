/**
 * ── PII Policy ──────────────────────────────────────────────────────
 * This route stores user-submitted comment text + a client-chosen
 * anonymous author handle. IP addresses are used ONLY for transient
 * in-memory rate limiting and are NEVER persisted.
 */

import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/server/env";
import { updateJsonFile, readJsonFile } from "@/lib/server/json-file-store";
import { getClientIp, parseJsonBody } from "@/lib/server/request";
import { isRateLimited as isSharedRateLimited } from "@/lib/server/rate-limit";

const ALLOWED_FEATURES = new Set(["macos", "i18n", "dashboard", "enterprise"]);
const MAX_TEXT_LEN = 2000;
const MAX_AUTHOR_LEN = 64;
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

async function getSupabaseClient() {
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}

function isRateLimited(ip: string): boolean {
  return isSharedRateLimited({
    namespace: "feature-comments",
    key: ip,
    limit: 30,
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

/* ── GET — all comments across features ─────────────────────────────── */

export async function GET() {
  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    const { data, error } = await sb
      .from("feature_comments")
      .select("id, feature_id, parent_id, author, text, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to read comments" },
        { status: 500 },
      );
    }

    const comments: CommentRow[] = (data ?? []).map((row) => ({
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
  return NextResponse.json({ comments: data.entries });
}

/* ── POST — add a comment ───────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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
