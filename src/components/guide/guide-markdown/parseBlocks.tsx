import React, { type ReactNode } from "react";

import { CopyButton, MarkdownTable } from "../GuideBlocks";
import { HeadingAnchor, slugifyHeading } from "./HeadingAnchor";
import { parseCustomBlock } from "./parseCustomBlock";
import { parseInline } from "./parseInline";

function isBlockStart(line: string): boolean {
  const trimmed = line.trimStart();
  return (
    trimmed.startsWith("#") ||
    trimmed.startsWith("```") ||
    trimmed.startsWith(":::") ||
    /^---+$/.test(trimmed) ||
    trimmed.startsWith("> ") ||
    /^\s*[-*]\s/.test(line) ||
    /^\s*\d+\.\s/.test(line) ||
    /^\|.+\|/.test(trimmed)
  );
}

export function parseBlocks(lines: string[], opts: { copyAnchorLabel?: string } = {}): ReactNode[] {
  const elements: ReactNode[] = [];
  let index = 0;
  let key = 0;
  const usedSlugs = new Map<string, number>();
  const emit = (node: ReactNode) =>
    elements.push(React.cloneElement(node as React.ReactElement, { key: `b${key++}` }));

  while (index < lines.length) {
    const line = lines[index];
    if (line.trim() === "") {
      index++;
      continue;
    }

    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      index++;
      while (index < lines.length && !lines[index].trimStart().startsWith("```")) {
        codeLines.push(lines[index++]);
      }
      index++;
      const codeText = codeLines.join("\n");
      emit(
        <div className="group relative rounded-xl bg-white/[0.03] border border-glass mb-4 overflow-x-auto">
          <div className="flex items-center justify-between px-4 pt-2">
            {lang ? <div className="text-base text-muted-dark/60 font-mono select-none">{lang}</div> : <div />}
            <CopyButton text={codeText} />
          </div>
          <pre className="p-4 pt-2 font-mono text-base leading-relaxed text-muted-dark">
            <code>{codeText}</code>
          </pre>
        </div>,
      );
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const depth = headingMatch[1].length as 1 | 2 | 3 | 4;
      const rawText = headingMatch[2];
      const baseSlug = slugifyHeading(rawText) || `section-${key}`;
      const count = usedSlugs.get(baseSlug) ?? 0;
      usedSlugs.set(baseSlug, count + 1);
      const id = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
      emit(
        <HeadingAnchor
          depth={depth}
          id={id}
          rawText={rawText}
          copyLabel={opts.copyAnchorLabel ?? "Copy link to section"}
        >
          {parseInline(rawText, `h${key}`)}
        </HeadingAnchor>,
      );
      index++;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      emit(<hr className="border-t border-glass my-8" />);
      index++;
      continue;
    }

    if (line.trimStart().startsWith("> ")) {
      const blockquoteLines: string[] = [];
      while (index < lines.length && lines[index].trimStart().startsWith("> ")) {
        blockquoteLines.push(lines[index].replace(/^>\s?/, ""));
        index++;
      }
      emit(
        <blockquote className="border-l-2 border-brand-purple/40 pl-4 py-1 mb-4 text-muted italic bg-white/[0.01] rounded-r-lg">
          {parseInline(blockquoteLines.join(" ").trim(), `bq${key}`)}
        </blockquote>,
      );
      continue;
    }

    if (/^\s*[-*]\s/.test(line)) {
      const items = collectUnorderedItems(lines, index);
      index = items.next;
      emit(buildUnorderedList(items.items, 0, 0, key).node);
      continue;
    }

    if (/^\s*\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && (/^\s*\d+\.\s/.test(lines[index]) || lines[index].trim() === "")) {
        if (lines[index].trim() !== "") {
          const match = lines[index].match(/^\s*\d+\.\s(.+)$/);
          if (match) items.push(match[1]);
        }
        index++;
      }
      emit(
        <ol className="list-decimal list-inside space-y-1 mb-4 text-muted-dark">
          {items.map((text, itemIndex) => (
            <li key={itemIndex} className="text-base leading-relaxed">{parseInline(text, `ol${key}-${itemIndex}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const customMatch = line.trimStart().match(/^:::(\w+)$/);
    if (customMatch) {
      const innerLines: string[] = [];
      index++;
      while (index < lines.length && !lines[index].trimStart().startsWith(":::")) {
        innerLines.push(lines[index++]);
      }
      index++;
      const parsed = parseCustomBlock(customMatch[1], innerLines, `callout${key}`);
      if (parsed) emit(parsed);
      continue;
    }

    if (/^\|.+\|/.test(line.trimStart())) {
      const tableLines: string[] = [];
      while (index < lines.length && /^\|.+\|/.test(lines[index].trimStart())) {
        tableLines.push(lines[index++]);
      }
      emitTable(tableLines, emit);
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && lines[index].trim() !== "" && !isBlockStart(lines[index])) {
      paragraphLines.push(lines[index++]);
    }
    if (paragraphLines.length > 0) {
      emit(<p className="text-base text-muted-dark leading-relaxed mb-4">{parseInline(paragraphLines.join(" "), `p${key}`)}</p>);
    }
  }

  return elements;
}

function collectUnorderedItems(lines: string[], start: number) {
  const items: { depth: number; content: string }[] = [];
  let index = start;
  while (index < lines.length && (/^\s*[-*]\s/.test(lines[index]) || lines[index].trim() === "")) {
    if (lines[index].trim() !== "") {
      const match = lines[index].match(/^(\s*)[-*]\s(.+)$/);
      if (match) items.push({ depth: Math.floor(match[1].length / 2), content: match[2] });
    }
    index++;
  }
  return { items, next: index };
}

function buildUnorderedList(items: { depth: number; content: string }[], from: number, depth: number, key: number): { node: ReactNode; next: number } {
  const children: ReactNode[] = [];
  let index = from;
  while (index < items.length && items[index].depth >= depth) {
    if (items[index].depth === depth) {
      children.push(<li key={`li${index}`} className="text-base leading-relaxed">{parseInline(items[index].content, `ul${key}-${index}`)}</li>);
      index++;
    } else {
      const sub = buildUnorderedList(items, index, items[index].depth, key);
      children.push(sub.node);
      index = sub.next;
    }
  }
  return { node: <ul className="list-disc list-inside space-y-1 mb-4 text-muted-dark">{children}</ul>, next: index };
}

function emitTable(tableLines: string[], emit: (node: ReactNode) => void) {
  const parseRow = (row: string) => row.split("|").slice(1, -1).map((cell) => cell.trim());
  if (tableLines.length < 2) return;
  const headers = parseRow(tableLines[0]);
  const dataStart = /^[\s|:-]+$/.test(tableLines[1].replace(/\|/g, "").replace(/[-: ]/g, "")) ? 2 : 1;
  emit(<MarkdownTable headers={headers} rows={tableLines.slice(dataStart).map(parseRow)} />);
}
