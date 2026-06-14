"use client";

import { useState, useCallback } from "react";
import { Copy, Check, X } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

type CopyState = "idle" | "copied" | "failed";

function legacyCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
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

export function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");

  const handleCopy = useCallback(async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacyCopy(text);
    }
    setState(ok ? "copied" : "failed");
    setTimeout(() => setState("idle"), ok ? 1500 : 2500);
  }, [text]);

  const copied = state === "copied";
  const failed = state === "failed";

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : failed ? "Copy failed — press Ctrl+C" : "Copy to clipboard"}
        title={failed ? "Copy failed — press Ctrl+C" : undefined}
        className={`inline-flex items-center gap-1.5 rounded-lg border bg-white/[0.05] px-2 py-1 text-xs font-medium backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.1] ${
          copied
            ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/[0.08]"
            : failed
            ? "text-rose-400 border-rose-400/20 bg-rose-400/[0.08]"
            : "border-glass-hover text-muted-dark/70 hover:border-glass-strong sm:opacity-40 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100"
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            <span>Copied!</span>
          </>
        ) : failed ? (
          <>
            <X className="h-3 w-3" />
            <span>Press Ctrl+C</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            <span className="hidden sm:inline">Copy</span>
          </>
        )}
      </button>
      {/* Announce copy result to screen readers (the button's visible label
          swap alone is not reliably announced). */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : failed ? "Copy failed, press Control+C to copy" : ""}
      </span>
    </>
  );
}
