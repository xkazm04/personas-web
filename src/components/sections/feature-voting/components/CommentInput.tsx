"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function CommentInput({
  onSubmit,
  placeholder,
  accentRgba,
  autoFocus = false,
}: {
  onSubmit: (text: string) => void;
  placeholder: string;
  accentRgba: (a: number) => string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={280}
        className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-base text-foreground placeholder:text-muted-dark outline-none transition-all duration-300 focus:border-white/[0.12] focus:bg-white/[0.03]"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 cursor-pointer"
        style={
          value.trim()
            ? {
                borderColor: accentRgba(0.25),
                backgroundColor: accentRgba(0.1),
                color: accentRgba(1),
              }
            : {
                borderColor: "rgba(255,255,255,0.06)",
                backgroundColor: "rgba(255,255,255,0.02)",
                color: "var(--muted-dark)",
              }
        }
      >
        <Send className="h-3 w-3" />
      </button>
    </div>
  );
}
