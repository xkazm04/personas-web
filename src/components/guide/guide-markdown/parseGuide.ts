/**
 * The guide dialect's one grammar: markdown lines -> a typed tree + diagnostics.
 *
 * Every reader of a topic body reads this tree instead of re-parsing the text:
 * the renderer (`renderGuideDoc`), the content gate
 * (`scripts/check-guide-content.mjs`, via `diagnostics`), the TOC
 * (`headingsOf`) and the HowTo JSON-LD (`stepsOf`). A directive is one row of
 * `GRAMMAR`; adding a block is one row here plus one case in `renderGuideDoc`.
 *
 * The tree is plain data (no React, no functions) so it can be built anywhere.
 * Every node carries its 1-based source `line`, so sections can be derived by
 * slicing the flat `doc` at its heading nodes.
 *
 * Keep this module dependency-free and erasable-syntax only: the check script
 * imports it with Node's built-in type stripping, which cannot resolve
 * extensionless relative imports.
 */

export type GuideDiagnosticKind =
  | "unknown"
  | "malformed"
  | "stray-close"
  | "unclosed"
  | "nested"
  | "malformed-heading"
  | "empty-block"
  | "ignored-line";

export interface GuideDiagnostic {
  /** 1-based line number within the content string. */
  line: number;
  kind: GuideDiagnosticKind;
  text: string;
  message: string;
  directive?: string;
}

export interface GuideStep { title: string; body: string }
export interface GuideCard { status: "available" | "roadmap" | "disabled"; title: string; description: string; imageBase?: string }
export type CalloutVariant = "tip" | "warning" | "info" | "success";

type At = { line: number };
export type GuideNode =
  | (At & { type: "heading"; depth: 1 | 2 | 3 | 4; text: string; id: string })
  | (At & { type: "paragraph"; text: string })
  | (At & { type: "code"; text: string; lang?: string; lineNumbers?: boolean; highlight?: string })
  | (At & { type: "hr" })
  | (At & { type: "blockquote"; text: string })
  | (At & { type: "ul"; items: { depth: number; content: string }[] })
  | (At & { type: "ol"; items: string[] })
  | (At & { type: "table"; headers: string[]; rows: string[][] })
  | (At & { type: "callout"; variant: CalloutVariant; text: string })
  | (At & { type: "steps"; steps: GuideStep[] })
  | (At & { type: "keys"; shortcuts: { combo: string; description: string }[] })
  | (At & { type: "compare"; items: { title: string; body: string; highlight?: boolean }[] })
  | (At & { type: "diagram"; nodes: { label: string; arrow?: boolean }[] })
  | (At & { type: "feature"; title: string; body: string; color?: string })
  | (At & { type: "checklist"; items: string[] })
  | (At & { type: "usecases"; items: { title: string; scenario: string; outcome: string }[] })
  | (At & { type: "code-compare"; before: string; after: string; beforeLabel?: string; afterLabel?: string })
  | (At & { type: "tabs"; tabs: { label: string; paragraphs: string[] }[] })
  | (At & { type: "cli"; lines: string[] })
  | (At & { type: "callout-stack"; items: { variant: CalloutVariant; text: string }[] })
  | (At & { type: "cards"; items: GuideCard[] });

export interface GuideDoc { doc: GuideNode[]; diagnostics: GuideDiagnostic[] }

/** A grammar returns the node payload (null = nothing usable) and the body indexes it could not use. */
type Payload = { [key: string]: unknown; type: string };
type Grammar = (body: string[], ignore: (i: number) => void) => Payload | null;

// ── Heading ids: one assigner per document, in document order ──────────────

