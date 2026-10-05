import type { Connector } from "@/data/connectors";
import { fillTemplate } from "@/lib/fillTemplate";

/** Localized line templates; `{label}` is the connector name, `{task}` the use-case title. */
export interface TerminalScriptStrings {
  connecting: string;
  working: string;
  done: string;
}

export type TerminalLineKind = "prompt" | "info" | "success";

export interface TerminalLine {
  kind: TerminalLineKind;
  text: string;
  /** ms after the simulation starts that this line appears */
  delay: number;
}

// The catalog's use cases carry a `personas run "<instruction>"` string, but the
// desktop ships no such CLI. Only the plain-language instruction is shown.
const CLI_WRAPPER = /^personas run "(.*)"$/;

export function instructionFromCommand(command: string): string {
  return CLI_WRAPPER.exec(command.trim())?.[1] ?? command;
}

const STEP_MS = 700;

/**
 * A simulated run built from the connector's own data: its name and its first
 * declared use case. It narrates what the agent would do, and claims no
 * results, counts or timings, because nothing actually runs.
 */
export function buildTerminalScript(
  connector: Pick<Connector, "label" | "useCases">,
  strings: TerminalScriptStrings,
): TerminalLine[] {
  const uc = connector.useCases[0];
  const lines: Omit<TerminalLine, "delay">[] = [
    { kind: "prompt", text: `"${instructionFromCommand(uc.command)}"` },
    { kind: "info", text: fillTemplate(strings.connecting, { label: connector.label }) },
    { kind: "info", text: fillTemplate(strings.working, { task: uc.title }) },
    { kind: "info", text: uc.description },
    { kind: "success", text: fillTemplate(strings.done, { task: uc.title }) },
  ];
  return lines.map((line, i) => ({ ...line, delay: i * STEP_MS }));
}
