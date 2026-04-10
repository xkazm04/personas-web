"use client";

import React, { type ReactNode } from "react";

interface GuideMarkdownProps {
  content: string;
}

// ── Inline parser ────────────────────────────────────────────────────
// Splits a text string into React nodes handling: images, links, bold+italic,
// bold, italic, and inline code.

function parseInline(text: string, keyBase: string): ReactNode[] {
  // Create a NEW regex per call — a shared global regex corrupts lastIndex
  // across recursive calls (bold/link text triggers nested parseInline).
  const re =
    /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]*)\]\(([^)]+)\)|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));

    const key = `${keyBase}-i${k++}`;
    if (m[1] !== undefined || m[2] !== undefined) {
      // Image ![alt](src)
      // eslint-disable-next-line @next/next/no-img-element
      nodes.push(<img key={key} src={m[2]} alt={m[1] ?? ""} className="rounded-xl max-w-full h-auto my-4" />);
    } else if (m[3] !== undefined) {
      // Link [text](url)
      nodes.push(
        <a key={key} href={m[4]} className="text-brand-cyan underline underline-offset-2 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
          {parseInline(m[3], key)}
        </a>,
      );
    } else if (m[5] !== undefined) {
      // Bold italic ***text***
      nodes.push(<strong key={key} className="font-semibold text-foreground italic">{parseInline(m[5], key)}</strong>);
    } else if (m[6] !== undefined) {
      // Bold **text**
      nodes.push(<strong key={key} className="font-semibold text-foreground">{parseInline(m[6], key)}</strong>);
    } else if (m[7] !== undefined) {
      // Italic *text*
      nodes.push(<em key={key} className="italic">{parseInline(m[7], key)}</em>);
    } else if (m[8] !== undefined) {
      // Inline code `code`
      nodes.push(<code key={key} className="px-1.5 py-0.5 rounded bg-white/[0.06] text-base font-mono text-brand-cyan">{m[8]}</code>);
    }
    last = m.index + m[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// ── Block parser ─────────────────────────────────────────────────────

function isBlockStart(line: string): boolean {
  const t = line.trimStart();
  return t.startsWith("#") || t.startsWith("```") || /^---+$/.test(t) || t.startsWith("> ") || /^\s*[-*]\s/.test(line) || /^\s*\d+\.\s/.test(line);
}

function parseBlocks(lines: string[]): ReactNode[] {
  const elements: ReactNode[] = [];
  let i = 0;
  let key = 0;

  const emit = (node: ReactNode) => elements.push(React.cloneElement(node as React.ReactElement, { key: `b${key++}` }));

  while (i < lines.length) {
    const line = lines[i];

    // ── Blank lines → skip
    if (line.trim() === "") { i++; continue; }

    // ── Code block ```
    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      emit(
        <div className="relative rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4 overflow-x-auto">
          {lang && <div className="px-4 pt-2 text-sm text-muted-dark/60 font-mono select-none">{lang}</div>}
          <pre className="p-4 font-mono text-base leading-relaxed text-muted-dark">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>,
      );
      continue;
    }

    // ── Headings
    const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      const depth = hMatch[1].length as 1 | 2 | 3 | 4;
      const cls: Record<number, string> = {
        1: "text-3xl font-bold tracking-tight mt-8 mb-4 text-foreground",
        2: "text-2xl font-semibold tracking-tight mt-8 mb-3 text-foreground",
        3: "text-xl font-semibold mt-6 mb-2 text-foreground",
        4: "text-lg font-medium mt-4 mb-2 text-foreground",
      };
      const Tag = `h${depth}` as const;
      emit(<Tag className={cls[depth]}>{parseInline(hMatch[2], `h${key}`)}</Tag>);
      i++;
      continue;
    }

    // ── Horizontal rule
    if (/^---+$/.test(line.trim())) {
      emit(<hr className="border-t border-white/[0.06] my-8" />);
      i++;
      continue;
    }

    // ── Blockquote
    if (line.trimStart().startsWith("> ")) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("> ")) {
        bqLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      emit(
        <blockquote className="border-l-2 border-brand-purple/40 pl-4 py-1 mb-4 text-muted italic bg-white/[0.01] rounded-r-lg">
          {parseInline(bqLines.join(" ").trim(), `bq${key}`)}
        </blockquote>,
      );
      continue;
    }

    // ── Unordered list
    if (/^\s*[-*]\s/.test(line)) {
      const items: { depth: number; content: string }[] = [];
      while (i < lines.length && (/^\s*[-*]\s/.test(lines[i]) || lines[i].trim() === "")) {
        if (lines[i].trim() === "") { i++; continue; }
        const m = lines[i].match(/^(\s*)[-*]\s(.+)$/);
        if (m) items.push({ depth: Math.floor(m[1].length / 2), content: m[2] });
        i++;
      }
      const buildUl = (list: typeof items, from: number, depth: number): { node: ReactNode; next: number } => {
        const children: ReactNode[] = [];
        let j = from;
        while (j < list.length && list[j].depth >= depth) {
          if (list[j].depth === depth) {
            children.push(<li key={`li${j}`} className="text-base leading-relaxed">{parseInline(list[j].content, `ul${key}-${j}`)}</li>);
            j++;
          } else {
            const sub = buildUl(list, j, list[j].depth);
            children.push(sub.node);
            j = sub.next;
          }
        }
        return { node: <ul key={`ul-${from}`} className="list-disc list-inside space-y-1 mb-4 text-muted-dark">{children}</ul>, next: j };
      };
      emit(buildUl(items, 0, 0).node);
      continue;
    }

    // ── Ordered list
    if (/^\s*\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && (/^\s*\d+\.\s/.test(lines[i]) || lines[i].trim() === "")) {
        if (lines[i].trim() === "") { i++; continue; }
        const m = lines[i].match(/^\s*\d+\.\s(.+)$/);
        if (m) items.push(m[1]);
        i++;
      }
      emit(
        <ol className="list-decimal list-inside space-y-1 mb-4 text-muted-dark">
          {items.map((t, idx) => (
            <li key={idx} className="text-base leading-relaxed">{parseInline(t, `ol${key}-${idx}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // ── Paragraph (default)
    const pLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !isBlockStart(lines[i])) {
      pLines.push(lines[i]);
      i++;
    }
    if (pLines.length > 0) {
      emit(<p className="text-base text-muted-dark leading-relaxed mb-4">{parseInline(pLines.join(" "), `p${key}`)}</p>);
    }
  }

  return elements;
}

// ── Component ────────────────────────────────────────────────────────

export default function GuideMarkdown({ content }: GuideMarkdownProps) {
  const lines = content.split("\n");
  const elements = parseBlocks(lines);

  return <div className="prose-custom max-w-none">{elements}</div>;
}