export function slugifyHeading(text: string): string {
  const stripped = text
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");
  return stripped.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Dedups (`-2`, `-3`) and falls back to `section-N` for unslugifiable headings. */
export function createHeadingIdAssigner(): (rawText: string) => string {
  const usedSlugs = new Map<string, number>();
  let fallback = 0;
  return (rawText) => {
    const baseSlug = slugifyHeading(rawText) || `section-${fallback++}`;
    const count = usedSlugs.get(baseSlug) ?? 0;
    usedSlugs.set(baseSlug, count + 1);
    return count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
  };
}

// ── Directive grammars ──────────────────────────────────────────────────────

const DASH = "[\\u2014\\u2013-]";
const STEP = new RegExp(`^\\d+\\.\\s+\\*\\*(.+?)\\*\\*\\s*(?:${DASH}\\s*)?(.*)$`);
const KEY = new RegExp(`^(.+?)\\s*${DASH}\\s+(.+)$`);
const SUB_HEADING = /^###?\s+(.+)$/;
const RULE = /^---+$/;
const appendTo = (text: string, line: string) => `${text}${text ? " " : ""}${line}`;
const nonEmpty = <T>(items: T[], payload: Payload): Payload | null => (items.length > 0 ? payload : null);

function callout(variant: CalloutVariant): Grammar {
  return (body) => {
    const text = body.filter((l) => l.trim()).join(" ").trim();
    return text ? { type: "callout", variant, text } : null;
  };
}

const GRAMMAR: Record<string, Grammar> = {
  steps(body, ignore) {
    const steps: GuideStep[] = [];
    body.forEach((line, i) => {
      const m = line.match(STEP);
      if (m) steps.push({ title: m[1], body: m[2] });
      else if (line.trim() && steps.length > 0) steps[steps.length - 1].body = appendTo(steps[steps.length - 1].body, line.trim());
      else if (line.trim()) ignore(i);
    });
    return nonEmpty(steps, { type: "steps", steps });
  },
  keys(body, ignore) {
    const shortcuts: { combo: string; description: string }[] = [];
    body.forEach((line, i) => {
      const m = line.match(KEY);
      if (m) shortcuts.push({ combo: m[1].trim(), description: m[2].trim() });
      else if (line.trim()) ignore(i);
    });
    return nonEmpty(shortcuts, { type: "keys", shortcuts });
  },
  compare(body) {
    const items: { title: string; body: string; highlight?: boolean }[] = [];
    let current: { title: string; body: string; highlight?: boolean } | null = null;
    for (const line of body) {
      if (RULE.test(line.trim())) {
        if (current) items.push(current);
        current = null;
        continue;
      }
      const title = line.match(/^\*\*(.+?)\*\*\s*(\[recommended\])?\s*$/);
      if (title && (!current || !current.body)) {
        if (current) items.push(current);
        current = { title: title[1], body: "", highlight: !!title[2] };
      } else if (line.trim()) {
        current ??= { title: "", body: "" };
        current.body = appendTo(current.body, line.trim());
      }
    }
    if (current) items.push(current);
    return nonEmpty(items, { type: "compare", items });
  },
  diagram(body) {
    const nodes: { label: string; arrow?: boolean }[] = [];
    for (const line of body) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/^-+>$/.test(trimmed)) {
        if (nodes.length > 0) nodes.push({ label: "", arrow: true });
        continue;
      }
      trimmed.split(/\s*-+>\s*/).forEach((part, index) => {
        const label = part.replace(/^\[|\]$/g, "").trim();
        if (label) nodes.push(index > 0 || nodes.length > 0 ? { label, arrow: true } : { label });
      });
    }
    return nonEmpty(nodes, { type: "diagram", nodes });
  },
  feature(body) {
    let title = "";
    let color: string | undefined;
    const parts: string[] = [];
    for (const line of body) {
      const m = line.match(/^\*\*(.+?)\*\*\s*(?:color=(\S+))?\s*$/);
      if (m && !title) {
        title = m[1];
        color = m[2];
      } else if (line.trim()) parts.push(line.trim());
    }
    if (!title && parts.length === 0) return null;
    return { type: "feature", title, body: parts.join(" "), ...(color ? { color } : {}) };
  },
  checklist(body) {
    const items = body.map((line) => line.match(/^\s*[-*]\s+(.+)$/)?.[1]?.trim() ?? line.trim()).filter(Boolean);
    return nonEmpty(items, { type: "checklist", items });
  },
  usecases(body) {
    const items: { title: string; scenario: string; outcome: string }[] = [];
    let cur = { title: "", scenario: "", outcome: "" };
    let phase: "scenario" | "outcome" = "scenario";
    const flush = () => {
      if (cur.title || cur.scenario || cur.outcome) items.push(cur);
      cur = { title: "", scenario: "", outcome: "" };
      phase = "scenario";
    };
    for (const line of body) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/^===+$/.test(trimmed)) flush();
      else if (RULE.test(trimmed)) phase = "outcome";
      else {
        const title = trimmed.match(/^\*\*(.+?)\*\*\s*$/);
        if (title && !cur.title) cur.title = title[1];
        else cur[phase] = appendTo(cur[phase], trimmed);
      }
    }
    flush();
    return nonEmpty(items, { type: "usecases", items });
  },
  // The side comes from structure: the `---` separator, or a second heading,
  // starts the after panel. Labels are the authors' headings, in any language.
  "code-compare"(body) {
    const sides = { before: [] as string[], after: [] as string[] };
    const labels: { beforeLabel?: string; afterLabel?: string } = {};
    let side: "before" | "after" = "before";
    for (const line of body) {
      const head = line.match(SUB_HEADING);
      if (head) {
        if (side === "before" && (labels.beforeLabel !== undefined || sides.before.some((l) => l.trim()))) side = "after";
        labels[side === "before" ? "beforeLabel" : "afterLabel"] = head[1].trim();
      } else if (RULE.test(line.trim())) side = "after";
      else sides[side].push(line);
    }
    const before = sides.before.join("\n").trim();
    const after = sides.after.join("\n").trim();
    return before || after ? { type: "code-compare", before, after, ...labels } : null;
  },
  tabs(body, ignore) {
    const tabs: { label: string; content: string[] }[] = [];
    body.forEach((line, i) => {
      const head = line.match(SUB_HEADING);
      if (head) tabs.push({ label: head[1].trim(), content: [] });
      else if (tabs.length > 0) tabs[tabs.length - 1].content.push(line);
      else if (line.trim()) ignore(i);
    });
    return nonEmpty(tabs, {
      type: "tabs",
      tabs: tabs.map((t) => ({
        label: t.label,
        paragraphs: t.content.join("\n").trim().split(/\n{2,}/).filter((p) => p.trim()).map((p) => p.trim()),
      })),
    });
  },
  cli(body) {
    return body.some((l) => l.trim()) ? { type: "cli", lines: body } : null;
  },
  "callout-stack"(body, ignore) {
    const items: { variant: CalloutVariant; text: string }[] = [];
    body.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const m = trimmed.match(/^\[(tip|warning|info|success)\]\s*(.*)$/i);
      if (m) items.push({ variant: m[1].toLowerCase() as CalloutVariant, text: m[2] });
      else if (items.length > 0) items[items.length - 1].text = appendTo(items[items.length - 1].text, trimmed);
      else ignore(i);
    });
    return nonEmpty(items, { type: "callout-stack", items });
  },
  cards(body, ignore) {
    const items: GuideCard[] = [];
    body.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const m = trimmed.match(/^\[(available|roadmap|disabled)\]\s*(.+)$/i);
      const [title, description, imageBase] = m ? m[2].split("|").map((p) => p.trim()) : [];
      if (!m || !title) return ignore(i);
      items.push({ status: m[1].toLowerCase() as GuideCard["status"], title, description: description ?? "", ...(imageBase ? { imageBase } : {}) });
    });
    return nonEmpty(items, { type: "cards", items });
  },
  tip: callout("tip"),
  warning: callout("warning"),
  info: callout("info"),
  success: callout("success"),
};

