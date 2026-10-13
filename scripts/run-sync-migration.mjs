#!/usr/bin/env node
/**
 * Apply scripts/setup-sync-db.sql against the Supabase Postgres pooler.
 *
 * Reads DATABASE_URL from .env (or the environment) — the pooler connection
 * string, the only credential that can run DDL + RLS (the anon/service-role
 * keys go through PostgREST, which is data-plane only). Idempotent: the SQL
 * uses CREATE TABLE IF NOT EXISTS / DROP POLICY IF EXISTS, so re-running is safe.
 * The connect-and-apply logic is `scripts/apply-sql-migration.mjs`.
 *
 * Run with:  npm run db:migrate:sync
 *
 * Note: the migration contains `DO $$ ... $$` blocks and `CREATE VIEW ... WITH
 * (security_invoker = true)` (PG15+). If the transaction pooler (port 6543)
 * rejects these, point DATABASE_URL at the session pooler (5432) or the direct
 * connection for this one-off migration.
 */

import { runMigrationCli } from "./apply-sql-migration.mjs";

runMigrationCli({ name: "sync", label: "Sync schema migration" });
