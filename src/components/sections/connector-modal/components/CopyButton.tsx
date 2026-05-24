"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Check, AlertCircle } from "lucide-react";

type CopyState = "idle" | "copied" | "failed";

function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  let ok = false;
  try {
    textarea.focus();
    textarea.select();
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  } finally {
    document.body.removeChild(textarea);
  }
  return ok;
}

export default function CopyButton({
  text,
  color = "#fff",
  className = "",
}: {
  text: string;
  color?: string;
  className?: string;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (state !== "failed") return;
    const ta = fallbackRef.current;
    if (!ta) return;
    ta.focus();
    ta.select();
  }, [state]);

  const handleCopy = useCallback(async () => {
    let ok = false;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (!ok) ok = legacyCopy(text);

    setState(ok ? "copied" : "failed");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setState("idle"), ok ? 1500 : 4000);
  }, [text]);

  const copied = state === "copied";
  const failed = state === "failed";

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={
          copied
            ? "Copied"
            : failed
              ? "Copy failed — press Ctrl+C to copy"
              : "Copy to clipboard"
        }
        className={`shrink-0 rounded-md p-1.5 transition-colors hover:bg-white/10 ${className}`}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" style={{ color }} />
        ) : failed ? (
          <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-dark hover:text-white transition-colors" />
        )}
      </button>

      {failed && (
        <span
          role="tooltip"
          aria-live="polite"
          className="absolute right-0 top-full z-20 mt-1 w-60 rounded-md border border-glass-hover bg-background p-2 shadow-lg shadow-black/40"
        >
          <span className="block text-xs font-medium text-rose-400">
            Copy failed — press Ctrl+C
          </span>
          <textarea
            ref={fallbackRef}
            readOnly
            value={text}
            onFocus={(e) => e.currentTarget.select()}
            onClick={(e) => e.currentTarget.select()}
            rows={2}
            className="mt-1.5 block w-full resize-none rounded-sm border border-glass bg-black/40 p-1.5 font-mono text-xs text-white outline-none focus:border-glass-hover"
          />
        </span>
      )}
    </span>
  );
}