/** The closed directive vocabulary, derived from the grammar table. */
export const KNOWN_DIRECTIVES: ReadonlySet<string> = new Set(Object.keys(GRAMMAR));

/** The opener form the grammar accepts: `:::name`, nothing else on the line. */
export const DIRECTIVE_OPENER = /^:::([\w-]+)$/;

/** The heading form the grammar accepts: `#` to `####` at column 0, a space, text. */
export const HEADING = /^(#{1,4})\s+(.+)$/;

const UL_ITEM = /^\s*[-*]\s/;
const OL_ITEM = /^\s*\d+\.\s/;
const TABLE_ROW = /^\|.+\|/;

function isBlockStart(line: string): boolean {
  const t = line.trimStart();
  return t.startsWith("#") || t.startsWith("```") || t.startsWith(":::") || RULE.test(t) ||
    t.startsWith("> ") || UL_ITEM.test(line) || OL_ITEM.test(line) || TABLE_ROW.test(t);
}

// ── The walker ─────────────────────────────────────────────────────────────

export function parseGuide(input: string | readonly string[]): GuideDoc {
  const lines = typeof input === "string" ? input.split("\n") : input;
  const doc: GuideNode[] = [];
  const diagnostics: GuideDiagnostic[] = [];
  const assignId = createHeadingIdAssigner();
  const report = (index: number, kind: GuideDiagnosticKind, message: string, directive?: string) =>
    diagnostics.push({ line: index + 1, kind, text: lines[index], message, ...(directive ? { directive } : {}) });
  const push = (node: GuideNode) => doc.push(node);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const start = i;
    const at = { line: start + 1 };
    const trimmed = line.trimStart();
    if (line.trim() === "") {
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const fence = line.trim().slice(3).trim();
      const hl = fence.match(/\{hl=([^}]+)\}/);
      const [lang, ...mods] = (hl ? fence.replace(hl[0], "").trim() : fence).split(":");
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) code.push(lines[i++]);
      i++;
      push({
        type: "code", ...at, text: code.join("\n"),
        ...(lang ? { lang } : {}),
        ...(mods.some((m) => m === "line-numbers" || m === "ln") ? { lineNumbers: true } : {}),
        ...(hl ? { highlight: hl[1] } : {}),
      });
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      push({ type: "heading", ...at, depth: heading[1].length as 1 | 2 | 3 | 4, text: heading[2], id: assignId(heading[2]) });
      i++;
      continue;
    }

    if (RULE.test(line.trim())) {
      push({ type: "hr", ...at });
      i++;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("> ")) quote.push(lines[i++].replace(/^>\s?/, ""));
      push({ type: "blockquote", ...at, text: quote.join(" ").trim() });
      continue;
    }

    if (UL_ITEM.test(line)) {
      const items: { depth: number; content: string }[] = [];
      for (; i < lines.length && (UL_ITEM.test(lines[i]) || lines[i].trim() === ""); i++) {
        const m = lines[i].match(/^(\s*)[-*]\s(.+)$/);
        if (m) items.push({ depth: Math.floor(m[1].length / 2), content: m[2] });
      }
      push({ type: "ul", ...at, items });
      continue;
    }

    if (OL_ITEM.test(line)) {
      const items: string[] = [];
      for (; i < lines.length && (OL_ITEM.test(lines[i]) || lines[i].trim() === ""); i++) {
        const m = lines[i].match(/^\s*\d+\.\s(.+)$/);
        if (m) items.push(m[1]);
      }
      push({ type: "ol", ...at, items });
      continue;
    }

    if (trimmed.startsWith(":::")) {
      i++;
      const opener = trimmed.match(DIRECTIVE_OPENER);
      if (!opener) {
        if (trimmed.trim() === ":::") report(start, "stray-close", "closing ::: with no open directive");
        else report(start, "malformed", "directive opener must be ':::name' alone on its line");
        continue;
      }
      const name = opener[1];
      const grammar = KNOWN_DIRECTIVES.has(name) ? GRAMMAR[name] : undefined;
      if (!grammar) report(start, "unknown", `unknown directive ':::${name}' renders nothing`, name);
      const body: string[] = [];
      while (i < lines.length && !lines[i].trimStart().startsWith(":::")) body.push(lines[i++]);
      const broken = i >= lines.length || lines[i].trim() !== ":::";
      if (i >= lines.length) report(start, "unclosed", `':::${name}' is never closed and swallows the rest of the content`, name);
      else if (lines[i].trim() !== ":::") report(i, "nested", `'${lines[i].trim()}' closes ':::${name}' (directives cannot nest)`, name);
      i++;
      if (!grammar) continue;
      const ignored: number[] = [];
      const payload = grammar(body, (k) => ignored.push(k));
      // A nested or unclosed block is already reported; its payload is not
      // what the author meant, so it gets no second, derived diagnostic.
      if (!payload) {
        if (!broken) report(start, "empty-block", `':::${name}' has no valid content and renders nothing`, name);
        continue;
      }
      if (!broken) for (const k of ignored) report(start + 1 + k, "ignored-line", `line inside ':::${name}' does not match its item form and is not rendered`, name);
      push({ ...payload, ...at } as GuideNode);
      continue;
    }

    if (TABLE_ROW.test(trimmed)) {
      const rows: string[][] = [];
      while (i < lines.length && TABLE_ROW.test(lines[i].trimStart())) rows.push(lines[i++].split("|").slice(1, -1).map((c) => c.trim()));
      if (rows.length >= 2) {
        const separator = /^[\s|:-]*$/.test(rows[1].join(""));
        push({ type: "table", ...at, headers: rows[0], rows: rows.slice(separator ? 2 : 1) });
      }
      continue;
    }

    // No block branch took the line, so it opens a paragraph unconditionally:
    // `#####`, `#tag` or an indented `# x` render as text instead of stalling.
    if (trimmed.startsWith("#")) report(start, "malformed-heading", "heading must be '#' to '####' at the line start, then a space and text; renders as plain text");
    const para = [lines[i++]];
    while (i < lines.length && lines[i].trim() !== "" && !isBlockStart(lines[i])) para.push(lines[i++]);
    push({ type: "paragraph", ...at, text: para.join(" ") });
  }
  return { doc, diagnostics };
}

