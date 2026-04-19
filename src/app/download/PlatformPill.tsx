"use client";

import { Monitor, Apple, Terminal, type LucideIcon } from "lucide-react";
import type { PlatformInfo } from "@/data/download";

const ICONS: Record<string, LucideIcon> = { Monitor, Apple, Terminal };

interface PlatformPillProps {
  platform: PlatformInfo;
  selected: boolean;
  onSelect: () => void;
}

export default function PlatformPill({
  platform,
  selected,
  onSelect,
}: PlatformPillProps) {
  const Icon = ICONS[platform.icon] ?? Monitor;

  return (
    <button
      onClick={onSelect}
      className={`flex flex-1 items-center justify-center gap-2 rounded-full border min-h-[48px] min-w-[48px] px-4 py-3 transition-all duration-200 ${
        selected
          ? "border-brand-cyan/30 bg-brand-cyan/5 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
          : "border-glass bg-white/[0.02] hover:border-glass-hover"
      }`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 ${selected ? "text-brand-cyan" : "text-muted"}`}
      />
      <span
        className={`text-sm font-semibold whitespace-nowrap ${selected ? "text-foreground" : "text-muted"}`}
      >
        {platform.name}
      </span>
    </button>
  );
}
