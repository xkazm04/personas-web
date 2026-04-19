"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-glass-hover bg-white/[0.05] px-2 py-1 text-xs font-medium backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.1] hover:border-glass-strong ${
        copied
          ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/[0.08]"
          : "text-muted-dark/70 sm:opacity-0 sm:group-hover:opacity-100"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span className="hidden sm:inline">Copy</span>
        </>
      )}
    </button>
  );
}