// ── Projections ─────────────────────────────────────────────────────────────

export interface GuideHeading {
  id: string;
  text: string;
  /** Source depth 1-4; the renderer draws it one level lower (h2-h4). */
  depth: 1 | 2 | 3 | 4;
  tabLabels?: string[];
}

const stripInline = (text: string) =>
  text
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1");

/** The TOC: every heading the renderer renders, plus `:::tabs` labels on the heading above them. */
export function headingsOf(doc: readonly GuideNode[]): GuideHeading[] {
  const out: GuideHeading[] = [];
  for (const node of doc) {
    if (node.type === "heading") out.push({ id: node.id, text: stripInline(node.text), depth: node.depth });
    else if (node.type === "tabs" && out.length > 0) {
      const last = out[out.length - 1];
      last.tabLabels = [...(last.tabLabels ?? []), ...node.tabs.map((t) => t.label)];
    }
  }
  return out;
}

/** Every `:::steps` item in document order, exactly as StepWizard receives them. */
export function stepsOf(doc: readonly GuideNode[]): GuideStep[] {
  return doc.flatMap((node) => (node.type === "steps" ? node.steps : []));
}

/** One heading's stretch of the document, as plain searchable text. */
export interface GuideSection {
  /** The heading's rendered id; `null` for the preamble before the first heading. */
  id: string | null;
  /** The heading's TOC text (`""` for the preamble). */
  text: string;
  /** Source depth 1-4; 0 for the preamble. */
  depth: 0 | 1 | 2 | 3 | 4;
  tabLabels?: string[];
  /** Inline-stripped text of every node up to the next heading (code blocks excluded). */
  body: string;
}

