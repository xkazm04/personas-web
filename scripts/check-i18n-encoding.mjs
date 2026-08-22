#!/usr/bin/env node
/**
 * check-i18n-encoding — mojibake ratchet for src/i18n/*.ts.
 *
 * History: locale files have repeatedly been corrupted by editors/tools that
 * read UTF-8 as cp1250/cp1252 and saved the result (e.g. "—" → "â€”",
 * "ě" → "Ä›", Cyrillic → "Đ¾Đ´..."). Commit 5a57d9b even RE-corrupted four
 * locales that had already been repaired. tsc enforces key parity but cannot
 * see this, so the guard lives here and runs on pre-push.
 *
 * Detection: a "UTF-8 lead-byte look-alike" character immediately followed by
 * a "UTF-8 continuation-byte look-alike" (cp1252/cp1250 C1-controls range and
 * Latin-1 punctuation), plus the U+FFFD replacement character. Legit Latin
 * diacritics, CJK, Cyrillic, Arabic, and \uXXXX escapes never match.
 *
 * Ratchet semantics (baseline: scripts/i18n-encoding-baseline.json):
 *   - en.ts must always be at ZERO — it ships to production.
 *   - any other file may not EXCEED its baseline count (new corruption fails;
 *     existing known corruption is tracked until the repair pass lands).
 *   - counts below baseline print a reminder to tighten the ratchet.
 *   - node scripts/check-i18n-encoding.mjs --update-baseline  → rewrite the
 *     baseline to current counts (use only after an intentional repair).
 *
 * Instrument assertions (checked BEFORE any result is reported):
 *   - the locale directory must exist;
 *   - the selected file set must be NON-EMPTY. A checker that walks zero
 *     inputs and exits 0 reports "clean" when it means "blind" — the most
 *     expensive kind of green, because the number it prints is reassuring and
 *     meaningless. Zero files is a broken checker, not a clean repo.
 *   - every file named in the baseline must still be found by the selector.
 *     The baseline doubles as a manifest of what SHOULD be scanned, so if the
 *     selector silently stops matching a file (renamed locale, changed suffix,
 *     a locale moved to a region-coded name), the gate fails loudly instead of
 *     quietly measuring a smaller corpus.
 *
 * Selection: any *.ts in src/i18n that is not a known non-locale module. This
 * is deliberately broader than a bare two-letter match so that region-coded
 * locales (pt-BR.ts, zh-Hant.ts) are covered the day they are added rather
 * than being silently skipped by a gate that still prints OK.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const I18N_DIR = path.join(process.cwd(), "src", "i18n");
const BASELINE_PATH = path.join(process.cwd(), "scripts", "i18n-encoding-baseline.json");

// UTF-8 lead bytes (0xC2-0xDF, 0xE0-0xEF) rendered through cp1252/cp1250.
const LEAD =
  "ÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþ" +
  "ĂĹĎĐĚŃŇŐŔŘŚŞŤŮŰŹŻŽăĺďđěńňőŕřśşťůűźżž";
// UTF-8 continuation bytes (0x80-0xBF) rendered through cp1252/cp1250.
const CONT =
  "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ" +
  " ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿" +
  "ˇ˘Łł˝";
const escapeCls = (s) => s.replace(/[\\\]^-]/g, "\\$&");
const MOJIBAKE = new RegExp(`[${escapeCls(LEAD)}][${escapeCls(CONT)}]|�`, "g");

const updateBaseline = process.argv.includes("--update-baseline");

// Modules that live in src/i18n but are not locale message files.
const NON_LOCALE_FILES = new Set(["useTranslation.ts", "index.ts", "types.ts"]);
// A locale file is <lang>[-<Region|Script>].ts — e.g. en.ts, pt-BR.ts, zh-Hant.ts.
const LOCALE_FILE = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*\.ts$/;

if (!fs.existsSync(I18N_DIR) || !fs.statSync(I18N_DIR).isDirectory()) {
  console.error(
    `[i18n-encoding] BROKEN CHECKER: locale directory not found: ${I18N_DIR}\n` +
      `  This gate cannot report "clean" when it cannot find anything to read.`,
  );
  process.exit(1);
}

const allTs = fs.readdirSync(I18N_DIR).filter((f) => f.endsWith(".ts"));
const files = allTs.filter((f) => !NON_LOCALE_FILES.has(f) && LOCALE_FILE.test(f)).sort();

// ── Instrument assertions ───────────────────────────────────────────────────
// Assert the instrument before trusting the result.
if (files.length === 0) {
  console.error(
    `[i18n-encoding] BROKEN CHECKER: selected 0 locale files in ${I18N_DIR}.\n` +
      `  ${allTs.length} .ts file(s) are present but none matched ${LOCALE_FILE}.\n` +
      `  A mojibake gate that scans nothing and exits 0 reports "clean" when it means\n` +
      `  "blind". Fix the selector (or the filenames) — this is a FAILURE, not a pass.`,
  );
  process.exit(1);
}

const counts = {};
const samples = {};
for (const f of files) {
  const text = fs.readFileSync(path.join(I18N_DIR, f), "utf8");
  const lines = text.split("\n");
  let n = 0;
  const hits = [];
  lines.forEach((line, i) => {
    const m = line.match(MOJIBAKE);
    if (m) {
      n += m.length;
      if (hits.length < 3) hits.push(`  ${f}:${i + 1}  ${line.trim().slice(0, 100)}`);
    }
  });
  counts[f] = n;
  samples[f] = hits;
}

if (updateBaseline) {
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(counts, null, 2) + "\n");
  console.log(`[i18n-encoding] baseline updated: ${BASELINE_PATH}`);
  process.exit(0);
}

const baseline = fs.existsSync(BASELINE_PATH)
  ? JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"))
  : {};

// The baseline doubles as a manifest of what this gate is supposed to scan.
// If it names a file the selector no longer finds, the gate has gone partly
// blind — measuring a smaller corpus while still printing OK.
const unscanned = Object.keys(baseline).filter((f) => !files.includes(f));
if (unscanned.length > 0) {
  console.error(
    `[i18n-encoding] BROKEN CHECKER: ${unscanned.length} file(s) named in the baseline were not\n` +
      `  scanned: ${unscanned.join(", ")}\n` +
      `  Either the file was renamed/removed (drop it from ${path.relative(process.cwd(), BASELINE_PATH)})\n` +
      `  or the selector stopped matching it. Refusing to report on a partial corpus.`,
  );
  process.exit(1);
}

let failed = false;
let improved = false;
for (const f of files) {
  const now = counts[f];
  const base = baseline[f] ?? 0;
  if (f === "en.ts" && now > 0) {
    failed = true;
    console.error(`[i18n-encoding] FAIL ${f}: ${now} mojibake sequence(s) — en.ts ships to production and must be clean:`);
    for (const s of samples[f]) console.error(s);
  } else if (now > base) {
    failed = true;
    console.error(`[i18n-encoding] FAIL ${f}: ${now} mojibake sequence(s) (baseline ${base}) — an editor/tool re-corrupted this file. Fix the encoding before pushing:`);
    for (const s of samples[f]) console.error(s);
  } else if (now < base) {
    improved = true;
  }
}

if (failed) {
  console.error("[i18n-encoding] See scripts/check-i18n-encoding.mjs header for repair notes.");
  process.exit(1);
}
if (improved) {
  console.log("[i18n-encoding] Counts dropped below baseline — tighten the ratchet with: node scripts/check-i18n-encoding.mjs --update-baseline");
}
const dirty = files.filter((f) => counts[f] > 0);
console.log(
  dirty.length === 0
    ? `[i18n-encoding] OK — all ${files.length} locale files clean`
    : `[i18n-encoding] OK — scanned ${files.length} locale files, no new corruption ` +
        `(${dirty.length} file(s) still carry known baseline debt: ` +
        `${dirty.map((f) => `${f}=${counts[f]}`).join(", ")})`,
);
