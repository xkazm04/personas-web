import { GUIDE_TOPICS } from "@/data/guide/topics";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { isTopicVisible } from "@/lib/guide-utils";
import type { GuideTopic, GuideCategory } from "@/data/guide/types";

export interface SearchResult {
  topic: GuideTopic;
  category: GuideCategory;
  score: number;
  matchType: "exact-title" | "exact-tag" | "fuzzy-title" | "fuzzy-tag" | "description" | "body";
  /** For "body" matches: a short cleaned excerpt of the article text around the hit. */
  excerpt?: string;
}

/**
 * A distilled, searchable record of one topic's article body. Built from the
 * Markdown content modules (see buildBodyIndex) with directive/markup syntax
 * stripped, so the runtime index is far smaller than the raw ~136KB of bodies
 * and safe to substring-scan. `text` keeps original casing for excerpts;
 * `haystack` is its lowercased twin for matching.
 */
export interface BodyIndexEntry {
  topicId: string;
  text: string;
  haystack: string;
}

export interface GroupedResults {
  category: GuideCategory;
  results: SearchResult[];
}

function levenshtein(a: string, b: string, maxDist = 2): number {
  const m = a.length;
  const n = b.length;
  // Early exit: length difference alone exceeds threshold
  if (Math.abs(m - n) > maxDist) return maxDist + 1;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      rowMin = Math.min(rowMin, dp[i][j]);
    }
    // Early exit: entire row exceeds threshold — no path can recover
    if (rowMin > maxDist) return maxDist + 1;
  }
  return dp[m][n];
}

/**
 * Edit budget scaled to token length. A flat distance of 2 against a 2-char
 * minimum query length made short queries ("ai", "run") fuzzy-match nearly
 * every word, flooding tiers 3–4 with noise. Standard practice: 0 edits for
 * very short tokens, 1 for medium, up to `maxDist` for longer ones.
 */
function editBudget(query: string, target: string, maxDist: number): number {
  const shorter = Math.min(query.length, target.length);
  if (shorter < 4) return 0;
  if (shorter < 7) return Math.min(1, maxDist);
  return maxDist;
}

function fuzzyWordMatch(query: string, target: string, maxDist = 2): boolean {
  if (target.includes(query)) return true;
  const budget = editBudget(query, target, maxDist);
  if (budget > 0 && levenshtein(query, target, budget) <= budget) return true;
  const words = target.split(/\s+/);
  if (words.length > 1) {
    return words.some((w) => {
      const b = editBudget(query, w, maxDist);
      return b > 0 && levenshtein(query, w, b) <= b;
    });
  }
  return false;
}

export function searchGuide(query: string, limit = 15): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  const queryWords = q.split(/\s+/);
  const results: SearchResult[] = [];

  for (const topic of GUIDE_TOPICS) {
    if (!isTopicVisible(topic)) continue;
    const category = GUIDE_CATEGORIES.find((c) => c.id === topic.categoryId)!;
    let bestScore = 0;
    let bestMatch: SearchResult["matchType"] = "description";

    const titleLower = topic.title.toLowerCase();
    const descLower = topic.description.toLowerCase();

    // 1. Exact title substring (highest priority)
    if (titleLower.includes(q)) {
      bestScore = 10;
      bestMatch = "exact-title";
    }

    // 2. Exact tag match
    if (bestScore < 8 && topic.tags.some((tag) => tag.includes(q))) {
      bestScore = 8;
      bestMatch = "exact-tag";
    }

    // 3. Fuzzy title match (per-word, <=2 edits)
    if (bestScore < 5) {
      const titleWords = titleLower.split(/\s+/);
      if (queryWords.every((qw) => titleWords.some((tw) => fuzzyWordMatch(qw, tw, 2)))) {
        bestScore = 5;
        bestMatch = "fuzzy-title";
      }
    }

    // 4. Fuzzy tag match
    if (bestScore < 4) {
      if (queryWords.some((qw) => topic.tags.some((tag) => fuzzyWordMatch(qw, tag, 2)))) {
        bestScore = 4;
        bestMatch = "fuzzy-tag";
      }
    }

    // 5. Description substring (lowest)
    if (bestScore < 2 && descLower.includes(q)) {
      bestScore = 2;
      bestMatch = "description";
    }

    if (bestScore > 0) {
      results.push({ topic, category, score: bestScore, matchType: bestMatch });
    }
  }

  results.sort((a, b) => b.score - a.score || a.topic.title.localeCompare(b.topic.title));
  return results.slice(0, limit);
}

