#!/usr/bin/env node
/**
 * Apply scripts/setup-voting-db.sql against the Supabase Postgres pooler.
 *
 * Reads DATABASE_URL from .env (or the environment). Idempotent: the SQL
 * uses CREATE TABLE IF NOT EXISTS / DROP POLICY IF EXISTS, so re-running
 * is safe. The connect-and-apply logic is `scripts/apply-sql-migration.mjs`.
 *
 * Run with:  npm run db:migrate
 */

import { runMigrationCli } from "./apply-sql-migration.mjs";

runMigrationCli({ name: "voting" });
