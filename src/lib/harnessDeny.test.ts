import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pins the harness deny list the git policy relies on.
 *
 * .claude/CLAUDE.md "Git policy" promises that `--no-verify` and force-push are
 * denied to agents at the permission layer (`.claude/settings.json`
 * `permissions.deny`). Nothing else holds that promise: one edit to the
 * settings file would lift the guard while the guidance kept stating it. This
 * spec replays the commands the policy forbids against the deny patterns, and
 * checks the policy paragraph still names what the settings file enforces.
 *
 * The matcher reads a `Bash(...)` rule as a whole-command glob where `*` is any
 * run of characters, which is how the patterns in the file are written.
 * Commands the guidance forbids but no pattern catches yet are `it.todo`: the
 * settings file is owner-edited (.claude/ is repo law), so a lane records the
 * gap rather than closing it. See docs/AI_HARNESS.md "Harness deny list".
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SETTINGS = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "settings.json"), "utf8")) as {
  permissions?: { deny?: unknown };
};
const GUIDANCE = fs.readFileSync(path.join(ROOT, ".claude", "CLAUDE.md"), "utf8");

const rawDeny: unknown = SETTINGS.permissions?.deny;
const deny: string[] = Array.isArray(rawDeny)
  ? rawDeny.filter((r): r is string => typeof r === "string")
  : [];

/** `Bash(git push*--force*)` → a regex anchored on the whole command. */
function bashRule(rule: string): RegExp | null {
  const m = /^Bash\((.*)\)$/.exec(rule);
  if (!m) return null;
  const body = m[1]
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}$`);
}

const bashRules = deny.map(bashRule).filter((r): r is RegExp => r !== null);
const isDenied = (command: string) => bashRules.some((r) => r.test(command));

/** The paragraph under the "## Git policy" heading, up to the next heading. */
function gitPolicy(): string {
  const start = GUIDANCE.indexOf("## Git policy");
  if (start === -1) return "";
  const rest = GUIDANCE.slice(start + "## Git policy".length);
  const end = rest.indexOf("\n## ");
  return end === -1 ? rest : rest.slice(0, end);
}

describe(".claude/settings.json permissions.deny", () => {
  it("declares Bash deny rules", () => {
    expect(bashRules.length).toBeGreaterThan(0);
  });

  it.each([
    "git commit --no-verify -m wip",
    "git commit -m wip --no-verify",
    "git push --no-verify",
    "git merge --no-verify feature",
  ])("blocks the hook bypass: %s", (command) => {
    expect(isDenied(command)).toBe(true);
  });

  it.each([
    "git push --force",
    "git push origin main --force",
    "git push --force-with-lease",
    "git push origin -f main",
    "git push -f origin main",
  ])("blocks force-push: %s", (command) => {
    expect(isDenied(command)).toBe(true);
  });

  it.each(["git status", "git commit -m wip", "npm run lint", "git log --oneline"])(
    "leaves ordinary work alone: %s",
    (command) => {
      expect(isDenied(command)).toBe(false);
    },
  );

  // Forbidden by the git policy, not yet caught by any pattern (owner's edit).
  it.todo("blocks a trailing short force flag: git push -f");
  it.todo("blocks a plain push, which the policy forbids: git push origin feature");
});

describe(".claude/CLAUDE.md Git policy", () => {
  const policy = gitPolicy();

  it("still exists", () => {
    expect(policy.length).toBeGreaterThan(0);
  });

  it("names the settings file and the rules it says are enforced there", () => {
    expect(policy).toContain("`.claude/settings.json`");
    expect(policy).toContain("`permissions.deny`");
    expect(policy).toContain("`--no-verify`");
    expect(policy).toContain("force-push");
  });
});
