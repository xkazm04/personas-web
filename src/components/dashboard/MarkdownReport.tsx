import type { ReactNode } from "react";

import { isBlockStart, renderInline, splitRow } from "./markdown-report/markdownInline";

/**
 * Lightweight, dependency-free markdown renderer for the demo dashboard's
 * agent reports. Supports the subset the mock reports use: headings (#–###),
 * paragraphs, **bold** / *italic* / `code` / [links](url), unordered and
 * ordered lists, fenced code blocks, blockquotes, horizontal rules, and simple
 * GFM pipe tables. Styling mirrors the desktop app's MarkdownRenderer using
 * semantic Tailwind tokens. Not a general-purpose parser — the mock content is
 * authored to stay within this subset.
 */
export function MarkdownReport({ content, className = "" }: { content: string; className?: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let kc = 0;
  const k = () => `b${kc++}`;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    // Fenced code block
    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++; // closing fence
      blocks.push(
        <pre key={k()} className="my-3 overflow-x-auto rounded-xl border border-glass bg-black/40 p-3.5">
          <code className="font-mono text-sm leading-relaxed text-slate-300">{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Pipe table (header row followed by a |---|---| separator)
    if (line.trim().startsWith("|") && i + 1 < lines.length && /^\s*\|[-:\s|]+\|\s*$/.test(lines[i + 1])) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const key = k();
      blocks.push(
        <div key={key} className="my-3 overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-lg border border-glass text-sm">
            <thead>
              <tr>
                {header.map((h, idx) => (
                  <th key={idx} className="border-b border-glass bg-white/[0.04] px-3 py-2 text-left font-semibold text-muted">
                    {renderInline(h, `${key}-th${idx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className="border-b border-glass/60 px-3 py-2 text-foreground/90">
                      {renderInline(c, `${key}-td${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Blockquote
    if (line.trim().startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const key = k();
      blocks.push(
        <blockquote key={key} className="my-3 rounded-r-lg border-l-2 border-brand-cyan/40 bg-brand-cyan/[0.04] py-2 pl-4 pr-3 text-foreground/90">
          {renderInline(quote.join(" "), key)}
        </blockquote>,
      );
      continue;
    }

    // Horizontal rule
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push(<hr key={k()} className="my-4 border-glass" />);
      i++;
      continue;
    }

    // Headings
    const h = /^(#{1,3})\s+(.*)$/.exec(line.trim());
    if (h) {
      const key = k();
      const inline = renderInline(h[2], key);
      if (h[1].length === 1) {
        blocks.push(<h2 key={key} className="mb-2 mt-5 text-lg font-bold text-foreground first:mt-0">{inline}</h2>);
      } else if (h[1].length === 2) {
        blocks.push(<h3 key={key} className="mb-2 mt-5 text-base font-semibold text-foreground first:mt-0">{inline}</h3>);
      } else {
        blocks.push(<h4 key={key} className="mb-1.5 mt-4 text-sm font-semibold uppercase tracking-wider text-muted first:mt-0">{inline}</h4>);
      }
      i++;
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      const key = k();
      blocks.push(
        <ul key={key} className="my-2.5 list-disc space-y-1 pl-5 text-foreground/90">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `${key}-${idx}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      const key = k();
      blocks.push(
        <ol key={key} className="my-2.5 list-decimal space-y-1 pl-5 text-foreground/90">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `${key}-${idx}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !isBlockStart(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    const key = k();
    blocks.push(
      <p key={key} className="my-2.5 leading-relaxed text-foreground/90">
        {renderInline(para.join(" "), key)}
      </p>,
    );
  }

  return <div className={`text-sm ${className}`}>{blocks}</div>;
}
