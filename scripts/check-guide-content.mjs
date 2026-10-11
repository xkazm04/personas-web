#!/usr/bin/env node
/**
 * Guide Content Invariant
 *
 * Asserts the three-way consistency between:
 *   1. GUIDE_CATEGORIES   (src/data/guide/categories.ts)
 *   2. GUIDE_TOPICS       (src/data/guide/topics.ts)
 *   3. content/<category>.ts modules
 *
 * Without this guard, a topic listed in GUIDE_TOPICS but missing from its
 * category's content module silently 404s — while generateMetadata still
 * ships full SEO tags, the sidebar advertises a dead link, and search
 * indexes the orphan. See src/app/guide/[category]/[topic]/page.tsx.
 *
 * Also parses every topic body (English and all locales) with the renderer's
 * own grammar (parseGuide) and fails on its diagnostics: unknown or malformed
 * `:::` directives, a known block with no valid items (empty-block) or with an
 * item line its grammar cannot use (ignored-line), and `#` lines that are not
 * headings the renderer takes (`#####`, `#tag`, an indented `# x`).
 *
 * Also checks per-topic block-sequence parity with English (ratcheting baseline).
 *
 * Exits non-zero on any mismatch. Designed to run zero-dep in CI.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
}

function parseCategories() {
  const src = read("src/data/guide/categories.ts");
  const ids = [...src.matchAll(/^\s*id:\s*["']([a-z0-9-]+)["'],/gm)].map((m) => m[1]);
  if (ids.length === 0) throw new Error("No categories parsed from categories.ts");
  return ids;
}

function parseTopics() {
  const src = read("src/data/guide/topics.ts");
  const re = /id:\s*["']([a-z0-9-]+)["'],\s*\n\s*categoryId:\s*["']([a-z0-9-]+)["']/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    out.push({ id: m[1], categoryId: m[2] });
  }
  if (out.length === 0) throw new Error("No topics parsed from topics.ts");
  return out;
}

function parseContentKeys(categoryId) {
  const rel = `src/data/guide/content/${categoryId}.ts`;
  if (!fs.existsSync(path.join(REPO_ROOT, rel))) return null;
  const src = read(rel);
  return new Set(
    [...src.matchAll(/^\s+["']([a-z0-9-]+)["']\s*:/gm)].map((m) => m[1]),
  );
}

const categories = parseCategories();
const topics = parseTopics();

const errors = [];

for (const cat of categories) {
  const keys = parseContentKeys(cat);
  if (!keys) {
    errors.push(`Category "${cat}" listed in GUIDE_CATEGORIES has no content/${cat}.ts module`);
  }
}

const contentByCategory = new Map();
for (const cat of categories) {
  contentByCategory.set(cat, parseContentKeys(cat) ?? new Set());
}

const topicIdSet = new Set();
for (const t of topics) {
  if (topicIdSet.has(t.id)) {
    errors.push(`Duplicate topic id: "${t.id}"`);
  }
  topicIdSet.add(t.id);

  if (!categories.includes(t.categoryId)) {
    errors.push(`Topic "${t.id}" references unknown category "${t.categoryId}"`);
    continue;
  }

  const keys = contentByCategory.get(t.categoryId);
  if (!keys.has(t.id)) {
    errors.push(
      `Topic "${t.id}" listed in GUIDE_TOPICS (category "${t.categoryId}") has no entry in content/${t.categoryId}.ts — page would 404 while metadata, sidebar, and search advertise it`,
    );
  }
}

for (const [cat, keys] of contentByCategory) {
  for (const k of keys) {
    if (!topicIdSet.has(k)) {
      errors.push(`Orphan content key "${k}" in content/${cat}.ts — not declared in GUIDE_TOPICS`);
    }
  }
}

// ── Directives: every `:::name` block must be one the renderer knows, be
// well-formed, and carry items its grammar can use. The renderer drops what it
// cannot parse, so a typo here otherwise ships as a silently missing block. The
// diagnostics are the renderer's own grammar's (src/components/guide/guide-markdown/parseGuide.ts),
// loaded with Node's built-in type stripping (Node >= 22.18), as are the
// content modules, so what is checked is the exact string the page renders.
const NOISY_WARNINGS = new Set(["MODULE_TYPELESS_PACKAGE_JSON", "ExperimentalWarning"]);
process.removeAllListeners("warning");
process.on("warning", (w) => {
  if (!NOISY_WARNINGS.has(w.code) && !NOISY_WARNINGS.has(w.name)) console.warn(w);
});

async function importTs(rel) {
  try {
    return await import(pathToFileURL(path.join(REPO_ROOT, rel)).href);
  } catch (err) {
    console.error(
      `Guide content check could not load ${rel} (needs Node >= 22.18 for built-in TypeScript type stripping; running ${process.version}).`,
    );
    throw err;
  }
}

const { parseGuide } = await importTs("src/components/guide/guide-markdown/parseGuide.ts");

const contentFiles = [
  ...categories.map((cat) => `src/data/guide/content/${cat}.ts`),
  ...fs
    .readdirSync(path.join(REPO_ROOT, "src/data/guide/locales"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => {
      const dir = `src/data/guide/locales/${d.name}/content`;
      if (!fs.existsSync(path.join(REPO_ROOT, dir))) return [];
      return fs
        .readdirSync(path.join(REPO_ROOT, dir))
        .filter((f) => f.endsWith(".ts"))
        .map((f) => `${dir}/${f}`);
    }),
].filter((rel) => fs.existsSync(path.join(REPO_ROOT, rel)));

// ── Directive-sequence parity: a locale body must carry the same sequence of
// block nodes as its English source (a missing `:::cards` is a vanished block,
// not a translation choice). Divergence that already existed when the gate
// landed is frozen in scripts/guide-directive-parity-baseline.json; the gate
// fails on a NEW divergence and on a baselined one that now matches (stale
// entry), so the list can only shrink.
const BLOCK_TYPES = new Set([
  "callout", "steps", "keys", "compare", "diagram", "feature", "checklist",
  "usecases", "code-compare", "tabs", "cli", "callout-stack", "cards",
]);
const blockSequence = (md) =>
  parseGuide(String(md)).doc.filter((n) => BLOCK_TYPES.has(n.type)).map((n) => n.type).join(",");
const BASELINE_REL = "scripts/guide-directive-parity-baseline.json";
const updateBaseline = process.argv.includes("--update-parity-baseline");
const parityBaseline = new Set(
  fs.existsSync(path.join(REPO_ROOT, BASELINE_REL)) ? JSON.parse(read(BASELINE_REL)) : [],
);
const englishSequences = new Map();
const parityDiverged = new Set();
let parityChecked = 0;

let directiveTopics = 0;
for (const rel of contentFiles) {
  const { content } = await importTs(rel);
  const localeMatch = rel.match(/^src\/data\/guide\/locales\/([^/]+)\/content\//);
  for (const [topicId, markdown] of Object.entries(content ?? {})) {
    if (!localeMatch) englishSequences.set(topicId, blockSequence(markdown));
    else {
      const en = englishSequences.get(topicId);
      if (en !== undefined) {
        parityChecked++;
        if (blockSequence(markdown) !== en) parityDiverged.add(`${localeMatch[1]}/${topicId}`);
      }
    }
    directiveTopics++;
    for (const issue of parseGuide(String(markdown)).diagnostics) {
      errors.push(`${rel} "${topicId}" line ${issue.line}: ${issue.message} — ${issue.text.trim()}`);
    }
  }
}

if (updateBaseline) {
  fs.writeFileSync(path.join(REPO_ROOT, BASELINE_REL), JSON.stringify([...parityDiverged].sort(), null, 2) + "\n");
  console.log(`Wrote ${parityDiverged.size} entries to ${BASELINE_REL}`);
} else {
  for (const key of parityDiverged) {
    if (!parityBaseline.has(key)) {
      errors.push(`Locale "${key}" has a different block sequence than English (a block was added, dropped or reordered) — fix the translation, or re-baseline with --update-parity-baseline only if the English change is intended`);
    }
  }
  for (const key of parityBaseline) {
    if (!parityDiverged.has(key)) {
      errors.push(`Stale entry "${key}" in ${BASELINE_REL} — it now matches English; remove it (run --update-parity-baseline)`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Guide content invariant FAILED — ${errors.length} issue(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `Guide content invariant OK — ${categories.length} categories, ${topics.length} topics, all linked; ` +
    `${directiveTopics} topic bodies across ${contentFiles.length} content modules have well-formed, known directives with usable items, and well-formed headings.`,
);
