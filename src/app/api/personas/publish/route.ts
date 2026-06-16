/**
 * POST /api/personas/publish — publish a persona to the public gallery.
 *
 * The desktop "Share" action POSTs a `.persona.json` bundle here and gets back
 * a short slug + canonical share URL (https://…/p/<slug>). Anonymous + anon-key
 * Supabase, mirroring the feature-voting routes; rate-limited per IP.
 *
 * PII: stores a pseudonymous publisher display name + install id (abuse
 * attribution only, never surfaced). No account, no email.
 */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp, parseJsonBody } from "@/lib/server/request";
import { isRateLimited as isSharedRateLimited } from "@/lib/server/rate-limit";
import { withWriteLock } from "@/lib/fileLock";
import {
  type PublishPersonaInput,
  validatePublish,
  isValidInstallId,
  slugifyName,
  randomSuffix,
  hasSupabase,
  getSupabaseClient,
  readAll,
  writeAll,
  type SharedPersonaRow,
} from "../storage";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://personas.ai").replace(/\/+$/, "");
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // Publishing is heavier than voting — tighter bucket.
  if (isSharedRateLimited({ namespace: "persona-publish", key: ip, limit: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = await parseJsonBody<PublishPersonaInput>(req, { maxBytes: 512 * 1024 });
  if (!parsed.ok) return parsed.response;

  const valid = validatePublish(parsed.data);
  if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 400 });
  const input = valid.value;

  const installId = isValidInstallId(input.installId) ? input.installId : null;
  const slug = `${slugifyName(input.name)}-${randomSuffix()}`;

  const row: Omit<SharedPersonaRow, "created_at" | "updated_at"> & {
    created_at?: string;
    updated_at?: string;
  } = {
    slug,
    name: input.name,
    description: input.description?.toString().trim() || null,
    icon: input.icon ?? null,
    color: input.color ?? null,
    category: input.category ?? null,
    bundle: input.bundle,
    publisher: input.publisher?.toString().trim() || null,
    install_id: installId,
    install_count: 0,
    status: "public",
  };

  if (hasSupabase()) {
    const sb = await getSupabaseClient();
    const { error } = await sb.from("shared_personas").insert(row);
    if (error) {
      return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
    }
  } else {
    await withWriteLock("shared-personas", async () => {
      const data = await readAll();
      const now = new Date().toISOString();
      data.entries.unshift({ ...row, created_at: now, updated_at: now } as SharedPersonaRow);
      await writeAll(data);
    });
  }

  return NextResponse.json({ slug, url: `${siteUrl()}/p/${slug}` }, { status: 201 });
}
