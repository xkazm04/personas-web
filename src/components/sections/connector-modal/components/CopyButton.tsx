"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({
  text,
  color = "#fff",
  className = "",
}: {
  text: string;
  color?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard API unavailable */
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={`shrink-0 rounded-md p-1.5 transition-colors hover:bg-white/10 ${className}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" style={{ color }} />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-dark hover:text-white transition-colors" />
      )}
    </button>
  );
}
