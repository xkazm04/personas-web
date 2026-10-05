/**
 * Static check for the guide's `:::name` ... `:::` directives.
 *
 * The renderer (`parseBlocks` -> `parseCustomBlock`) drops a directive it does
 * not recognise and skips a malformed `:::` line, so a typo in content loses a
 * block without a trace. This scan mirrors the renderer's directive handling
 * so the loss can be caught before it ships:
 *
 * - `npm run check:guide-content` runs it over every content module (English
 *   and all locales) and fails on any issue;
 * - `parseBlocks` runs it in development and logs each issue.
 *
 * It mirrors the renderer exactly, including its limits: a top-level code
 * fence hides `:::` lines, but inside a directive the first line starting with
 * `:::` closes it (nesting is not supported).
 *
 * Keep this module dependency-free and erasable-syntax only: the check script
 * imports it with Node's built-in type stripping.
 */

/** Directive names `parseCustomBlock` renders (pinned by directiveLint.test.ts). */
export const KNOWN_DIRECTIVES: ReadonlySet<string> = new Set([
  "steps",
  "keys",
  "compare",
  "diagram",
  "feature",
  "checklist",
  "usecases",
  "code-compare",
  "tabs",
  "cli",
  "callout-stack",
  "cards",
  "tip",
  "warning",
  "info",
  "success",
]);

export type DirectiveIssueKind = "unknown" | "malformed" | "stray-close" | "unclosed" | "nested";

export interface DirectiveIssue {
  /** 1-based line number within the content string. */
  line: number;
  kind: DirectiveIssueKind;
  text: string;
  message: string;
}

/** The opener form the renderer accepts: `:::name`, nothing else on the line. */
export const DIRECTIVE_OPENER = /^:::([\w-]+)$/;

export function lintDirectives(lines: readonly string[]): DirectiveIssue[] {
  const issues: DirectiveIssue[] = [];
  const add = (index: number, kind: DirectiveIssueKind, message: string) =>
    issues.push({ line: index + 1, kind, text: lines[index], message });

  let index = 0;
  while (index < lines.length) {
    const trimmed = lines[index].trimStart();

    if (trimmed.startsWith("```")) {
      index++;
      while (index < lines.length && !lines[index].trimStart().startsWith("```")) index++;
      index++;
      continue;
    }

    if (!trimmed.startsWith(":::")) {
      index++;
      continue;
    }

    const opener = trimmed.match(DIRECTIVE_OPENER);
    if (!opener) {
      if (trimmed.trim() === ":::") add(index, "stray-close", "closing ::: with no open directive");
      else add(index, "malformed", "directive opener must be ':::name' alone on its line");
      index++;
      continue;
    }

    const openIndex = index;
    if (!KNOWN_DIRECTIVES.has(opener[1])) {
      add(openIndex, "unknown", `unknown directive ':::${opener[1]}' renders nothing`);
    }
    index++;
    while (index < lines.length && !lines[index].trimStart().startsWith(":::")) index++;
    if (index >= lines.length) {
      add(openIndex, "unclosed", `':::${opener[1]}' is never closed and swallows the rest of the content`);
    } else if (lines[index].trim() !== ":::") {
      add(index, "nested", `'${lines[index].trim()}' closes ':::${opener[1]}' (directives cannot nest)`);
    }
    index++;
  }
  return issues;
}