// ── Body index (lowest-priority full-text tier) ────────────────────────
//
// The title/tag/description ladder above never sees article prose, so a query
// for a phrase that lives only in a body returns nothing. These helpers build
// a distilled full-text index from the Markdown content modules and scan it as
// a strictly-below-description tier (score 1). They are pure (no content import
// here) so the heavy GUIDE_CONTENT map is only pulled in by the lazily-imported
// wrapper in guide-body-index.ts — keeping the initial search bundle unchanged.

/**
 * Strip Markdown + custom-directive syntax from a body so the indexed text and
 * excerpts read as plain prose. Mirrors the syntax the guide renderer parses
 * (see parseBlocks.tsx): fenced code, `:::directive` fences, headings, list and
 * blockquote markers, tables, emphasis, inline code, and links.
 */
export function stripGuideMarkup(md: string): string {
  return (
    md
      // Fenced code blocks — drop the code entirely (not prose).
      .replace(/```[\s\S]*?```/g, " ")
      // Directive open/close fences (:::steps, :::tip, the bare closing :::, and
      // the :::compare "---" column separator).
      .replace(/^\s*:::[\w-]*.*$/gm, " ")
      .replace(/^\s*---+\s*$/gm, " ")
      // Any stray inline directive token (defensive — real bodies keep these
      // on their own line, but never let ":::" leak into an excerpt).
      .replace(/:::[\w-]*/g, " ")
      // Table pipes and heading/list/blockquote line markers.
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      .replace(/^\s*>\s?/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/\|/g, " ")
      // Inline: links → text, images dropped, emphasis + inline code unwrapped.
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      // Collapse whitespace runs (newlines included) into single spaces.
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Build the distilled body index from a topicId → Markdown content map. */
export function buildBodyIndex(content: Record<string, string>): BodyIndexEntry[] {
  const index: BodyIndexEntry[] = [];
  for (const topicId of Object.keys(content)) {
    const text = stripGuideMarkup(content[topicId]);
    if (!text) continue;
    index.push({ topicId, text, haystack: text.toLowerCase() });
  }
  return index;
}

/**
 * Extract a short, word-boundary-snapped excerpt of `text` around the first
 * occurrence of `query`, with ellipses when the window is clipped.
 */
export function extractExcerpt(text: string, query: string, radius = 60): string {
  const q = query.toLowerCase();
  const lower = text.toLowerCase();
  const at = lower.indexOf(q);
  if (at === -1) return text.length > radius * 2 ? `${text.slice(0, radius * 2).trimEnd()}…` : text;

  const hitEnd = at + q.length;
  let start = Math.max(0, at - radius);
  let end = Math.min(text.length, hitEnd + radius);
  // Snap the window edges to word boundaries so we never cut mid-word.
  if (start > 0) {
    const sp = text.indexOf(" ", start);
    if (sp !== -1 && sp < at) start = sp + 1;
  }
  if (end < text.length) {
    const sp = text.lastIndexOf(" ", end);
    if (sp > hitEnd) end = sp;
  }
  let excerpt = text.slice(start, end).trim();
  if (start > 0) excerpt = `…${excerpt}`;
  if (end < text.length) excerpt = `${excerpt}…`;
  return excerpt;
}

/**
 * Scan the body index for `query`, skipping topics already matched by a higher
 * tier (`excludeIds`) and hidden topics. Returns SearchResult rows at score 1
 * (strictly below the description tier) carrying a matching-text excerpt.
 */
export function searchBodyIndex(
  index: BodyIndexEntry[],
  query: string,
  excludeIds: string[] = [],
  limit = 15,
): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2 || limit <= 0) return [];
  const excluded = new Set(excludeIds);
  const results: SearchResult[] = [];

  for (const entry of index) {
    if (excluded.has(entry.topicId)) continue;
    if (!entry.haystack.includes(q)) continue;
    const topic = GUIDE_TOPICS.find((t) => t.id === entry.topicId);
    if (!topic || !isTopicVisible(topic)) continue;
    const category = GUIDE_CATEGORIES.find((c) => c.id === topic.categoryId);
    if (!category) continue;
    results.push({
      topic,
      category,
      score: 1,
      matchType: "body",
      excerpt: extractExcerpt(entry.text, query),
    });
  }

  results.sort((a, b) => b.score - a.score || a.topic.title.localeCompare(b.topic.title));
  return results.slice(0, limit);
}

export function groupResultsByCategory(results: SearchResult[]): GroupedResults[] {
  const map = new Map<string, GroupedResults>();
  for (const r of results) {
    const existing = map.get(r.category.id);
    if (existing) {
      existing.results.push(r);
    } else {
      map.set(r.category.id, { category: r.category, results: [r] });
    }
  }
  return Array.from(map.values());
}
