import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { de } from "@/i18n/de";
import {
  AUTO_APPROVE_NOTE,
  RESOLVED_BY_REVIEWER,
  RESOLVED_BY_SYSTEM,
  formatAge,
  resolverLabel,
  reviewerNotesText,
} from "./review-display";

/**
 * The Manual Review Queue renders no hardcoded English: every visible string,
 * aria-label and title comes from `t.*` or from `Intl` (ages, the undo
 * countdown). This scans the context's rendering files (comments stripped by
 * parsing) and fails on prose-shaped literals and JSX text.
 */

const ROOT = path.resolve(__dirname, "..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(name) && !name.endsWith(".test.ts") ? [full] : [];
  });
}

const SURFACE_FILES = [
  ...walk(path.join(ROOT, "app", "dashboard", "reviews")),
  ...walk(path.join(ROOT, "components", "dashboard", "batch-review-modal")),
  ...[
    "components/BulkProgressBar.tsx",
    "components/BulkResultToast.tsx",
    "components/ConfirmDialog.tsx",
    "components/UndoToast.tsx",
    "components/dashboard/BatchReviewModal.tsx",
  ].map((f) => path.join(ROOT, f)),
];

/**
 * Non-user-facing literals the scan would otherwise flag, by exact text:
 * KeyboardEvent.key names compared in handlers and keyboard-key glyphs rendered
 * inside <kbd> (the physical key, identical in every locale).
 */
const ALLOWED_LITERALS = new Set(["Escape", "Enter", "A", "R", "S", "J", "K"]);

/** A literal that reads as English copy rather than an id, enum or class list. */
function looksLikeCopy(text: string): boolean {
  const s = text.trim();
  if (!/[A-Za-z]/.test(s)) return false;
  // Template placeholders ("{count}"), DOM tag names ("TEXTAREA"), camelCase
  // identifiers / enum values ("easeOut", "pending"), attribute selectors.
  // A word padded with spaces (" by ") is a prose fragment, not an identifier.
  const bare = s === text;
  if (/^\{\w+\}$/.test(s) || /^[A-Z][A-Z0-9_]+$/.test(s) || (bare && /^[a-z][A-Za-z0-9]*$/.test(s))) return false;
  if (/^\[[\w-]+\]$/.test(s)) return false;
  // Tailwind class lists / ids / enum values: lowercase tokens with -, :, /, [, ].
  if (/^[a-z0-9\-:/.\[\]()%_#!\s]*$/.test(s) && !/\b(by|of|and|the|failed|reviews?)\b/.test(s)) return false;
  // CSS values such as "9999px 0 0 9999px", "100%".
  if (/^[\d\s.%a-z]*$/.test(s) && /\d/.test(s)) return false;
  return true;
}

interface Finding {
  file: string;
  line: number;
  text: string;
}

function scan(file: string): Finding[] {
  const source = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out: Finding[] = [];
  const add = (node: ts.Node, text: string) =>
    out.push({ file: path.relative(ROOT, file), line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, text });

  function insideClassName(node: ts.Node): boolean {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isJsxAttribute(p)) return /^(className|style|key|id|aria-labelledby|data-[\w-]+)$/.test(p.name.getText(sf));
      if (ts.isPropertyAssignment(p) && /^(className|pill|tone|color|dotColor|borderRadius|width|animation)$/.test(p.name.getText(sf))) return true;
    }
    return false;
  }

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    if (ts.isJsxText(node)) {
      const text = node.getText(sf).trim();
      if (/[A-Za-z]/.test(text) && !ALLOWED_LITERALS.has(text)) add(node, text);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (!insideClassName(node) && !ALLOWED_LITERALS.has(node.text) && looksLikeCopy(node.text)) add(node, node.text);
    } else if (ts.isTemplateExpression(node)) {
      if (!insideClassName(node)) {
        const parts = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)];
        for (const part of parts) if (looksLikeCopy(part)) add(node, part);
      }
    } else if (
      ts.isJsxExpression(node) &&
      !ts.isJsxAttribute(node.parent) &&
      node.expression &&
      /\.(severity|status|resolvedBy)$/.test(node.expression.getText(sf))
    ) {
      // An English enum value / stored sentinel rendered as visible text.
      add(node, node.getText(sf));
    } else if (ts.isCallExpression(node) && node.expression.getText(sf) === "relativeTime") {
      // English-only "5m ago" helper; the queue formats ages with Intl.
      add(node, node.getText(sf));
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return out;
}

describe("review queue renders no hardcoded English", () => {
  it("covers the context's rendering files", () => {
    expect(SURFACE_FILES.length).toBeGreaterThanOrEqual(20);
  });

  it("has zero prose literals, JSX text or relativeTime calls outside the allowlist", () => {
    const findings = SURFACE_FILES.flatMap(scan);
    expect(findings).toEqual([]);
  });

  it("never injects an English plural suffix into a translated template", () => {
    const offenders = SURFACE_FILES.filter((f) => /\{plural\}/.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
    // Every locale: the old template's {plural} slot was filled with an English "s".
    const i18nDir = path.join(ROOT, "i18n");
    const locales = readdirSync(i18nDir).filter((f) => /^[a-z]{2}\.ts$/.test(f));
    expect(locales).toHaveLength(14);
    for (const f of locales) {
      expect(readFileSync(path.join(i18nDir, f), "utf8"), f).not.toContain("{plural}");
    }
  });
});

describe("review-display: stored sentinels read in the viewer's language", () => {
  const copy = { ...en.reviewsPage };
  const deCopy = { ...de.reviewsPage };

  it("maps the resolver sentinels and passes a real name through", () => {
    expect(resolverLabel(RESOLVED_BY_REVIEWER, deCopy)).toBe(de.reviewsPage.resolver.you);
    expect(resolverLabel(RESOLVED_BY_SYSTEM, deCopy)).toBe(de.reviewsPage.resolver.system);
    expect(resolverLabel("Ada Lovelace", copy)).toBe("Ada Lovelace");
    expect(de.reviewsPage.resolver.you).not.toBe(en.reviewsPage.resolver.you);
  });

  it("translates the auto-approve note and leaves a human note verbatim", () => {
    expect(de.reviewsPage.autoApprovedNote).toMatch(/\S/);
    expect(de.reviewsPage.autoApprovedNote).not.toBe(AUTO_APPROVE_NOTE);
    expect(reviewerNotesText(AUTO_APPROVE_NOTE, deCopy)).toBe(de.reviewsPage.autoApprovedNote);
    expect(reviewerNotesText("Looks fine", deCopy)).toBe("Looks fine");
  });

  it("formats an age with Intl in the viewer's locale", () => {
    const now = Date.parse("2026-09-23T12:00:00Z");
    expect(formatAge("2026-09-23T11:44:00Z", now, "en")).toBe("16 minutes ago");
    expect(formatAge("2026-09-23T11:44:00Z", now, "de")).toBe("vor 16 Minuten");
    expect(formatAge("2026-09-21T12:00:00Z", now, "en")).toBe("2 days ago");
    // A clock-skewed future timestamp still reads as the past, never "in 3 minutes".
    expect(formatAge("2026-09-23T12:03:00Z", now, "en")).toBe("1 minute ago");
    expect(formatAge("not a date", now, "en")).toBeNull();
  });
});
