/**
 * The desktop's review learning loop, as a pure function: what memory a
 * resolved manual review writes. Mirrors `flip_status` in
 * ../personas/src-tauri/db/src/repos/communication/manual_reviews.rs (the
 * block after the atomic status flip, "Learning loop: a resolved
 * (approved/rejected) review IS human feedback"). Pinned by
 * reviewLearning.desktopParity.test.ts; re-read that block when it changes.
 *
 * The desktop has three branches, by the review's persona:
 * - in a team (`home_team_id`): one shared TEAM memory, `Human {verdict}:
 *   {title}`, approved -> `decision` (importance 7), rejected -> `constraint`
 *   (8), deduped by (team, title). A team memory carries no execution id.
 * - solo, a Director verdict (context `"source":"director"`): approved ->
 *   `Director coaching: {title}`, `learned`, 5; rejected writes NOTHING.
 * - solo, any other review: a PERSONA memory `Human {verdict}: {title}`,
 *   `learned`, 5, `source_execution_id` = the review's execution. No title
 *   dedup: the status compare-and-swap means a review resolves once.
 *
 * Only persona memories are synced to the web (`synced_memories`), so only
 * the persona branches reach Knowledge > Memories. The demo's personas have
 * no team, so the scripted desktop always takes a solo branch.
 */

export type LearningVerdict = "approved" | "rejected";

/** A persona memory row, field for field the web's `SyncedMemory`. */
export interface LearnedMemoryRow {
  id: string;
  personaId: string;
  title: string;
  content: string;
  category: string | null;
  sourceExecutionId: string | null;
  importance: number | null;
  /** JSON array, as the desktop stores `tags` on a persona memory. */
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The fields of a resolved review the learning loop reads. */
export interface ResolvedReview {
  title: string;
  /** null when the review has none (the desktop's `Option<String>`). */
  description: string | null;
  personaId: string;
  executionId: string | null;
  /** The review's context data; a Director verdict carries `"source":"director"`. */
  contextData: string | null;
  /** The persona's `home_team_id`; null or empty for a solo persona. */
  teamId?: string | null;
}

export type LearnedMemory =
  | {
      scope: "persona";
      personaId: string;
      title: string;
      content: string;
      category: "learned";
      importance: 5;
      tags: string[];
      sourceExecutionId: string | null;
    }
  | {
      scope: "team";
      teamId: string;
      personaId: string;
      title: string;
      content: string;
      category: "decision" | "constraint";
      importance: 7 | 8;
      /** Comma-separated, as the desktop stores team memory tags. */
      tags: string;
    };

/** The memory body, built the desktop's way (notes trimmed; empty notes are none). */
export function learnedMemoryContent(review: Pick<ResolvedReview, "title" | "description">, verdict: LearningVerdict, notes: string | null): string {
  const trimmed = notes?.trim() || null;
  const description = review.description !== null ? `: ${review.description}` : "";
  const reviewerNotes = trimmed ? ` Reviewer notes: ${trimmed}.` : "";
  return `Human ${verdict} the review "${review.title}"${description}.${reviewerNotes} Apply this decision to future work.`;
}

/**
 * The memory a verdict writes, or null when it writes none (a rejected
 * Director verdict; a team memory with that title already exists).
 * `teamTitles` is the team ledger's existing titles, for the team dedup.
 */
export function learnedMemoryFromVerdict(
  review: ResolvedReview,
  verdict: LearningVerdict,
  notes: string | null,
  teamTitles: ReadonlySet<string> = new Set(),
): LearnedMemory | null {
  const content = learnedMemoryContent(review, verdict, notes);
  const teamId = review.teamId || null;

  if (teamId) {
    const title = `Human ${verdict}: ${review.title}`;
    if (teamTitles.has(title)) return null;
    const rejected = verdict === "rejected";
    return {
      scope: "team",
      teamId,
      personaId: review.personaId,
      title,
      content,
      category: rejected ? "constraint" : "decision",
      importance: rejected ? 8 : 7,
      tags: `human-review,${verdict}`,
    };
  }

  const isDirector = review.contextData?.includes('"source":"director"') ?? false;
  if (isDirector) {
    if (verdict !== "approved") return null;
    return {
      scope: "persona",
      personaId: review.personaId,
      title: `Director coaching: ${review.title}`,
      content,
      category: "learned",
      importance: 5,
      tags: ["director", "coaching", "human-approved"],
      sourceExecutionId: review.executionId,
    };
  }

  return {
    scope: "persona",
    personaId: review.personaId,
    title: `Human ${verdict}: ${review.title}`,
    content,
    category: "learned",
    importance: 5,
    tags: ["human-review", verdict],
    sourceExecutionId: review.executionId,
  };
}
