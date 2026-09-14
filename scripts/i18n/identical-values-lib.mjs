// Pure logic for the identical-to-English report (report-identical-values.mjs).
//
// Two techniques from the ai-registry localization bundle, applied as written:
//
// - non-translatable-value-classification: decide on the WHOLE value whether it
//   is language at all. Classes: empty or whitespace-only, pure number, boolean
//   literal, machine (ISO) date, system identifier, URL. The classifier never
//   carves substrings out of a sentence, and it errs toward translating: a short
//   token (OK, NEW, ON) or a plain capitalized or hyphenated word is language.
// - source-identical-value-audit: after that exclusion, a value identical to the
//   English value is candidate evidence of untranslatedness. Identity is evidence;
//   difference is evidence of nothing. The output is a count, not a grade.
//
// The contract's accepted terms (docs/i18n/copy-contract.json terms.accept) are a
// seventh, decided exclusion: a whole value that IS one of those terms.

export const CLASSES = Object.freeze([
  "empty",
  "numeric",
  "boolean",
  "iso-date",
  "url",
  "identifier",
  "accepted-term",
]);

// Identifier floor. Below this length a token is treated as a word, whatever its
// composition (the classifier's "short tokens through" rule).
export const IDENTIFIER_MIN_LENGTH = 8;

const NUMERAL = /^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/;
const BOOLEAN = /^(?:true|false)$/;
const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
const URL_VALUE = /^(?:[a-z][a-z0-9+.-]*:\/\/|mailto:|www\.)\S+$/i;
const TOKEN_CHARS = /^[A-Za-z0-9._:/-]+$/;

/**
 * A system identifier: no whitespace, at least IDENTIFIER_MIN_LENGTH characters of
 * token characters, and a composition no ordinary word has: letters mixed with
 * digits (claude-opus-4-7), an internal case change (KpiTile), or an internal
 * `_`, `.` or `:` separator (snake_case, file.name, ns:key). A hyphen or slash
 * alone does not qualify, because hyphenated and slashed words are language
 * (Event-Based, auto-scaling, input/output).
 */
export function isIdentifierLike(value) {
  if (value.length < IDENTIFIER_MIN_LENGTH) return false;
  if (!TOKEN_CHARS.test(value)) return false;
  const lettersAndDigits = /[A-Za-z]/.test(value) && /\d/.test(value);
  const internalCaseChange = /[a-z][A-Z]/.test(value);
  const internalSeparator = /[A-Za-z0-9][_.:][A-Za-z0-9]/.test(value);
  return lettersAndDigits || internalCaseChange || internalSeparator;
}

/**
 * Returns the non-translatable class of a whole value, or null when the value is
 * language (the default: err toward translating).
 */
export function classifyNonTranslatable(value, acceptedTerms = new Set()) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return "empty";
  if (NUMERAL.test(trimmed)) return "numeric";
  if (BOOLEAN.test(trimmed)) return "boolean";
  if (ISO_DATE.test(trimmed)) return "iso-date";
  if (URL_VALUE.test(trimmed)) return "url";
  if (isIdentifierLike(trimmed)) return "identifier";
  if (acceptedTerms.has(trimmed)) return "accepted-term";
  return null;
}

/** Flattens a locale tree to Map<dotted key path, string leaf>. Arrays index by position. */
export function collectLeaves(node, prefix = [], out = new Map()) {
  if (typeof node === "string") {
    out.set(prefix.join("."), node);
  } else if (Array.isArray(node)) {
    node.forEach((child, index) => collectLeaves(child, [...prefix, String(index)], out));
  } else if (node && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) collectLeaves(child, [...prefix, key], out);
  }
  return out;
}

/**
 * Compares one locale's leaves against the source leaves.
 *
 * - notCompared: source strings with no string at the same key in the locale file
 *   (the runtime deep-merge renders English there; key parity is the coverage
 *   checker's job, not this report's).
 * - checked: source strings the locale file does carry.
 * - excluded / byClass: checked values whose SOURCE value is not language.
 * - excludedButDiffers: excluded values the locale changed anyway. Identity is what
 *   a pipeline honouring the classes would write, so every one of these is worth a
 *   look (something translated a number, identifier, URL or accepted term).
 * - identical: keys of checked, non-excluded values equal to the source value.
 */
export function auditLocale(sourceLeaves, targetLeaves, acceptedTerms = new Set()) {
  const byClass = Object.fromEntries(CLASSES.map((name) => [name, 0]));
  let checked = 0;
  let excluded = 0;
  let notCompared = 0;
  const identical = [];
  const differs = [];

  for (const [key, sourceValue] of sourceLeaves) {
    const targetValue = targetLeaves.get(key);
    if (typeof targetValue !== "string") {
      notCompared += 1;
      continue;
    }
    checked += 1;
    const valueClass = classifyNonTranslatable(sourceValue, acceptedTerms);
    if (valueClass) {
      excluded += 1;
      byClass[valueClass] += 1;
      if (targetValue !== sourceValue) differs.push(key);
      continue;
    }
    if (targetValue === sourceValue) identical.push(key);
  }

  return {
    checked,
    excluded,
    byClass,
    excludedButDiffers: differs.length,
    differs,
    notCompared,
    identical,
  };
}

/** Keys identical in every audited locale: the bootstrap seed for a reviewed allowlist. */
export function identicalInEveryLocale(results) {
  const lists = Object.values(results).map((result) => new Set(result.identical));
  if (lists.length === 0) return [];
  const [first, ...rest] = lists;
  return [...first].filter((key) => rest.every((set) => set.has(key))).sort();
}
