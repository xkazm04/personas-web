import { GUIDE_TOPICS } from "@/data/guide/topics";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import type { GuideTopic, GuideCategory } from "@/data/guide/types";

export interface SearchResult {
  topic: GuideTopic;
  category: GuideCategory;
  score: number;
  matchType: "exact-title" | "exact-tag" | "fuzzy-title" | "fuzzy-tag" | "description";
}

export interface GroupedResults {
  category: GuideCategory;
  results: SearchResult[];
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function fuzzyWordMatch(query: string, target: string, maxDist = 2): boolean {
  if (target.includes(query)) return true;
  if (levenshtein(query, target) <= maxDist) return true;
  const words = target.split(/\s+/);
  if (words.length > 1) {
    return words.some((w) => levenshtein(query, w) <= maxDist);
  }
  return false;
}

export function searchGuide(query: string, limit = 15): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  const queryWords = q.split(/\s+/);
  const results: SearchResult[] = [];

  for (const topic of GUIDE_TOPICS) {
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
