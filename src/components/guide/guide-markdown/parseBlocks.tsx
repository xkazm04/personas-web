import React, { type ReactNode } from "react";

import { CodeFence, MarkdownTable } from "../GuideBlocks";
import { expandLineRanges } from "./expandLineRanges";
import { HeadingAnchor } from "./HeadingAnchor";
import { DIRECTIVE_OPENER, KNOWN_DIRECTIVES, lintDirectives } from "./directiveLint";
import { createHeadingIdAssigner } from "./headingId";
import { parseCustomBlock } from "./parseCustomBlock";
import { parseInline } from "./parseInline";

const DEV = process.env.NODE_ENV === "development";

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
  const assignHeadingId = createHeadingIdAssigner();
  const emit = (node: ReactNode) =>
    elements.push(React.cloneElement(node as React.ReactElement, { key: `b${key++}` }));

  // Content typos must not vanish silently. Production renders around them
  // (and `npm run check:guide-content` fails on them); development says so.
  if (DEV) {
    for (const issue of lintDirectives(lines)) {
      console.warn(`[guide] line ${issue.line}: ${issue.message}: ${issue.text.trim()}`);
    }
  }

  while (index < lines.length) {
    const line = lines[index];
    if (line.trim() === "") {
      index++;
      continue;
    }

    if (line.trimStart().startsWith("```")) {
      const fence = line.trim().slice(3).trim();
      const hlMatch = fence.match(/\{hl=([^}]+)\}/);
      const stripped = hlMatch ? fence.replace(hlMatch[0], "").trim() : fence;
      const [rawLang, ...modifiers] = stripped.split(":");
      const lineNumbers = modifiers.some((m) => m === "line-numbers" || m === "ln");
      const highlightLines = hlMatch ? expandLineRanges(hlMatch[1]) : undefined;
      const codeLines: string[] = [];
      index++;
      while (index < lines.length && !lines[index].trimStart().startsWith("```")) {
        codeLines.push(lines[index++]);
      }
      index++;
      emit(<CodeFence text={codeLines.join("\n")} lang={rawLang || undefined} lineNumbers={lineNumbers || undefined} highlightLines={highlightLines} />);
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      // Shift in-content markdown headings down one level: the topic title is
      // the page's single <h1> (rendered in TopicView), so a content "#"
      // becomes <h2>, "##" becomes <h3>, etc. (capped at h4).
      const depth = Math.min(headingMatch[1].length + 1, 4) as 1 | 2 | 3 | 4;
      const rawText = headingMatch[2];
      // Shared assigner keeps these ids identical to the TOC's (extractHeadings).
      const id = assignHeadingId(rawText);
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

    const customMatch = line.trimStart().match(DIRECTIVE_OPENER);
    if (customMatch) {
      const innerLines: string[] = [];
      index++;
      while (index < lines.length && !lines[index].trimStart().startsWith(":::")) {
        innerLines.push(lines[index++]);
      }
      index++;
      const parsed = parseCustomBlock(customMatch[1], innerLines, `callout${key}`);
      if (parsed) emit(parsed);
      // Unknown names are reported by lintDirectives above; this catches a
      // known directive whose body had nothing the block parser could use.
      else if (DEV && KNOWN_DIRECTIVES.has(customMatch[1])) {
        console.warn(`[guide] ':::${customMatch[1]}' rendered nothing: no valid content inside it`);
      }
      continue;
    }

    // A malformed opener (`::: tip`, `:::tip Title`) or a stray closer. Skip
    // the line: isBlockStart() keeps the paragraph collector below from taking
    // it, so without this the loop never advances and the render hangs.
    if (line.trimStart().startsWith(":::")) {
      index++;
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
      // A deeper list belongs INSIDE this <li>, not as a sibling of it — a
      // <ul> directly inside a <ul> is invalid HTML and breaks list semantics
      // for assistive tech. Look ahead for a nested block and render it within.
      const liContent: ReactNode[] = [parseInline(items[index].content, `ul${key}-${index}`)];
      const liIndex = index;
      index++;
      if (index < items.length && items[index].depth > depth) {
        const sub = buildUnorderedList(items, index, items[index].depth, key);
        liContent.push(sub.node);
        index = sub.next;
      }
      children.push(
        <li key={`li${liIndex}`} className="text-base leading-relaxed">{liContent}</li>,
      );
    } else {
      // Deeper item with no preceding same-depth <li> (malformed indentation) —
      // recurse defensively so nothing is dropped.
      const sub = buildUnorderedList(items, index, items[index].depth, key);
      children.push(sub.node);
      index = sub.next;
    }
  }
  return { node: <ul key={`ul${key}-${from}-${depth}`} className="list-disc list-inside space-y-1 mb-4 text-muted-dark">{children}</ul>, next: index };
}

function emitTable(tableLines: string[], emit: (node: ReactNode) => void) {
  const parseRow = (row: string) => row.split("|").slice(1, -1).map((cell) => cell.trim());
  if (tableLines.length < 2) return;
  const rawHeaders = parseRow(tableLines[0]);
  const dataStart = /^[\s|:-]+$/.test(tableLines[1].replace(/\|/g, "").replace(/[-: ]/g, "")) ? 2 : 1;
  const rawRows = tableLines.slice(dataStart).map(parseRow);
  // Run cells through parseInline so `code`, **bold**, and links render like
  // every other block type, instead of showing literal markdown syntax.
  const headers = rawHeaders.map((cell, ci) => parseInline(cell, `th${ci}`));
  const rows = rawRows.map((row, ri) => row.map((cell, ci) => parseInline(cell, `td${ri}-${ci}`)));
  emit(<MarkdownTable headers={headers} rows={rows} />);
}
