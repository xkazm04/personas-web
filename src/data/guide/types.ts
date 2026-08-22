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
 * content staleness, and desktop-drift reporting). All topics carry
 * `contentReviewedAt` / `appVersion` / `watchedFiles` since pass T.4:
 * reviewed-at dates come from the web git history of the category's
 * content file, `appVersion` is the desktop version current at backfill
 * time, and `watchedFiles` are deliberately coarse desktop feature
 * directories so the drift signal doesn't churn per-file.
 */
export interface TopicCoverage {
  /**
   * Path (relative to repo root) to the YAML recipe used by the screenshot
   * runner. Presence = "this topic has a screenshot"; absence = text-only.
   */
  screenshotRecipe?: string;
  /** ISO timestamp when the content was last reviewed for accuracy. */
  contentReviewedAt?: string;
  /**
   * Semver of the desktop app the topic was last verified against.
   * Recorded for humans reading the metadata; the drift detector never
   * queries it — see `watchedFiles`.
   */
  appVersion?: string;
  /**
   * Files in the desktop repo whose changes should trigger a re-review.
   * Checked by the drift detector against the git log since
   * `contentReviewedAt` — the review date, not `appVersion`. A topic missing
   * either `watchedFiles` or `contentReviewedAt` is skipped by the detector
   * and reported as a named skip class, never counted as drift-free.
   */
  watchedFiles?: string[];
}
