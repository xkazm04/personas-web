import test from "node:test";
import assert from "node:assert/strict";
import { parseDdl, parseInterfaces, diff } from "./check-sync-rows.mjs";

const ddl = `create table if not exists public.synced_x (
  id text primary key,
  title text not null,
  note text,
  n integer not null default 0 -- count
);
alter table public.synced_x alter column title drop not null;
`;
const map = { XRow: "synced_x" };
const run = (body) => diff(parseDdl(ddl), parseInterfaces(`interface XRow {\n${body}\n}`, ["XRow"]), map);

test("parses columns, nullability and drop-not-null", () => {
  const t = parseDdl(ddl).synced_x;
  assert.deepEqual(Object.keys(t), ["id", "title", "note", "n"]);
  assert.equal(t.id.notNull, true);
  assert.equal(t.title.notNull, false);
  assert.equal(t.n.sqlType, "integer");
});

test("a faithful subset projection passes", () => {
  assert.deepEqual(run("  id: string;\n  title: string | null;\n  n: number;"), []);
});

test("renamed column, wrong type and false non-null are each reported", () => {
  const p = run("  id: string;\n  titel: string;\n  n: string;\n  note: string;");
  assert.equal(p.length, 3);
  assert.match(p.join("\n"), /no column synced_x\.titel/);
  assert.match(p.join("\n"), /n: typed string/);
  assert.match(p.join("\n"), /note: non-null/);
});
