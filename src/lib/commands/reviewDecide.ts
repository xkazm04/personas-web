/**
 * `review_decide` (PLAN M20, PHASE2-SPEC.md 1.6 + 2.2): a manual review's
 * verdict, sent as a signed command so the desktop runs its whole decision
 * body (status write, learned memory, team-step resume...), not a bare status
 * write. Pure: the params in the contract's key order, the target desktop, and
 * how a settled command reads as a verdict.
 *
 * The phone masks the notes with the desk's rules (`redactText`) before it
 * signs, so a pasted key never reaches the cloud row. Both the typed notes and
 * the masked notes are bounded by `REVIEW_NOTES_MAX` (masking can make a short
 * value longer). The desk masks again on arrival and keeps 500 characters.
 */
import type { InflightCommand } from "./commandReducer";
import { redactText } from "./redactText";

export type ReviewDecision = "approved" | "rejected";

/** The contract's cap on a verdict's notes (spec 2.2). */
export const REVIEW_NOTES_MAX = 2000;

/**
 * What the desktop keeps of a phone note, in characters: it redacts credential-
 * looking tokens, then cuts to `PHONE_NOTES_CAP_CHARS` (500, marker included),
 * `review_decide.rs` at personas 66888d389d. The phone has already masked the
 * notes by then, so a pasted key never reached the cloud row. The note fields stop here so
 * nothing typed is silently cut; `REVIEW_NOTES_MAX` stays the envelope bound.
 */
export const REVIEW_NOTES_KEPT = 500;

export interface ReviewDecideParams {
  reviewId: string;
  decision: ReviewDecision;
  /** null when the reviewer wrote none. */
  notes: string | null;
}

/**
 * `{"reviewId","decision","notes"}`, in that order (the envelope is signed
 * over exact bytes). Blank notes are null, otherwise untrimmed (the desk
 * trims). The notes are masked with the desk's rules before signing, so a
 * pasted key never reaches the cloud row. Refused rather than cut: typed notes
 * over the cap, or masked notes over it, throw `notes_too_long`, counted in
 * code points as the desk does. The desk masks again on arrival and keeps 500
 * characters.
 */
export function reviewDecideParams(reviewId: string, decision: ReviewDecision, notes: string | null | undefined): ReviewDecideParams {
  if (!notes || !notes.trim()) return { reviewId, decision, notes: null };
  if (Array.from(notes).length > REVIEW_NOTES_MAX) throw new Error("notes_too_long");
  const masked = redactText(notes);
  if (Array.from(masked).length > REVIEW_NOTES_MAX) throw new Error("notes_too_long");
  return { reviewId, decision, notes: masked };
}

/** Spec 2.2, targeting note: the desktop that raised the review, else the persona's owner. */
export function reviewTargetDevice(reviewDeviceId: string | null | undefined, personaDeviceId: string | null | undefined): string | null {
  return reviewDeviceId || personaDeviceId || null;
}

/**
 * A settled command as a verdict. Only `completed` counts; an already-decided
 * review also completes (`changed: false`), and the synced row then shows what
 * it was decided as. Failed / refused / expired, or a command the plane lost
 * (reset), are failures carrying the desktop's reason.
 */
export function reviewCommandOutcome(cmd: InflightCommand | null): { ok: true } | { ok: false; reason: string } {
  if (!cmd) return { ok: false, reason: "unknown" };
  if (cmd.status === "completed") return { ok: true };
  return { ok: false, reason: cmd.error ?? cmd.status };
}

/** `api.decideReview`'s input: everything every plane needs to record one verdict. */
export interface ReviewDecisionInput {
  reviewId: string;
  /** The review's persona: the command's `persona_id`, checked by the desktop. */
  personaId: string;
  /** `synced_manual_reviews.device_id`, when the plane knows it. */
  deviceId: string | null;
  decision: ReviewDecision;
  notes: string | null;
  /** Who decided (`RESOLVED_BY_*`): recorded where the plane keeps it (the orchestrator's event metadata). */
  resolvedBy: string;
}

/**
 * The direct plane's write (the orchestrator's event PATCH): the verdict as an
 * event status, with notes and the resolver in the metadata, so the next poll
 * reads back who resolved it.
 */
export function verdictEventBody(decision: ReviewDecision, resolvedBy: string, notes: string | null): { status: "processed" | "failed"; metadata: string } {
  return {
    status: decision === "approved" ? "processed" : "failed",
    metadata: JSON.stringify(notes ? { reviewerNotes: notes, resolvedBy } : { resolvedBy }),
  };
}
