export interface GuideCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  /** Default mode for all topics in this category. Defaults to "both". */
  mode?: GuideMode;
}

export type GuideMode = "simple" | "power" | "both";

export interface GuideTopic {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  tags: string[];
  /** Which UI mode this topic is relevant to. Defaults to "both" if omitted. */
  mode?: GuideMode;
  /**
   * If true, the topic is hidden in production but visible when
   * NEXT_PUBLIC_SHOW_DEV_GUIDE_TOPICS=true (gated by isDevTopicsVisible in
   * guide-utils). Used for drafts and not-yet-ready content. The sidebar
   * renders dev-visible entries with a golden left border as a reminder
   * they won't ship.
   */
  devOnly?: boolean;
  /** Documentation coverage metadata — used by check-guide-coverage.mjs. */
  coverage?: TopicCoverage;
}

/**
 * Tracks whether a topic is documented, up-to-date, and illustrated.
 * Presence of `screenshotRecipe` signals that the topic *should* have
 * per-locale screenshots; absence means it is intentionally text-only.
 *
 * These fields feed scripts/check-guide-coverage.mjs (screenshot coverage,
 * content staleness, and desktop-drift reporting). Today only
 * `screenshotRecipe` is populated in topics.ts; the review/drift fields
 * are the schema that reporting reads and are not yet filled in.
 */
export interface TopicCoverage {
  /**
   * Path (relative to repo root) to the YAML recipe used by the screenshot
   * runner. Presence = "this topic has a screenshot"; absence = text-only.
   */
  screenshotRecipe?: string;
  /** ISO timestamp when the content was last reviewed for accuracy. */
  contentReviewedAt?: string;
  /** Semver of the desktop app the topic was last verified against. */
  appVersion?: string;
  /**
   * Files in the desktop repo whose changes should trigger a re-review.
   * Checked by the drift detector against the git log since `appVersion`.
   */
  watchedFiles?: string[];
}
