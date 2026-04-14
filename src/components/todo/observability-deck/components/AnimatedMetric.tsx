"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (ts: number) => {
      const t = Math.min((ts - start) / dur, 1);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

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
