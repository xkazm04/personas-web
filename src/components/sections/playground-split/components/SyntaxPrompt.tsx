"use client";

import { SYNTAX_KEYWORDS } from "../data";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Build one split pattern from SYNTAX_KEYWORDS. Longest-first so multi-word
// tokens ("next week") win over their prefixes, and boundary lookarounds
// (not a leading `\b`) so `#`-prefixed tokens like #142 actually match after
// whitespace — a leading `\b` before `#` is unsatisfiable.
const SPLIT_PATTERN = new RegExp(
  `((?<![\\w#-])(?:${[...SYNTAX_KEYWORDS]
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join("|")})(?![\\w-]))`,
  "gi",
);

const KEYWORD_SET = new Set(SYNTAX_KEYWORDS.map((k) => k.toLowerCase()));

/** Pure tokenizer (exported for tests): splits a prompt into keyword / plain runs. */
export function tokenizePrompt(text: string): { text: string; keyword: boolean }[] {
  return text
    .split(SPLIT_PATTERN)
    .filter((part) => part !== "")
    .map((part) => ({ text: part, keyword: KEYWORD_SET.has(part.toLowerCase()) }));
}

export default function SyntaxPrompt({ text }: { text: string }) {
  const parts = tokenizePrompt(text);
  return (
    <div className="font-mono text-base leading-relaxed">
      <span className="text-muted-dark">{">"} </span>
      {parts.map((part, i) => (
        <span key={i} className={part.keyword ? "text-brand-cyan" : "text-muted"}>
          {part.text}
        </span>
      ))}
    </div>
  );
}
