import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GATE_MODES, MODES, selectModes } from "../../scripts/i18n/check.mjs";
import { listLocales } from "../../scripts/i18n/load-locale.mjs";

/**
 * Pins scripts/i18n/check.mjs, the one entry point for the i18n checks, and the
 * locale selector they share (listLocaleFiles in scripts/i18n/load-locale.mjs).
 * A new i18n check script that is not a mode, or a mode whose script is gone,
 * fails here, and so does a selector that stops seeing one of the 14 locales.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCRIPTS = (JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> }).scripts;

const I18N_CHECK_SCRIPT = /^(check:i18n-|check:guide-translations$|report:i18n-)/;

describe("i18n check modes", () => {
  it("each mode runs a script package.json declares", () => {
    for (const script of Object.values(MODES)) expect(SCRIPTS, script).toHaveProperty([script]);
  });

  it("every i18n check script in package.json is a mode", () => {
    const declared = Object.keys(SCRIPTS).filter((name) => I18N_CHECK_SCRIPT.test(name)).sort();
    expect(declared.length).toBeGreaterThanOrEqual(5);
    expect([...Object.values(MODES)].sort()).toEqual(declared);
  });

  it("`all` runs every gate and leaves the report out", () => {
    expect(selectModes(["all"])).toEqual({ modes: [...GATE_MODES], unknown: [] });
    expect(GATE_MODES).not.toContain("hardcoded");
    expect([...GATE_MODES, "hardcoded"].sort()).toEqual(Object.keys(MODES).sort());
  });

  it("keeps the named order, drops repeats and flags unknown modes", () => {
    expect(selectModes(["encoding", "coverage", "encoding"]).modes).toEqual(["encoding", "coverage"]);
    expect(selectModes(["--list", "nope"]).unknown).toEqual(["nope"]);
  });
});

describe("shared locale selector", () => {
  it("finds the 14 locales in src/i18n and nothing else", () => {
    expect(listLocales(path.join(ROOT, "src", "i18n"))).toEqual(
      ["ar", "bn", "cs", "de", "en", "es", "fr", "hi", "id", "ja", "ko", "ru", "vi", "zh"],
    );
  });
});
