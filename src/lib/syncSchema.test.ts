import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const sql = readFileSync(join(process.cwd(), "scripts", "setup-sync-db.sql"), "utf8");

describe("setup-sync-db.sql synced_manual_reviews.execution_id", () => {
  it("is not declared NOT NULL in the create table", () => {
    const table = /create table if not exists public\.synced_manual_reviews \(([\s\S]*?)\r?\n\);/i.exec(sql);
    expect(table).not.toBeNull();
    const col = /^\s*execution_id\s+([^\r\n]*)$/im.exec(table![1]);
    expect(col).not.toBeNull();
    expect(col![1]).not.toMatch(/not\s+null/i);
  });

  it("carries the idempotent drop-not-null upgrade for an already deployed table", () => {
    expect(sql).toMatch(
      /alter table public\.synced_manual_reviews alter column execution_id drop not null;/i,
    );
  });
});
