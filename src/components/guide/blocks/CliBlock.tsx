"use client";

import { CopyButton } from "./CopyButton";

interface CliBlockProps {
  lines: string[];
  shell?: string;
}

type OutputKind = "neutral" | "success" | "error" | "warning";

interface CliLine {
  kind: "command" | "output";
  text: string;
  output?: OutputKind;
}

function detectOutputKind(text: string): OutputKind {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("✓") || /^success:/i.test(trimmed)) return "success";
  if (trimmed.startsWith("✗") || /^(error|err):/i.test(trimmed)) return "error";
  if (trimmed.startsWith("⚠") || /^(warning|warn):/i.test(trimmed)) return "warning";
  return "neutral";
}

function classify(lines: string[]): CliLine[] {
  return lines.map((line) => {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("$ ")) return { kind: "command", text: trimmed.slice(2) };
    if (trimmed === "$") return { kind: "command", text: "" };
    return { kind: "output", text: line, output: detectOutputKind(line) };
  });
}

const OUTPUT_CLASS: Record<OutputKind, string> = {
  neutral: "text-muted-dark/80",
  success: "text-emerald-400",
  error: "text-rose-400",
  warning: "text-amber-400",
};

export function CliBlock({ lines, shell }: CliBlockProps) {
  const classified = classify(lines);
  const copyText = classified
    .filter((line) => line.kind === "command")
    .map((line) => line.text)
    .join("\n");

  return (
    <div className="group relative my-4 overflow-x-auto rounded-xl border border-glass bg-black/30">
      <div className="flex items-center justify-between border-b border-glass px-4 py-1.5">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-dark/60 select-none">
          {shell ?? "shell"}
        </span>
        <CopyButton text={copyText} />
      </div>
      <pre className="p-4 font-mono text-base leading-relaxed">
        <code className="block">
          {classified.map((line, i) => (
            <span key={i} className="flex">
              {line.kind === "command" ? (
                <>
                  <span aria-hidden="true" className="mr-2 shrink-0 select-none text-muted-dark/60">$</span>
                  <span className="text-brand-cyan">{line.text}</span>
                </>
              ) : (
                <span className={OUTPUT_CLASS[line.output ?? "neutral"]}>{line.text || " "}</span>
              )}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
