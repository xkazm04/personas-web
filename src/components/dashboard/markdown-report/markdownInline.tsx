import type { ReactNode } from "react";

// Inline markdown: `code`, **bold**, *italic*, [text](url). Shared by the
// block renderer in MarkdownReport.
const INLINE_RE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)]+\))/g;
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/;

export function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let n = 0;
  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const tok = match[0];
    const key = `${keyBase}-i${n++}`;
    if (tok.startsWith("`")) {
      out.push(
        <code key={key} className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-brand-cyan">
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("**")) {
      out.push(<strong key={key} className="font-semibold text-foreground">{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("*")) {
      out.push(<em key={key} className="italic">{tok.slice(1, -1)}</em>);
    } else {
      const lm = LINK_RE.exec(tok);
      if (lm) {
        out.push(
          <a key={key} href={lm[2]} target="_blank" rel="noreferrer" className="text-brand-cyan underline underline-offset-2 hover:text-brand-cyan/80">
            {lm[1]}
          </a>,
        );
      }
    }
    last = match.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function splitRow(line: string): string[] {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
}

export function isBlockStart(line: string): boolean {
  const t = line.trim();
  return (
    t.startsWith("```") ||
    t.startsWith("#") ||
    t.startsWith(">") ||
    t.startsWith("|") ||
    /^[-*]\s+/.test(t) ||
    /^\d+\.\s+/.test(t) ||
    /^(-{3,}|\*{3,})$/.test(t)
  );
}
