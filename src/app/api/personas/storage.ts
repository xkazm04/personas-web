/**
 * Storage for the shared-persona gallery (the public "share your agent" loop).
 * Supabase in production (when env vars are present), filesystem fallback
 * otherwise — same dual-path shape as the feature-voting storage.
 *
 * A shared persona carries a `bundle`: the desktop's versioned `.persona.json`
 * export envelope, stored verbatim so "Open in Personas" / download round-trips
 * losslessly. The top-level name/description/icon/color/category are denormalized
 * for cheap browsing + the public preview page.
 */
import "server-only";
import { hasSupabaseEnv } from "@/lib/server/env";
import { readJsonFile, writeJsonFile } from "@/lib/server/json-file-store";

/* ── Types ─────────────────────────────────────────────────────────── */

/** The publish payload a desktop install POSTs to /api/personas/publish. */
export interface PublishPersonaInput {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  category?: string | null;
  /** A `.persona.json` export envelope: `{ version, persona: {...}, ... }`. */
  bundle: unknown;
  /** Optional pseudonymous publisher display name. */
  publisher?: string | null;
  /** Pseudonymous publisher install id (abuse attribution; never shown). */
  installId?: string | null;
}

export interface SharedPersonaRow {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  bundle: unknown;
  publisher: string | null;
  install_id: string | null;
  install_count: number;
  status: "public" | "flagged" | "removed";
  created_at: string;
  updated_at: string;
}

/** Public projection (never leaks install_id). */
export interface SharedPersonaPublic {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  publisher: string | null;
  installCount: number;
  createdAt: string;
}

export interface SharedPersonaDetail extends SharedPersonaPublic {
  bundle: unknown;
}

interface SharedPersonasData {
  entries: SharedPersonaRow[];
}

const FILE = "shared-personas.json";
const MAX_BUNDLE_BYTES = 256 * 1024; // matches the desktop's per-persona export ceiling
const INSTALL_ID_RE = /^[A-Za-z0-9._-]{6,128}$/;

/* ── Validation ────────────────────────────────────────────────────── */

export function isValidInstallId(value: unknown): value is string {
  return typeof value === "string" && INSTALL_ID_RE.test(value);
}

/**
 * Validate a publish payload. Returns the normalized fields or an error string.
 * Rejects oversized / malformed bundles so the gallery can't be used to store
 * arbitrary blobs.
 */
export function validatePublish(
  input: PublishPersonaInput,
): { ok: true; value: Required<Pick<PublishPersonaInput, "name" | "bundle">> & PublishPersonaInput } | { ok: false; error: string } {
  const name = (input.name ?? "").trim();
  if (name.length < 1 || name.length > 120) return { ok: false, error: "name must be 1–120 chars" };

  if (input.description != null && String(input.description).length > 2000)
    return { ok: false, error: "description too long" };
  if (input.publisher != null && String(input.publisher).length > 64)
    return { ok: false, error: "publisher too long" };

  // Bundle must be a `.persona.json` envelope with a persona that has the
  // fields the gallery + a re-import need.
  const b = input.bundle as { version?: unknown; persona?: { name?: unknown; system_prompt?: unknown } } | null;
  if (!b || typeof b !== "object") return { ok: false, error: "bundle must be an object" };
  if (typeof b.version !== "number") return { ok: false, error: "bundle.version is required" };
  if (!b.persona || typeof b.persona !== "object") return { ok: false, error: "bundle.persona is required" };
  if (typeof b.persona.name !== "string" || !b.persona.name.trim())
    return { ok: false, error: "bundle.persona.name is required" };
  if (typeof b.persona.system_prompt !== "string" || !b.persona.system_prompt.trim())
    return { ok: false, error: "bundle.persona.system_prompt is required" };

  let size = 0;
  try {
    size = Buffer.byteLength(JSON.stringify(input.bundle), "utf8");
  } catch {
    return { ok: false, error: "bundle is not serializable" };
  }
  if (size > MAX_BUNDLE_BYTES) return { ok: false, error: "bundle too large" };

  return { ok: true, value: { ...input, name, bundle: input.bundle } };
}

/* ── Slug ──────────────────────────────────────────────────────────── */

export function slugifyName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "agent";
}

/** A short random suffix that disambiguates same-named personas (no Date use). */
export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

/* ── Projections ───────────────────────────────────────────────────── */

export function toPublic(row: SharedPersonaRow): SharedPersonaPublic {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    icon: row.icon,
    color: row.color,
    category: row.category,
    publisher: row.publisher,
    installCount: row.install_count,
    createdAt: row.created_at,
  };
}

/* ── Supabase helpers ──────────────────────────────────────────────── */

export function hasSupabase(): boolean {
  return hasSupabaseEnv();
}

export async function getSupabaseClient() {
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}

/* ── Filesystem fallback ───────────────────────────────────────────── */

export async function readAll(): Promise<SharedPersonasData> {
  return readJsonFile<SharedPersonasData>(FILE, { entries: [] });
}

export async function writeAll(data: SharedPersonasData): Promise<void> {
  await writeJsonFile(FILE, data);
}

/* ── Unified lookup (Supabase or FS) ───────────────────────────────── */

/** Fetch one public shared persona by slug, from whichever backend is active. */
export async function getBySlug(slug: string): Promise<SharedPersonaRow | null> {
  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    const { data, error } = await sb
      .from("shared_personas")
      .select(
        "slug,name,description,icon,color,category,bundle,publisher,install_id,install_count,status,created_at,updated_at",
      )
      .eq("slug", slug)
      .eq("status", "public")
      .maybeSingle();
    if (error || !data) return null;
    return data as SharedPersonaRow;
  }
  const all = await readAll();
  return all.entries.find((e) => e.slug === slug && e.status === "public") ?? null;
}
