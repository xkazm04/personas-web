"use client";

import { useMemo, useState } from "react";
import { ClipboardCopy, Check, X } from "lucide-react";

/**
 * Copy text to the clipboard with a graceful degradation path.
 *
 * navigator.clipboard.writeText is gated on a secure context and a granted
 * permission — both fail silently in plain-HTTP local builds, file://, and
 * cross-origin iframes. We try it first, then fall back to the legacy
 * textarea + execCommand("copy") trick, then surface failure to the caller.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to fallback
    }
  }
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  try {
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

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
        <span key={idx} className="text-cyan-300">{match[2]}</span>,
      );
    } else if (match[3] !== undefined) {
      result.push(
        <span key={idx} className="text-amber-300">{match[3]}</span>,
      );
    } else if (match[4] !== undefined) {
      result.push(
        <span key={idx} className="text-purple-300">{match[4]}</span>,
      );
    } else if (match[5] !== undefined) {
      result.push(
        <span key={idx} className="text-white/60">{match[5]}</span>,
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

type CopyState = "idle" | "copied" | "failed";

export default function JsonViewer({ payload }: { payload: string | null }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  // Both pieces are pure functions of `payload`; memoizing avoids re-running
  // JSON.parse + the global regex tokenizer on every parent re-render
  // (filter changes, polling ticks, expansion toggles).
  const formatted = useMemo(() => formatPayload(payload), [payload]);
  const tokens = useMemo(() => highlightJson(formatted), [formatted]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(formatted);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 1500);
  };

  return (
    <div className="relative max-h-60 overflow-auto rounded-xl bg-background p-4 border border-white/[0.08] shadow-inner">
      <button
        onClick={() => void handleCopy()}
        aria-label={
          copyState === "failed"
            ? "Copy failed"
            : copyState === "copied"
              ? "Copied"
              : "Copy payload"
        }
        className="absolute right-2 top-2 rounded-md border border-white/[0.08] bg-white/[0.04] p-1.5 text-muted-dark transition-colors hover:border-white/[0.15] hover:text-foreground"
      >
        {copyState === "copied" ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : copyState === "failed" ? (
          <X className="h-3.5 w-3.5 text-red-400" />
        ) : (
          <ClipboardCopy className="h-3.5 w-3.5" />
        )}
      </button>
      <pre className="font-mono text-xs leading-relaxed text-white/70 whitespace-pre-wrap break-all">
        {tokens}
      </pre>
    </div>
  );
}
