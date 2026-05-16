import type { ReactNode } from "react";

import {
  ArchitectureDiagram,
  Callout,
  Checklist,
  CodeCompare,
  CompareBlock,
  FeatureHighlight,
  KeyboardGrid,
  StepWizard,
  UseCaseGrid,
} from "../GuideBlocks";
import { parseInline } from "./parseInline";

export function parseCustomBlock(
  blockType: string,
  innerLines: string[],
  keyBase: string,
): ReactNode | null {
  if (blockType === "steps") return parseSteps(innerLines);
  if (blockType === "keys") return parseKeys(innerLines);
  if (blockType === "compare") return parseCompare(innerLines);
  if (blockType === "diagram") return parseDiagram(innerLines);
  if (blockType === "feature") return parseFeature(innerLines);
  if (blockType === "checklist") return parseChecklist(innerLines);
  if (blockType === "usecases") return parseUseCases(innerLines);
  if (blockType === "code-compare") return parseCodeCompare(innerLines);
  if (["tip", "warning", "info", "success"].includes(blockType)) {
    const content = innerLines.filter((line) => line.trim()).join(" ").trim();
    return (
      <Callout type={blockType}>
        <p>{parseInline(content, keyBase)}</p>
      </Callout>
    );
  }
  return null;
}

function parseSteps(lines: string[]) {
  const steps: { title: string; body: string }[] = [];
  for (const line of lines) {
    const match = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*(?:[\u2014\u2013-]\s*)?(.*)$/);
    if (match) steps.push({ title: match[1], body: match[2] });
    else if (line.trim() && steps.length > 0) {
      steps[steps.length - 1].body += `${steps[steps.length - 1].body ? " " : ""}${line.trim()}`;
    }
  }
  return steps.length > 0 ? <StepWizard steps={steps} /> : null;
}

function parseKeys(lines: string[]) {
  const shortcuts: { combo: string; description: string }[] = [];
  for (const line of lines) {
    const match = line.match(/^(.+?)\s*[\u2014\u2013-]\s+(.+)$/);
    if (match) shortcuts.push({ combo: match[1].trim(), description: match[2].trim() });
  }
  return shortcuts.length > 0 ? <KeyboardGrid shortcuts={shortcuts} /> : null;
}

function parseCompare(lines: string[]) {
  const chunks: { title: string; body: string; highlight?: boolean }[] = [];
  let current: { title: string; body: string; highlight?: boolean } | null = null;
  for (const line of lines) {
    if (/^---+$/.test(line.trim())) {
      if (current) chunks.push(current);
      current = null;
      continue;
    }
    const titleMatch = line.match(/^\*\*(.+?)\*\*\s*(\[recommended\])?\s*$/);
    if (titleMatch && (!current || !current.body)) {
      if (current) chunks.push(current);
      current = { title: titleMatch[1], body: "", highlight: !!titleMatch[2] };
    } else if (line.trim()) {
      current ??= { title: "", body: "" };
      current.body += `${current.body ? " " : ""}${line.trim()}`;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? <CompareBlock items={chunks} /> : null;
}

function parseDiagram(lines: string[]) {
  const nodes: { label: string; arrow?: boolean }[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^-+>$/.test(trimmed)) {
      if (nodes.length > 0) nodes.push({ label: "", arrow: true });
      continue;
    }
    trimmed.split(/\s*-+>\s*/).forEach((part, index) => {
      const label = part.replace(/^\[|\]$/g, "").trim();
      if (!label) return;
      nodes.push(index > 0 || nodes.length > 0 ? { label, arrow: true } : { label });
    });
  }
  return nodes.length > 0 ? <ArchitectureDiagram nodes={nodes} /> : null;
}

function parseFeature(lines: string[]) {
  let title = "";
  let color: string | undefined;
  const bodyParts: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\*\*(.+?)\*\*\s*(?:color=(\S+))?\s*$/);
    if (match && !title) {
      title = match[1];
      color = match[2];
    } else if (line.trim()) bodyParts.push(line.trim());
  }
  return title || bodyParts.length > 0
    ? <FeatureHighlight title={title} body={bodyParts.join(" ")} color={color} />
    : null;
}

function parseChecklist(lines: string[]) {
  const items = lines
    .map((line) => line.match(/^\s*[-*]\s+(.+)$/)?.[1]?.trim() ?? line.trim())
    .filter(Boolean);
  return items.length > 0 ? <Checklist items={items} /> : null;
}

function parseUseCases(lines: string[]) {
  const items: { title: string; scenario: string; outcome: string }[] = [];
  let current = { title: "", scenario: "", outcome: "", phase: "scenario" as "scenario" | "outcome" };
  const flush = () => {
    if (current.title || current.scenario || current.outcome) {
      items.push({ title: current.title, scenario: current.scenario, outcome: current.outcome });
    }
    current = { title: "", scenario: "", outcome: "", phase: "scenario" };
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^===+$/.test(trimmed)) {
      flush();
    } else if (/^---+$/.test(trimmed)) {
      current.phase = "outcome";
    } else {
      const titleMatch = trimmed.match(/^\*\*(.+?)\*\*\s*$/);
      if (titleMatch && !current.title) current.title = titleMatch[1];
      else current[current.phase] += `${current[current.phase] ? " " : ""}${trimmed}`;
    }
  }
  flush();
  return items.length > 0 ? <UseCaseGrid items={items} /> : null;
}

function parseCodeCompare(lines: string[]) {
  let section: "before" | "after" = "before";
  const beforeLines: string[] = [];
  const afterLines: string[] = [];
  let beforeLabel = "Before";
  let afterLabel = "After";
  for (const line of lines) {
    const headerMatch = line.match(/^###?\s+(.+)$/);
    if (headerMatch) {
      const heading = headerMatch[1].trim().toLowerCase();
      section = heading.includes("after") || heading.includes("new") || heading.includes("improved") ? "after" : "before";
      if (section === "after") afterLabel = headerMatch[1].trim();
      else beforeLabel = headerMatch[1].trim();
    } else if (/^---+$/.test(line.trim())) section = "after";
    else if (section === "before") beforeLines.push(line);
    else afterLines.push(line);
  }
  const before = beforeLines.join("\n").trim();
  const after = afterLines.join("\n").trim();
  return before || after ? <CodeCompare before={before} after={after} beforeLabel={beforeLabel} afterLabel={afterLabel} /> : null;
}
