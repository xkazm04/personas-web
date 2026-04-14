"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface StatBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: "cyan" | "purple" | "emerald" | "amber";
  href?: string;
}

const colorMap = {
  cyan: "border-cyan-500/20 bg-cyan-500/8 text-cyan-400",
  purple: "border-purple-500/20 bg-purple-500/8 text-purple-400",
  emerald: "border-emerald-500/20 bg-emerald-500/8 text-emerald-400",
  amber: "border-amber-500/20 bg-amber-500/8 text-amber-400",
};

export default function StatBadge({ icon: Icon, label, value, accent, href }: StatBadgeProps) {
  const content = (
    <div
      className={`group flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all hover:scale-[1.02] ${colorMap[accent]}`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold tabular-nums">{value}</span>
        <span className="text-sm text-muted-dark">{label}</span>
      </div>
      {href && (
        <ArrowUpRight className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
