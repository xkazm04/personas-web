import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The contract and golden eval for the agent roles in docs/agents/roles/.
 *
 * A role is a versioned spec for a task lanes repeat (docs/agents/roles/README.md).
 * The contract half fails when a role loses its version, a section, or points at
 * a file or `npm run` script that is gone. The golden half is the eval of
 * agent-authored output beyond "it passes": each role names merged exemplars, and
 * GOLDEN holds them to the structure the role demands. A role file without a
 * golden rule here fails, and so does a rule for a role that no longer exists.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ROLES_DIR = path.join(ROOT, "docs", "agents", "roles");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
const SCRIPTS = (JSON.parse(read("package.json")) as { scripts: Record<string, string> }).scripts;
const SECTIONS = ["## Mission", "## Inputs", "## Steps", "## Output contract", "## Refuse"];

type Role = { file: string; fields: Record<string, string>; lists: Record<string, string[]>; body: string };

/** Scalar `key: value` fields and `key:` + `  - item` lists from the front matter. */
function parseRole(file: string): Role {
  const text = read(`docs/agents/roles/${file}`);
  const parts = text.split(/^---$/m);
  const fields: Record<string, string> = {};
  const lists: Record<string, string[]> = {};
  let current = "";
  for (const line of (parts[1] ?? "").split("\n")) {
    const item = /^\s+-\s+(.+)$/.exec(line);
    if (item && current) {
      lists[current].push(item[1].trim());
      continue;
    }
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    if (kv[2] === "") {
      current = kv[1];
      lists[current] = [];
    } else {
      current = "";
      fields[kv[1]] = kv[2].trim();
    }
  }
  return { file, fields, lists, body: parts.slice(2).join("---") };
}

/** Backticked repo paths on a decision record's `**Governs:**` line. */
function governed(text: string): string[] {
  const line = /^\*\*Governs:\*\* (.+)$/m.exec(text);
  if (!line) return [];
  const out: string[] = [];
  for (const m of line[1].matchAll(/`([^`]+)`/g)) out.push(m[1]);
  return out;
}

/** Problems with one exemplar against the structure its role demands; [] when it conforms. */
const GOLDEN: Record<string, (exemplar: string) => string[]> = {
  "gate-workflow-author": (exemplar) => {
    const text = read(exemplar);
    const problems: string[] = [];
    if (exemplar.endsWith(".yml")) {
      if (!/^permissions:\n {2}contents: read$/m.test(text)) problems.push("no top-level read-only permissions");
      if (!/^\s+timeout-minutes: \d+$/m.test(text)) problems.push("no job timeout");
      for (const m of text.matchAll(/^\s*-?\s*uses:\s*(.+?)\s*$/gm)) {
        if (!/@[0-9a-f]{40} # v[\d.]+$/.test(m[1])) problems.push(`not SHA-pinned: ${m[1]}`);
      }
    } else {
      for (const needle of ["/^on:", "permissions:", "timeout-minutes", "[0-9a-f]{40}"]) {
        if (!text.includes(needle)) problems.push(`shape spec does not assert ${needle}`);
      }
    }
    return problems;
  },
  "mutant-spec-author": (exemplar) => {
    const text = read(exemplar);
    const problems: string[] = [];
    for (const needle of ["MIN_KILL_RATIO = 1", "every mutation still applies", "unmutated", "kills the mutant", "rejectionSuite"]) {
      if (!text.includes(needle)) problems.push(`missing ${needle}`);
    }
    if (text.includes("process.exit")) problems.push("ends the process");
    const target = /path\.join\(ROOT, "scripts", "([\w.-]+\.mjs)"\)/.exec(text);
    if (!target) problems.push("names no script under scripts/");
    else if (!existsSync(path.join(ROOT, "scripts", target[1]))) problems.push(`mutates a missing script: ${target[1]}`);
    return problems;
  },
  "decision-record-author": (exemplar) => {
    const text = read(exemplar);
    const problems: string[] = [];
    if (!/^# \d{4}-\d{2}-\d{2} /.test(text)) problems.push("title does not open with the date");
    if (/^# \d{4}-\d{2}-\d{2} PROPOSED:/.test(text) && !/^Status: /m.test(text)) problems.push("proposal without a Status line");
    if (!/^## Context$/m.test(text)) problems.push("no Context");
    if (!/^## (Decision|Recommendation)$/m.test(text)) problems.push("no Decision or Recommendation");
    if (!/^## Follow-up \(needs a person\)$/m.test(text)) problems.push("no follow-up for a person");
    const paths = governed(text);
    if (paths.length === 0) problems.push("no Governs line");
    for (const p of paths) if (!existsSync(path.join(ROOT, p))) problems.push(`governs a missing file: ${p}`);
    return problems;
  },
  "locale-translator": () => {
    const codes = ["en", "ar", "bn", "cs", "de", "es", "fr", "hi", "id", "ja", "ko", "ru", "vi", "zh"];
    return codes.filter((c) => !existsSync(path.join(ROOT, "src", "i18n", `${c}.ts`))).map((c) => `no locale file for ${c}`);
  },
};

const roles = readdirSync(ROLES_DIR)
  .filter((f) => f.endsWith(".md") && f !== "README.md")
  .sort()
  .map(parseRole);
const index = read("docs/agents/roles/README.md");

describe("docs/agents/roles: contract", () => {
  it("has roles, and a golden rule for each one and no other", () => {
    expect(roles.length).toBeGreaterThan(0);
    expect(roles.map((r) => r.fields.role).sort()).toEqual(Object.keys(GOLDEN).sort());
  });

  it.each(roles.map((r): [string, Role] => [r.file, r]))("%s names itself and carries a semver version", (file, role) => {
    expect(`${role.fields.role}.md`).toBe(file);
    expect(role.fields.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(role.fields.task ?? "").not.toBe("");
  });

  it.each(roles.map((r): [string, Role] => [r.file, r]))("%s is listed in the index at its version", (_file, role) => {
    const name = role.fields.role;
    expect(index).toContain(`| [${name}](${name}.md) | ${role.fields.version} |`);
  });

  it.each(roles.map((r): [string, Role] => [r.file, r]))("%s cites only files that exist", (_file, role) => {
    const cited = [...(role.lists.exemplars ?? []), ...(role.lists.governs ?? [])];
    expect(role.lists.exemplars?.length ?? 0).toBeGreaterThan(0);
    expect(cited.filter((p) => !existsSync(path.join(ROOT, p)))).toEqual([]);
  });

  it.each(roles.map((r): [string, Role] => [r.file, r]))("%s is done only by npm scripts package.json defines", (_file, role) => {
    const steps = role.lists["done-when"] ?? [];
    expect(steps.length).toBeGreaterThan(0);
    const wrong = steps.filter((s) => {
      const m = /^npm run ([\w:.-]+)$/.exec(s);
      return !m || !(m[1] in SCRIPTS);
    });
    expect(wrong).toEqual([]);
  });

  it.each(roles.map((r): [string, Role] => [r.file, r]))("%s keeps every section", (_file, role) => {
    expect(SECTIONS.filter((s) => !role.body.includes(`\n${s}\n`))).toEqual([]);
  });
});

describe("docs/agents/roles: golden exemplars", () => {
  it.each(roles.map((r): [string, Role] => [r.file, r]))("%s: every exemplar has the shape the role demands", (_file, role) => {
    const rule = GOLDEN[role.fields.role];
    expect(rule, "add a golden rule for this role").toBeDefined();
    const problems = (role.lists.exemplars ?? []).flatMap((e) => rule(e).map((p) => `${e}: ${p}`));
    expect(problems).toEqual([]);
  });
});
