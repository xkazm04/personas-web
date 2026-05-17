"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface StatBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: "cyan" | "purple" | "emerald" | "amber" | "rose" | "blue";
  href?: string;
  /** Briefly outline-pulse the badge when `value` grows. Default: off. */
  pulseOnIncrease?: boolean;
}

const colorMap = {
  cyan: "border-cyan-500/20 bg-cyan-500/8 text-cyan-400",
  purple: "border-purple-500/20 bg-purple-500/8 text-purple-400",
  emerald: "border-emerald-500/20 bg-emerald-500/8 text-emerald-400",
  amber: "border-amber-500/20 bg-amber-500/8 text-amber-400",
  rose: "border-rose-500/20 bg-rose-500/8 text-rose-400",
  blue: "border-blue-500/20 bg-blue-500/8 text-blue-400",
};

export default function StatBadge({
  icon: Icon,
  label,
  value,
  accent,
  href,
  pulseOnIncrease = false,
}: StatBadgeProps) {
  const reducedMotion = useReducedMotion();
  const [prevValue, setPrevValue] = useState(value);
  const [pulseKey, setPulseKey] = useState(0);

  // React 19 prev-state pattern: derive pulse from value transitions in
  // render rather than setState-in-effect.
  if (value !== prevValue) {
    setPrevValue(value);
    if (pulseOnIncrease && !reducedMotion) {
      const prevNum = parseFloat(String(prevValue));
      const curNum = parseFloat(String(value));
      if (Number.isFinite(prevNum) && Number.isFinite(curNum) && curNum > prevNum) {
        setPulseKey((n) => n + 1);
      }
    }
  }

  const content = (
    <div
      className={`relative group flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all hover:scale-[1.02] ${colorMap[accent]}`}
    >
      {pulseKey > 0 && (
        <motion.span
          key={pulseKey}
          aria-hidden
          initial={{ opacity: 0.55, scale: 1 }}
          animate={{ opacity: 0, scale: 1.35 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="pointer-events-none absolute -inset-0.5 rounded-xl ring-2 ring-current"
        />
      )}
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
