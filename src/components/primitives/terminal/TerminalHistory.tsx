"use client";

import type { TerminalOutputLine } from "./types";

/**
 * Renders an executed-command history block: each entry is a
 * `~/agents $ <command>` prompt followed by the command's output lines.
 *
 * Consumer provides a colorClasses Record mapping their narrow color
 * union to Tailwind classes — keeps the primitive portable across
 * sections that use different palettes.
 */
export default function TerminalHistory<L extends TerminalOutputLine>({
  history,
  colorClasses,
  prompt = "~/agents $ ",
  indentPx = 8,
}: {
  history: Array<{ command: string; output: L[] }>;
  colorClasses: Record<string, string>;
  prompt?: string;
  indentPx?: number;
}) {
  return (
    <>
      {history.map((entry, hIdx) => (
        <div key={hIdx} className="mb-4">
          <div className="font-mono text-base">
            <span className="text-muted-dark">{prompt}</span>
            <span className="text-muted">{entry.command}</span>
          </div>
          {entry.output.map((line, lIdx) => (
            <div
              key={lIdx}
              className={`font-mono text-base leading-relaxed ${colorClasses[line.color]}`}
              style={{
                paddingLeft: line.indent ? `${line.indent * indentPx}px` : undefined,
                whiteSpace: "pre",
              }}
            >
              {line.text || " "}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
