#!/usr/bin/env node
// Drift gate: every hand-written Supabase row interface in src/lib/supabaseApi.ts
// must be a column-and-nullability-faithful projection of its table in
// scripts/setup-sync-db.sql (the live source of truth for the sync plane).
//
// Spike toward "one schema, three planes": it parses the `create table` blocks
// with no SQL-parser dependency and diffs them against the row interfaces. It
// does not generate anything yet; it proves the DDL is reliably parseable and
// turns silent column drift into a CI failure naming the table and column.
//
// Usage:  node scripts/check-sync-rows.mjs
//   exit 0  every mapped row interface agrees with the DDL
//   exit 1  drift: lists interface.field vs table.column
//
// A row interface may select a SUBSET of the table's columns (the projection is
// deliberate); it may not name a column the table lacks, nor claim a type or
// nullability the column does not have.

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Row interface -> synced table it decodes. */
export const ROW_TABLES = {
  EventRow: "synced_events",
  ManualReviewRow: "synced_manual_reviews",
  HealingRow: "synced_healing_issues",
  MessageRowShape: "synced_messages",
};

const SQL_TO_TS = [
  [/^(text|uuid|timestamptz|timestamp|date)$/, "string"],
  [/^(integer|int|bigint|numeric|real|double precision|smallint)$/, "number"],
  [/^boolean$/, "boolean"],
];

function tsTypeFor(sqlType) {
  for (const [re, ts] of SQL_TO_TS) if (re.test(sqlType)) return ts;
  return null; // jsonb, arrays...: not checked for type, only presence
}

/** { table: { column: { sqlType, notNull } } } from `create table` blocks. */
export function parseDdl(sql) {
  const tables = {};
  const re = /create table if not exists public\.(\w+)\s*\(([\s\S]*?)\n\);/g;
  let m;
  while ((m = re.exec(sql))) {
    const cols = {};
    for (const raw of m[2].split("\n")) {
      const line = raw.replace(/--.*$/, "").trim().replace(/,$/, "");
      const c = /^(\w+)\s+([a-z][a-z ]*?)(?:\s+(?:not null|primary key|default|references|generated|check)\b.*)?$/i.exec(line);
      if (!c || /^(primary|unique|constraint|foreign|check)$/i.test(c[1])) continue;
      cols[c[1]] = {
        sqlType: c[2].trim().toLowerCase(),
        notNull: /\bnot null\b/i.test(line) || /\bprimary key\b/i.test(line),
      };
    }
    tables[m[1]] = cols;
  }
  // `alter table ... alter column X drop not null` relaxes a deployed column in place.
  for (const a of sql.matchAll(/alter table public\.(\w+)\s+alter column (\w+) drop not null/gi)) {
    if (tables[a[1]]?.[a[2]]) tables[a[1]][a[2]].notNull = false;
  }
  return tables;
}

/** { InterfaceName: { field: { type, nullable } } } for the named interfaces. */
export function parseInterfaces(src, names) {
  const out = {};
  for (const name of names) {
    const m = new RegExp(`interface ${name} \\{([\\s\\S]*?)\\n\\}`).exec(src);
    if (!m) continue;
    const fields = {};
    for (const f of m[1].matchAll(/^\s*(\w+)(\?)?:\s*([^;]+);/gm)) {
      const parts = f[3].split("|").map((s) => s.trim());
      fields[f[1]] = { type: parts.find((p) => p !== "null"), nullable: parts.includes("null") || !!f[2] };
    }
    out[name] = fields;
  }
  return out;
}

export function diff(tables, interfaces, map = ROW_TABLES) {
  const problems = [];
  for (const [iface, table] of Object.entries(map)) {
    const fields = interfaces[iface];
    const cols = tables[table];
    if (!fields) { problems.push(`${iface}: interface not found in supabaseApi.ts`); continue; }
    if (!cols) { problems.push(`${iface}: table ${table} not found in setup-sync-db.sql`); continue; }
    for (const [field, f] of Object.entries(fields)) {
      const col = cols[field];
      if (!col) { problems.push(`${iface}.${field}: no column ${table}.${field}`); continue; }
      const ts = tsTypeFor(col.sqlType);
      if (ts && f.type !== ts) problems.push(`${iface}.${field}: typed ${f.type}, ${table}.${field} is ${col.sqlType}`);
      if (!col.notNull && !f.nullable) problems.push(`${iface}.${field}: non-null, but ${table}.${field} is nullable`);
    }
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const read = (f) => readFileSync(join(REPO, f), "utf8").replaceAll("\r\n", "\n");
  const tables = parseDdl(read("scripts/setup-sync-db.sql"));
  const interfaces = parseInterfaces(read("src/lib/supabaseApi.ts"), Object.keys(ROW_TABLES));
  const problems = diff(tables, interfaces);
  if (problems.length) {
    console.error(`check-sync-rows: ${problems.length} drift(s) between row interfaces and the sync DDL:`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`check-sync-rows: ${Object.keys(ROW_TABLES).length} row interfaces agree with ${Object.keys(tables).length} parsed DDL tables.`);
}
