"use client";

import { useState } from "react";
import { ClipboardCopy, Check } from "lucide-react";

export function formatPayload(payload: string | null): string {
  if (!payload) return "{}";
  try {
    return JSON.stringify(JSON.parse(payload), null, 2);
  } catch {
    return payload;
  }
}

const jsonTokenRegex =
  /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)/g;

export function highlightJson(json: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = jsonTokenRegex.exec(json)) !== null) {
    if (match.index > lastIndex) {
      result.push(json.slice(lastIndex, match.index));
    }

    const idx = match.index;

    if (match[1] !== undefined) {
      result.push(
        <span key={idx} className="text-white font-semibold">{match[1]}</span>,
      );
      result.push(match[0].slice(match[1].length));
    } else if (match[2] !== undefined) {
      result.push(
        <span key={idx} className="text-cyan-400">{match[2]}</span>,
      );
    } else if (match[3] !== undefined) {
      result.push(
        <span key={idx} className="text-amber-400">{match[3]}</span>,
      );
    } else if (match[4] !== undefined) {
      result.push(
        <span key={idx} className="text-purple-400">{match[4]}</span>,
      );
    } else if (match[5] !== undefined) {
      result.push(
        <span key={idx} className="text-muted-dark">{match[5]}</span>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < json.length) {
    result.push(json.slice(lastIndex));
  }

  jsonTokenRegex.lastIndex = 0;
  return result;
}

export default function JsonViewer({ payload }: { payload: string | null }) {
  const [copied, setCopied] = useState(false);
  const formatted = formatPayload(payload);

  return (
    <div className="relative max-h-60 overflow-auto rounded-xl bg-[#0a0a0a] p-4 border border-white/[0.08] shadow-inner">
      <button
        onClick={() => {
          void navigator.clipboard.writeText(formatted).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        aria-label="Copy payload"
        className="absolute right-2 top-2 rounded-md border border-white/[0.08] bg-white/[0.04] p-1.5 text-muted-dark transition-colors hover:border-white/[0.15] hover:text-foreground"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
      </button>
      <pre className="font-mono text-xs leading-relaxed text-white/30 whitespace-pre-wrap break-all">
        {highlightJson(formatted)}
      </pre>
    </div>
  );
}
