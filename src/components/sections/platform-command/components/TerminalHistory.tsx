"use client";

import { colorClasses } from "../data";
import type { OutputLine } from "../types";

export default function TerminalHistory({
  history,
}: {
  history: Array<{ command: string; output: OutputLine[] }>;
}) {
  return (
    <>
      {history.map((entry, hIdx) => (
        <div key={hIdx} className="mb-4">
          <div className="font-mono text-base">
            <span className="text-muted-dark">~/agents $ </span>
            <span className="text-muted">{entry.command}</span>
          </div>
          {entry.output.map((line, lIdx) => (
            <div
              key={lIdx}
              className={`font-mono text-base leading-relaxed ${colorClasses[line.color]}`}
              style={{
                paddingLeft: line.indent ? `${line.indent * 8}px` : undefined,
                whiteSpace: "pre",
              }}
            >
              {line.text || "\u00A0"}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
