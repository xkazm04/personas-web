import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Adoption guard for the capture wrapper.
 *
 * `captureExceptionScrubbed` (src/lib/sentry-pii.ts) is the house rule for
 * every outbound error: it destroys identifiers in `error.message` and
 * `error.stack` BEFORE the payload enters the SDK's queue, which the global
 * `beforeSend` hook cannot do. The rule was enforced socially and had decayed
 * to roughly a quarter of call sites — 24 raw against 8 wrapped — because a raw
 * `Sentry.captureException` is the shorter thing to type and nothing objected.
 *
 * This spec is the thing that objects. A new raw capture fails `test:unit`
 * with the file and line, at the moment it is written.
 *
 * A genuinely raw capture is allowed — add the file below WITH a reason. The
 * bar: the payload is provably free of anything user-derived, or the call is
 * inside the scrubber itself.
 */
const ALLOWED_RAW = new Map<string, string>([
  [
    "src/lib/sentry-pii.ts",
    "The wrapper's own delegation — its argument has already been through scrubPii().",
  ],
]);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const SRC_ROOT = path.join(REPO_ROOT, "src");
const SELF = path.relative(REPO_ROOT, fileURLToPath(import.meta.url)).replaceAll("\\", "/");

const ROOT_FILES = ["sentry.client.config.ts", "sentry.edge.config.ts", "sentry.server.config.ts"];

// `Sentry.captureException(...)` and `import { captureException } from "@sentry/nextjs"`.
const RAW_MEMBER_CALL = /(^|[^\w$.])Sentry\s*\.\s*captureException\s*\(/;
const RAW_NAMED_IMPORT = /import\s*\{[^}]*\bcaptureException\b[^}]*\}\s*from\s*["']@sentry\/nextjs["']/;

/** Blank out comments so prose about the rule is not mistaken for a call. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, lead: string) => lead);
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function findRawCaptures() {
  const files = [...walk(SRC_ROOT), ...ROOT_FILES.map((f) => path.join(REPO_ROOT, f))];
  const offenders: string[] = [];
  for (const file of files) {
    const rel = path.relative(REPO_ROOT, file).replaceAll("\\", "/");
    if (rel === SELF || ALLOWED_RAW.has(rel)) continue;
    const lines = stripComments(readFileSync(file, "utf8")).split("\n");
    lines.forEach((line, i) => {
      if (RAW_MEMBER_CALL.test(line) || RAW_NAMED_IMPORT.test(line)) {
        offenders.push(`${rel}:${i + 1}`);
      }
    });
  }
  return offenders;
}

describe("Sentry capture wrapper adoption", () => {
  it("routes every capture through captureExceptionScrubbed", () => {
    expect(findRawCaptures(), [
      "Raw Sentry.captureException found. Use:",
      '  import { captureExceptionScrubbed } from "@/lib/sentry-pii";',
      "It scrubs error.message and error.stack before the payload reaches the",
      "SDK queue — beforeSend cannot reach either. If this call site is",
      "genuinely PII-free, add it to ALLOWED_RAW in this file with a reason.",
    ].join("\n")).toEqual([]);
  });

  it("keeps every allowlist entry justified in writing", () => {
    for (const [file, reason] of ALLOWED_RAW) {
      expect(reason.length, `${file} needs a real reason, not a placeholder`).toBeGreaterThan(30);
    }
  });

  it("detects a raw capture when one exists (the guard is not vacuous)", () => {
    // Proves the matcher itself works: a guard that can never fire is not a
    // guard. Runs against strings, so it cannot be broken by repo edits.
    expect(RAW_MEMBER_CALL.test("        Sentry.captureException(err, { tags: {} });")).toBe(true);
    expect(RAW_MEMBER_CALL.test("Sentry . captureException (err)")).toBe(true);
    expect(RAW_NAMED_IMPORT.test('import { captureException } from "@sentry/nextjs";')).toBe(true);
    expect(RAW_MEMBER_CALL.test("captureExceptionScrubbed(err, { tags: {} });")).toBe(false);
    expect(stripComments("// Sentry.captureException(err) in prose").trim()).toBe("");
  });
});
