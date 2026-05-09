import type { ReactNode } from "react";

interface Segment {
  text: string;
  hit: boolean;
}

function exactSegments(text: string, query: string): Segment[] {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return [{ text, hit: false }];
  const segments: Segment[] = [];
  if (idx > 0) segments.push({ text: text.slice(0, idx), hit: false });
  segments.push({ text: text.slice(idx, idx + query.length), hit: true });
  const tail = idx + query.length;
  if (tail < text.length) segments.push({ text: text.slice(tail), hit: false });
  return segments;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 3;
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

function fuzzySegments(text: string, query: string): Segment[] {
  const queryWords = query.toLowerCase().split(/\s+/);
  const tokens = text.split(/(\s+)/);
  const hitIndices = new Set<number>();

  for (const qw of queryWords) {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < tokens.length; i++) {
      if (/^\s+$/.test(tokens[i])) continue;
      const tw = tokens[i].toLowerCase();
      if (tw.includes(qw)) { bestIdx = i; bestDist = 0; break; }
      const d = levenshtein(qw, tw);
      if (d < bestDist && d <= 2) { bestDist = d; bestIdx = i; }
    }
    if (bestIdx >= 0) hitIndices.add(bestIdx);
  }

  if (hitIndices.size === 0) return [{ text, hit: false }];

  const raw: Segment[] = tokens.map((t, i) => ({ text: t, hit: hitIndices.has(i) }));
  const merged: Segment[] = [];
  for (const seg of raw) {
    const last = merged[merged.length - 1];
    if (last && last.hit === seg.hit) { last.text += seg.text; }
    else merged.push({ ...seg });
  }
  return merged;
}

export type MatchType = "exact-title" | "exact-tag" | "fuzzy-title" | "fuzzy-tag" | "description";

export function highlightMatch(
  text: string,
  query: string,
  matchType: MatchType,
  color: string,
): ReactNode[] {
  const isExact = matchType === "exact-title";
  const isFuzzy = matchType === "fuzzy-title";
  if (!isExact && !isFuzzy) return [text];

  const segments = isExact ? exactSegments(text, query) : fuzzySegments(text, query);
  const bg = `${color}33`;

  return segments.map((seg, i) => {
    if (!seg.hit) return <span key={i}>{seg.text}</span>;
    return isExact ? (
      <mark key={i} className="rounded-sm font-semibold" style={{ backgroundColor: bg, color: "inherit" }}>
        {seg.text}
      </mark>
    ) : (
      <mark key={i} className="rounded-sm underline decoration-1 underline-offset-2" style={{ backgroundColor: bg, color: "inherit" }}>
        {seg.text}
      </mark>
    );
  });
}
