"use client";

import { useMemo } from "react";

interface Token {
  text: string;
  type: "key" | "value" | "string" | "number" | "boolean" | "comment" | "punctuation" | "plain";
}

const COLORS: Record<Token["type"], string> = {
  key: "var(--brand-cyan)",
  value: "var(--muted-dark)",
  string: "var(--brand-emerald)",
  number: "var(--brand-purple)",
  boolean: "var(--brand-amber)",
  comment: "var(--text-disabled)",
  punctuation: "var(--text-secondary)",
  plain: "var(--muted-dark)",
};

function tokenizeLine(line: string): Token[] {
  if (line.trim() === "") return [{ text: line, type: "plain" }];

  const tokens: Token[] = [];
  const commentIdx = findUnquotedHash(line);

  const mainPart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
  const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : "";

  if (mainPart.length > 0) {
    tokenizeMain(mainPart, tokens);
  }

  if (commentPart.length > 0) {
    tokens.push({ text: commentPart, type: "comment" });
  }

  return tokens;
}

function findUnquotedHash(line: string): number {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === "#" && !inSingle && !inDouble) return i;
  }
  return -1;
}

function tokenizeMain(text: string, tokens: Token[]) {
  const leadingSpaces = text.match(/^(\s*)/)?.[1] ?? "";
  if (leadingSpaces) {
    tokens.push({ text: leadingSpaces, type: "plain" });
  }

  const rest = text.slice(leadingSpaces.length);

  const listMatch = rest.match(/^(-\s+)(.*)/);
  if (listMatch) {
    tokens.push({ text: listMatch[1], type: "punctuation" });
    tokenizeValueOrKeyValue(listMatch[2], tokens);
    return;
  }

  tokenizeValueOrKeyValue(rest, tokens);
}

function tokenizeValueOrKeyValue(text: string, tokens: Token[]) {
  const kvMatch = text.match(/^([a-zA-Z_][\w.-]*)(:)(.*)/);
  if (kvMatch) {
    tokens.push({ text: kvMatch[1], type: "key" });
    tokens.push({ text: kvMatch[2], type: "punctuation" });
    const after = kvMatch[3];
    if (after.length > 0) {
      tokenizeValue(after, tokens);
    }
    return;
  }

  tokenizeValue(text, tokens);
}

function tokenizeValue(text: string, tokens: Token[]) {
  const leadingSpace = text.match(/^(\s+)/)?.[1] ?? "";
  if (leadingSpace) tokens.push({ text: leadingSpace, type: "plain" });
  const trimmed = text.slice(leadingSpace.length);

  if (trimmed.length === 0) return;

  if (/^["']/.test(trimmed)) {
    tokens.push({ text: trimmed, type: "string" });
    return;
  }

  if (/^\[.*\]$/.test(trimmed)) {
    tokenizeInlineArray(trimmed, tokens);
    return;
  }

  if (/^(true|false|yes|no|null|~)$/i.test(trimmed)) {
    tokens.push({ text: trimmed, type: "boolean" });
    return;
  }

  if (/^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(trimmed)) {
    tokens.push({ text: trimmed, type: "number" });
    return;
  }

  tokens.push({ text: trimmed, type: "value" });
}

function tokenizeInlineArray(text: string, tokens: Token[]) {
  tokens.push({ text: "[", type: "punctuation" });
  const inner = text.slice(1, -1);
  const items = inner.split(",");
  items.forEach((item, i) => {
    const trimItem = item.trim();
    const leading = item.match(/^(\s*)/)?.[1] ?? "";
    if (leading) tokens.push({ text: leading, type: "plain" });
    if (/^["']/.test(trimItem)) {
      tokens.push({ text: trimItem, type: "string" });
    } else if (/^-?(\d+\.?\d*|\.\d+)$/.test(trimItem)) {
      tokens.push({ text: trimItem, type: "number" });
    } else if (/^(true|false|yes|no|null|~)$/i.test(trimItem)) {
      tokens.push({ text: trimItem, type: "boolean" });
    } else {
      tokens.push({ text: trimItem, type: "value" });
    }
    const trailingSpace = item.slice(leading.length + trimItem.length);
    if (trailingSpace) tokens.push({ text: trailingSpace, type: "plain" });
    if (i < items.length - 1) {
      tokens.push({ text: ",", type: "punctuation" });
    }
  });
  tokens.push({ text: "]", type: "punctuation" });
}

export default function YamlHighlighter({ code }: { code: string }) {
  const highlighted = useMemo(() => {
    return code.split("\n").map((line) => tokenizeLine(line));
  }, [code]);

  return (
    <pre className="overflow-x-auto rounded-xl border border-glass bg-white/[0.02] p-5 text-base leading-relaxed backdrop-blur-sm">
      <code>
        {highlighted.map((tokens, lineIdx) => (
          <span key={lineIdx}>
            {tokens.map((token, tokenIdx) => (
              <span key={tokenIdx} style={{ color: COLORS[token.type] }}>
                {token.text}
              </span>
            ))}
            {lineIdx < highlighted.length - 1 ? "\n" : null}
          </span>
        ))}
      </code>
    </pre>
  );
}
