"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export type StatAccent = "emerald" | "cyan" | "purple" | "amber" | "rose";

const ICON_COLOR: Record<StatAccent, string> = {
  emerald: "text-emerald-400",
  cyan: "text-cyan-400",
  purple: "text-purple-400",
  amber: "text-amber-400",
  rose: "text-rose-400",
};

/**
 * Compact stat tile for the mobile Overview — sized so all four fit one row on
 * a phone. Colored icon, large value, small label. Optionally a tappable
 * drill-in (whileTap press). Purpose-built for `/m`, not the desktop StatBadge.
 */
export default function MobileStatCard({
  icon: Icon,
  label,
  value,
  accent,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent: StatAccent;
  href?: string;
}) {
  const reduced = useReducedMotion();

  const content = (
    <div className="flex h-full flex-col items-center justify-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-1 py-2.5 text-center">
      <Icon className={`h-[18px] w-[18px] ${ICON_COLOR[accent]}`} />
      <span className="text-lg font-bold leading-none tabular-nums text-foreground">
        {value}
      </span>
      <span className="line-clamp-2 text-[10px] font-medium leading-tight text-muted-dark">
        {label}
      </span>
    </div>
  );

  if (href) {
    return (
      <motion.div
        whileTap={reduced ? undefined : { scale: 0.95 }}
        className="h-full"
      >
        <Link href={href} className="focus-ring block h-full rounded-xl">
          {content}
        </Link>
      </motion.div>
    );
  }

  return content;
}
