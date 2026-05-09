"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useTweenedNumber } from "@/hooks/useTweenedNumber";

interface AnimatedMetricProps {
  target: number;
  prefix?: string;
  suffix?: string;
  color: string;
  label: string;
  trend: string;
}

export default function AnimatedMetric({
  target,
  prefix,
  suffix,
  color,
  label,
  trend,
}: AnimatedMetricProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const value = useTweenedNumber(target, { enabled: inView && !reduced });

  const formatted = target >= 10 ? Math.round(value).toString() : value.toFixed(1);

  return (
    <div ref={ref} className="p-5 text-center">
      <div className="text-2xl font-bold font-mono" style={{ color }}>
        {prefix}
        {formatted}
        {suffix}
      </div>
      <div className="text-base font-mono text-foreground/70 mt-1">{label}</div>
      <div className="text-base font-mono text-brand-emerald mt-0.5">{trend}</div>
    </div>
  );
}
