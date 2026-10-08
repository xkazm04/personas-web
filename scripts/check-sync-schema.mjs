#!/usr/bin/env node
/**
 * Read-only probe for the desktop sync schema (scripts/setup-sync-db.sql).
 *
 * Expected tables are parsed from every `create table if not exists public.<name>`
 * in the SQL, so this cannot drift from it. The triggers on pending_commands
 * are parsed from `create trigger` the same way. Runs SELECTs against the catalog
 * (and `count(*)` on the other public tables) and prints names and counts only,
 * never row contents.
 *
 * Reads DATABASE_URL from process.env only. Run with:
 *   node --env-file=<path-to-.env> scripts/check-sync-schema.mjs
 *
 * Exit: 0 every expected table present with RLS on; 1 otherwise; 2 DATABASE_URL unset.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(here, "setup-sync-db.sql"), "utf8");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(2);
}

const expected = [
  ...new Set(
    [...sql.matchAll(/create\s+table\s+if\s+not\s+exists\s+public\.([a-z_][a-z0-9_]*)/gi)].map(
      (m) => m[1].toLowerCase(),
    ),
  ),
];

// Expected triggers, parsed the same way: `create trigger <name> ... on public.<table>`.
const expectedTriggers = [
  ...sql.matchAll(/create\s+trigger\s+([a-z_][a-z0-9_]*)[^;]*?\son\s+public\.([a-z_][a-z0-9_]*)/gi),
]
  .map((m) => ({ name: m[1].toLowerCase(), table: m[2].toLowerCase() }))
  .filter((t) => t.table === "pending_commands");

const quoteIdent = (name) => `"${name.replace(/"/g, '""')}"`;

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  try {
    const { rows } = await client.query(
      `select c.relname as name, c.relrowsecurity as rls
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind in ('r', 'p')
        order by c.relname`,
    );
    const byName = new Map(rows.map((r) => [r.name, r.rls]));

    let ok = true;
    console.log("Expected sync tables:");
    for (const name of expected) {
      if (!byName.has(name)) {
        ok = false;
        console.log(`  ${name}: missing`);
      } else {
        const rls = byName.get(name);
        if (!rls) ok = false;
        console.log(`  ${name}: present, rls ${rls ? "on" : "OFF"}`);
      }
    }

    const trig = await client.query(
      `select t.tgname as name, c.relname as tbl
         from pg_trigger t
         join pg_class c on c.oid = t.tgrelid
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and not t.tgisinternal`,
    );
    const haveTriggers = new Set(trig.rows.map((r) => `${r.tbl}.${r.name}`));
    console.log("Expected triggers on pending_commands:");
    for (const t of expectedTriggers) {
      const present = haveTriggers.has(`${t.table}.${t.name}`);
      if (!present) ok = false;
      console.log(`  ${t.name}: ${present ? "present" : "missing"}`);
    }

    // Catalog checks the review sync depends on (read-only SELECTs).
    const nullable = await client.query(
      `select is_nullable from information_schema.columns
        where table_schema = 'public' and table_name = 'synced_manual_reviews' and column_name = 'execution_id'`,
    );
    const execNullable = nullable.rows[0]?.is_nullable === "YES";
    if (!execNullable) ok = false;
    console.log(`synced_manual_reviews.execution_id nullable: ${execNullable ? "yes" : "NO"}`);

    const cons = await client.query(
      `select pg_get_constraintdef(con.oid) as def
         from pg_constraint con
         join pg_class c on c.oid = con.conrelid
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'pending_commands'
          and con.conname = 'pending_commands_command_type_check'`,
    );
    const namesReviewDecide = (cons.rows[0]?.def ?? "").includes("review_decide");
    if (!namesReviewDecide) ok = false;
    console.log(`pending_commands_command_type_check names review_decide: ${namesReviewDecide ? "yes" : "NO"}`);

    const namesChannelSay = (cons.rows[0]?.def ?? "").includes("channel_say");
    if (!namesChannelSay) ok = false;
    console.log(`pending_commands_command_type_check names channel_say: ${namesChannelSay ? "yes" : "NO"}`);

    console.log("Other public base tables (exact row counts):");
    const others = rows.map((r) => r.name).filter((n) => !expected.includes(n));
    if (others.length === 0) console.log("  (none)");
    for (const name of others) {
      const res = await client.query(`select count(*)::text as n from public.${quoteIdent(name)}`);
      console.log(`  ${name}: ${res.rows[0].n}`);
    }

    console.log(ok ? "RESULT: ok" : "RESULT: sync schema incomplete");
    process.exitCode = ok ? 0 : 1;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Probe failed:", err.message.replace(/:\/\/[^@\s]*@/g, "://***@"));
  process.exit(3);
});
