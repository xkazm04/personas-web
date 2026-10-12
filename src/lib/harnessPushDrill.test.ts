import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Puts an expiry on the measurement the never-push rule rests on.
 *
 * .claude/CLAUDE.md "Git policy" says the line exists because an unattended
 * harness pushes and opens a draft PR when the file says nothing, and cites the
 * date that was measured. A harness release can change that default without
 * anyone noticing, and the guidance would then describe a world that no longer
 * exists. This spec reads the same paragraph harnessDeny.test.ts reads and fails
 * once the cited measurement is older than the re-measure window recorded in
 * docs/AI_HARNESS.md "Push-default drill", which also gives the procedure. Red
 * here means: run the drill, then update the date (an owner edit, .claude/ is
 * repo law). Run it early on any harness upgrade, before the window runs out.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");
const DAY_MS = 24 * 60 * 60 * 1000;

/** The text under a heading, up to the next heading of the same or higher level. */
function section(text: string, heading: string): string {
  const start = text.indexOf(heading);
  if (start === -1) return "";
  const level = heading.split(" ")[0];
  const rest = text.slice(start + heading.length);
  const ends = ["\n## ", level === "###" ? "\n### " : "\n## "]
    .map((marker) => rest.indexOf(marker))
    .filter((i) => i !== -1);
  return ends.length ? rest.slice(0, Math.min(...ends)) : rest;
}

const policy = section(read(".claude/CLAUDE.md"), "## Git policy");
const drill = section(read("docs/AI_HARNESS.md"), "### Push-default drill");

const measured = /measured (\d{4})-(\d{2})-(\d{2})/.exec(policy);
const windowDays = /Re-measure window: (\d+) days/.exec(drill);

describe("the never-push measurement has an expiry", () => {
  it("the git policy cites the date its harness behaviour was measured", () => {
    expect(measured, ".claude/CLAUDE.md Git policy lost its 'measured YYYY-MM-DD'").not.toBeNull();
  });

  it("docs/AI_HARNESS.md records the drill and its re-measure window", () => {
    expect(drill).toContain("CLAUDE.md");
    expect(windowDays, "add 'Re-measure window: N days' to the Push-default drill").not.toBeNull();
  });

  it("the measurement is younger than the re-measure window", () => {
    if (!measured || !windowDays) throw new Error("see the two specs above");
    const at = Date.UTC(Number(measured[1]), Number(measured[2]) - 1, Number(measured[3]));
    const ageDays = Math.floor((Date.now() - at) / DAY_MS);
    expect(ageDays, "the measurement is in the future").toBeGreaterThanOrEqual(0);
    expect(
      ageDays,
      `measured ${measured[0].slice(9)}, ${ageDays} days ago: re-run docs/AI_HARNESS.md "Push-default drill"`,
    ).toBeLessThanOrEqual(Number(windowDays[1]));
  });

  // The guidance forbids a plain `git push`; only this drill and the prose stop
  // it. Closing it is a .claude/settings.json deny pattern, which harnessDeny.test.ts
  // records as a todo of its own.
  it.todo("a plain `git push` is denied at the permission layer, not only by the guidance");
});
