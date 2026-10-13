import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * An accepted risk expires (docs/decisions/README.md). Every accepted-risk
 * record names a reopen trigger, but a trigger is a condition someone has to
 * notice firing; nothing asks again if nobody does. So each one also carries a
 * `**Revisit by:** YYYY-MM-DD` line and a `**Re-decided by:**` owner line.
 *
 * This spec fails:
 *   - when a record titled `ACCEPTED RISK` lacks either line;
 *   - when any record's revisit date is malformed or more than a year out
 *     (a far date is an acceptance with the expiry removed);
 *   - from the revisit date onwards, until the owner re-decides: a new record,
 *     or a dated status line plus a new revisit date. Moving the date without
 *     a decision defeats the point; the date is the question, not the answer.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DECISIONS = path.join(ROOT, "docs", "decisions");
const REVISIT = /^- \*\*Revisit by:\*\* (\d{4}-\d{2}-\d{2})\b/m;
const OWNER = /^- \*\*Re-decided by:\*\* \S/m;
const MAX_HORIZON_DAYS = 366;

const records = fs
  .readdirSync(DECISIONS)
  .filter((f) => f.endsWith(".md") && f !== "README.md")
  .map((file) => ({ file, text: fs.readFileSync(path.join(DECISIONS, file), "utf8") }));

const acceptedRisk = records.filter((r) => /^# ACCEPTED RISK\b/.test(r.text));
const withRevisit = records.filter((r) => REVISIT.test(r.text));

const today = new Date().toISOString().slice(0, 10);

describe("accepted-risk decisions expire", () => {
  it("finds the accepted-risk records (the scan is reading the right folder)", () => {
    expect(acceptedRisk.map((r) => r.file)).toContain("2026-10-07-accepted-risk-execution-text-synced-raw.md");
  });

  it.each(acceptedRisk.map((r): [string, string] => [r.file, r.text]))("%s names a revisit date and an owner", (_file, text) => {
    expect(text).toMatch(REVISIT);
    expect(text).toMatch(OWNER);
  });

  it.each(withRevisit.map((r): [string, string] => [r.file, r.text]))("%s carries a real, near, unexpired revisit date", (file, text) => {
    const date = (REVISIT.exec(text) as RegExpExecArray)[1];
    const parsed = new Date(`${date}T00:00:00Z`);
    expect(Number.isNaN(parsed.getTime()), `${file}: ${date} is not a date`).toBe(false);
    expect(parsed.toISOString().slice(0, 10), `${file}: ${date} is not a calendar date`).toBe(date);
    expect(text, `${file}: a revisit date needs a Re-decided by line`).toMatch(OWNER);

    const horizon = new Date(`${today}T00:00:00Z`);
    horizon.setUTCDate(horizon.getUTCDate() + MAX_HORIZON_DAYS);
    expect(date <= horizon.toISOString().slice(0, 10), `${file}: ${date} is more than a year out`).toBe(true);

    expect(today < date, `${file}: the acceptance expired on ${date}; its owner must re-decide it`).toBe(true);
  });
});
