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
 * Exits non-zero on any mismatch. Designed to run zero-dep in CI.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

if (errors.length > 0) {
  console.error(`Guide content invariant FAILED — ${errors.length} issue(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `Guide content invariant OK — ${categories.length} categories, ${topics.length} topics, all linked.`,
);
