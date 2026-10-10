/**
 * The guide's directive/heading diagnostics, as a lint entry point.
 *
 * Not a second scan: `lintDirectives` is `parseGuide(lines).diagnostics`, the
 * grammar's own report (unknown, malformed, stray-close, unclosed, nested,
 * malformed-heading, and the payload kinds empty-block and ignored-line).
 * `scripts/check-guide-content.mjs` imports `parseGuide.ts` directly, since
 * Node's type stripping cannot follow this module's extensionless re-export.
 */
import { parseGuide, type GuideDiagnostic, type GuideDiagnosticKind } from "./parseGuide";

export { DIRECTIVE_OPENER, HEADING, KNOWN_DIRECTIVES } from "./parseGuide";

export type DirectiveIssueKind = GuideDiagnosticKind;
export type DirectiveIssue = GuideDiagnostic;

export function lintDirectives(lines: readonly string[]): DirectiveIssue[] {
  return parseGuide(lines).diagnostics;
}