/** The words a node shows the reader, with inline markup still in place. Code is not prose. */
function nodeWords(node: GuideNode): string[] {
  switch (node.type) {
    case "heading": case "hr": case "code": return [];
    case "paragraph": case "blockquote": case "callout": return [node.text];
    case "ul": return node.items.map((item) => item.content);
    case "ol": case "checklist": return node.items;
    case "cli": return node.lines;
    case "table": return [...node.headers, ...node.rows.flat()];
    case "steps": return node.steps.flatMap((s) => [s.title, s.body]);
    case "keys": return node.shortcuts.flatMap((s) => [s.combo, s.description]);
    case "feature": return [node.title, node.body];
    case "compare": return node.items.flatMap((c) => [c.title, c.body]);
    case "diagram": return node.nodes.map((n) => n.label);
    case "usecases": return node.items.flatMap((u) => [u.title, u.scenario, u.outcome]);
    case "code-compare": return [node.beforeLabel ?? "", node.before, node.afterLabel ?? "", node.after];
    case "tabs": return node.tabs.flatMap((t) => [t.label, ...t.paragraphs]);
    case "callout-stack": return node.items.map((c) => c.text);
    case "cards": return node.items.flatMap((c) => [c.title, c.description]);
  }
}

// Images and any inline `:::name` token (prose that mentions a directive) are not words a reader sees.
const plain = (words: string[]) =>
  stripInline(words.join(" ").replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/:::[\w-]*/g, " ")).replace(/\s+/g, " ").trim();

/**
 * The document sliced at its heading nodes: an optional preamble (`id: null`),
 * then one section per heading carrying exactly that heading's TOC fields. A
 * directive belongs to the section it sits in, so `:::tabs` labels never start
 * one. Search indexes these, so every anchor it hands out is a rendered id.
 */
export function sectionsOf(doc: readonly GuideNode[]): GuideSection[] {
  const headings = headingsOf(doc);
  const out: { head: GuideHeading | null; words: string[] }[] = [{ head: null, words: [] }];
  for (const node of doc) {
    if (node.type === "heading") out.push({ head: headings[out.length - 1], words: [] });
    else out[out.length - 1].words.push(...nodeWords(node));
  }
  return out.flatMap(({ head, words }): GuideSection[] => {
    const body = plain(words);
    if (!head) return body ? [{ id: null, text: "", depth: 0, body }] : [];
    return [{ ...head, body }];
  });
}
