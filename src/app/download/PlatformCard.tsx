"use client";

import { Monitor, Apple, Terminal, Bell, type LucideIcon } from "lucide-react";
import type { PlatformInfo } from "@/data/download";

const ICONS: Record<string, LucideIcon> = { Monitor, Apple, Terminal };

interface PlatformCardProps {
  platform: PlatformInfo;
  selected: boolean;
  onSelect: () => void;
}

export default function PlatformCard({
  platform,
  selected,
  onSelect,
}: PlatformCardProps) {
  const Icon = ICONS[platform.icon] ?? Monitor;

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center gap-3 rounded-xl border p-6 transition-all duration-200 text-center ${
        selected
          ? "border-brand-cyan/30 bg-brand-cyan/5 shadow-[0_0_30px_rgba(6,182,212,0.08)]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
      }`}
    >
      <Icon
        className={`h-8 w-8 ${selected ? "text-brand-cyan" : "text-muted"}`}
      />
      <span
        className={`text-lg font-semibold ${selected ? "text-foreground" : "text-muted"}`}
      >
        {platform.name}
      </span>
      <span className="text-base text-muted">{platform.fileType}</span>
      {platform.available ? (
        <span className="flex items-center gap-1.5 text-base text-brand-emerald">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-emerald shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
          Available
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-base text-brand-purple">
          <Bell className="h-3 w-3" />
          Coming soon
        </span>
      )}
    </button>
  );
}
