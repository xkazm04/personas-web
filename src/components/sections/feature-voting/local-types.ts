/** Feature ids whose display copy lives in i18n (`featureVoting.features`). */
import type { FeatureId } from "@/lib/feature-ids";
export type { FeatureId };

export type Feature = {
  id: FeatureId;
  accent: "cyan" | "purple" | "emerald" | "amber";
  votes: number;
};

export interface Comment {
  id: string;
  featureId: string;
  parentId: string | null;
  text: string;
  author: string;
  timestamp: number;
}

export interface AccentToken {
  r: number;
  g: number;
  b: number;
  tw: string;
}

/**
 * Initial-load lifecycle for the section.
 * - `loading`  — the first fetch batch is still in flight (show skeletons).
 * - `live`     — at least one source resolved; the data is real.
 * - `degraded` — every initial fetch rejected; present quietly and never
 *   claim "Live" over what is effectively dead/seed-only data.
 */
export type LoadState = "loading" | "live" | "degraded";

/**
 * A vote, comment or boost the API refused, after its optimistic update was
 * rolled back. Kept per feature so the card can say so; `seq` is new for every
 * failure, so a repeat of the same failure still re-offers a comment draft.
 */
export interface WriteFailure {
  kind: "vote" | "comment" | "boost";
  seq: number;
  /** A failed comment's text and thread, handed back to its input. */
  text?: string;
  parentId?: string | null;
}
