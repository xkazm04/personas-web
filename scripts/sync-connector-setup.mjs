#!/usr/bin/env node
/**
 * Snapshot what the desktop already knows about setting up each connector.
 *
 *   PERSONAS_DESKTOP_REPO=../personas npm run sync:connector-setup
 *   npm run sync:connector-setup -- --check     # drift check (skips with no checkout)
 *
 * Reads the desktop's scripts/connectors/builtin/*.json and writes
 * src/data/connector-setup.json (generated; never hand-edit): the credential
 * FIELDS (label, kind, required, help text - never values), the numbered
 * setup_guide, docs_url and the outbound_only boundary. The connection modal
 * lazy-loads it so the catalog's first-load JS does not grow.
 *
 * Setup guides and field text are desktop English; they are not translated.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileAtomic } from "./atomic-write.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
export const OUT_PATH = path.join(REPO_ROOT, "src", "data", "connector-setup.json");
const SKIP = new Set(["google_workspace_oauth_template"]);

/** "1. a\n2. b" -> ["a","b"]; an un-numbered note stays one entry. */
export function parseGuide(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

export function buildEntry(data) {
  const m = data.metadata ?? {};
  const entry = {};
  const fields = (data.fields ?? []).map((f) => {
    const out = { label: f.label, kind: f.sensitive || f.type === "password" ? "secret" : f.type === "select" ? "choice" : f.type };
    if (f.required === false) out.optional = true;
    if (f.helpText) out.help = f.helpText;
    return out;
  });
  if (fields.length) entry.fields = fields;
  const guide = parseGuide(m.setup_guide);
  if (guide.length) entry.guide = guide;
  if (typeof m.docs_url === "string" && /^https:\/\//.test(m.docs_url)) entry.docsUrl = m.docs_url;
  if (m.outbound_only === true) entry.outboundOnly = true;
  return entry;
}

export function buildSnapshot(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    if (SKIP.has(data.name)) continue;
    const entry = buildEntry(data);
    if (Object.keys(entry).length) out[data.name] = entry;
  }
  return out;
}

function main() {
  const check = process.argv.includes("--check");
  const root = process.env.PERSONAS_DESKTOP_REPO ?? path.resolve(REPO_ROOT, "../personas");
  const dir = path.join(root, "scripts", "connectors", "builtin");
  if (!fs.existsSync(dir)) {
    if (check && !process.env.PERSONAS_DESKTOP_REPO) {
      console.log("connector-setup: skipped - no desktop checkout; set PERSONAS_DESKTOP_REPO to check drift.");
      process.exit(0);
    }
    console.error(`connector-setup: ${dir} not found`);
    process.exit(1);
  }
  const text = JSON.stringify(buildSnapshot(dir), null, 1) + "\n";
  if (check) {
    const same = fs.existsSync(OUT_PATH) && fs.readFileSync(OUT_PATH, "utf8") === text;
    console.log(same ? "connector-setup: in sync" : "connector-setup: DRIFT - run npm run sync:connector-setup");
    process.exit(same ? 0 : 1);
  }
  writeFileAtomic(OUT_PATH, text);
  console.log(`connector-setup: wrote ${path.relative(REPO_ROOT, OUT_PATH)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
