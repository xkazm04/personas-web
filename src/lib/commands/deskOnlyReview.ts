/**
 * Does the desktop refuse a phone's `review_decide` on this review before it
 * is clicked? Mirrors `is_desk_only` in personas `review_decide.rs` (66888d389d):
 * `context_data` is a JSON string, and the review is desk-only when its `kind`
 * is the App Master probation packet or its `source` is the App Master ask.
 * Absent, non-JSON or non-object `context_data` is an ordinary review. Pure.
 */

/** `PACKET_KIND`, personas `src-tauri/src/engine/app_master_probation.rs`. */
const PACKET_KIND = "app_master_probation";
/** `ASK_SOURCE`, personas `src-tauri/src/engine/subscription/attention_decide.rs`. */
const ASK_SOURCE = "app_master_ask";

export function isDeskOnlyReview(contextData: string | null | undefined): boolean {
  if (!contextData) return false;
  let ctx: unknown;
  try {
    ctx = JSON.parse(contextData);
  } catch {
    return false;
  }
  if (typeof ctx !== "object" || ctx === null || Array.isArray(ctx)) return false;
  const { kind, source } = ctx as Record<string, unknown>;
  return kind === PACKET_KIND || source === ASK_SOURCE;
}

/**
 * The ids a bulk verdict may send: a desk-only review never gets a
 * `review_decide`, whatever the selection holds.
 */
export function decidableIds(ids: string[], reviews: ReadonlyArray<{ id: string; deskOnly?: boolean }>): string[] {
  const deskOnly = new Set(reviews.filter((r) => r.deskOnly).map((r) => r.id));
  return ids.filter((id) => !deskOnly.has(id));
}
