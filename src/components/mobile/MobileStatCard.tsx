"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, type LucideIcon } from "lucide-react";

export type StatAccent = "emerald" | "cyan" | "purple" | "amber" | "rose";

const ICON_ACCENT: Record<StatAccent, string> = {
  emerald: "bg-emerald-500/12 text-emerald-300 ring-emerald-500/20",
  cyan: "bg-cyan-500/12 text-cyan-300 ring-cyan-500/20",
  purple: "bg-purple-500/12 text-purple-300 ring-purple-500/20",
  amber: "bg-amber-500/12 text-amber-300 ring-amber-500/20",
  rose: "bg-rose-500/12 text-rose-300 ring-rose-500/20",
};

/**
 * Touch-sized stat tile for the mobile Overview: a colored icon chip, a large
 * neutral value, and a muted label. Optionally a tappable drill-in (chevron +
 * whileTap press). Purpose-built for `/m` rather than reusing the desktop
 * StatBadge pill, which reads too small on a phone.
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
    <div className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="flex items-start justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-inset ${ICON_ACCENT[accent]}`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {href && <ChevronRight className="h-4 w-4 text-muted-dark/60" />}
      </div>
      <div>
        <div className="text-2xl font-bold leading-none tabular-nums text-foreground">
          {value}
        </div>
        <div className="mt-1.5 text-[13px] leading-tight text-muted-dark">
          {label}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <motion.div
        whileTap={reduced ? undefined : { scale: 0.97 }}
        className="h-full"
      >
        <Link href={href} className="focus-ring block h-full rounded-2xl">
          {content}
        </Link>
      </motion.div>
    );
  }

  return content;
}
