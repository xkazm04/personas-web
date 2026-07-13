/** Feature ids whose display copy lives in i18n (`featureVoting.features`). */
export type FeatureId = "macos" | "i18n" | "dashboard" | "enterprise";

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
