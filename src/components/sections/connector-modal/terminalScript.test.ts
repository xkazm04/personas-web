import { describe, expect, it } from "vitest";

import { connectors, type Connector } from "@/data/connectors";
import { buildTerminalScript, instructionFromCommand, type TerminalScriptStrings } from "./terminalScript";

const strings: TerminalScriptStrings = {
  connecting: "Connecting to {label}…",
  working: "Working on: {task}",
  done: "Done: {task}",
};

const scriptText = (c: Connector) =>
  buildTerminalScript(c, strings)
    .map((l) => l.text)
    .join("\n");

describe("instructionFromCommand", () => {
  it("unwraps the plain-language instruction from the invented CLI wrapper", () => {
    expect(instructionFromCommand('personas run "Post release notes to #releases"')).toBe(
      "Post release notes to #releases",
    );
  });

  it("returns an already-plain instruction unchanged", () => {
    expect(instructionFromCommand("Summarize open PRs")).toBe("Summarize open PRs");
  });

  it("leaves no use case in the catalog presenting the nonexistent `personas run` CLI", () => {
    for (const c of connectors) {
      for (const uc of c.useCases) {
        expect(instructionFromCommand(uc.command)).not.toMatch(/personas run/);
      }
    }
  });
});

describe("buildTerminalScript", () => {
  const slack = connectors.find((c) => c.name === "slack");
  if (!slack) throw new Error("slack connector missing from the catalog");

  it("derives the run from the connector's own name and first declared use case", () => {
    const lines = buildTerminalScript(slack, strings);
    const uc = slack.useCases[0];
    expect(lines[0]).toMatchObject({ kind: "prompt", text: `"${instructionFromCommand(uc.command)}"` });
    expect(lines.map((l) => l.text)).toEqual([
      `"${instructionFromCommand(uc.command)}"`,
      `Connecting to ${slack.label}…`,
      `Working on: ${uc.title}`,
      uc.description,
      `Done: ${uc.title}`,
    ]);
    expect(lines.at(-1)?.kind).toBe("success");
  });

  it("schedules lines in strictly increasing order starting at 0", () => {
    const delays = buildTerminalScript(slack, strings).map((l) => l.delay);
    expect(delays[0]).toBe(0);
    for (let i = 1; i < delays.length; i++) expect(delays[i]).toBeGreaterThan(delays[i - 1]);
  });

  it("plays a different script for every connector (no shared canned run)", () => {
    // Every catalog entry has its own label (the two Obsidian connectors used to
    // share one, with identical use cases), so every entry plays its own script.
    expect(connectors.length).toBeGreaterThan(100);
    expect(new Set(connectors.map((c) => c.label)).size).toBe(connectors.length);
    expect(new Set(connectors.map(scriptText)).size).toBe(connectors.length);
  });

  it("invents no results, counts or timings and shows no CLI command", () => {
    for (const c of connectors) {
      const text = scriptText(c);
      expect(text).not.toMatch(/personas run/);
      expect(text).not.toMatch(/Found \d+ results|items updated|Finished in/);
      expect(text).not.toMatch(/^\$ /m);
    }
  });
});
