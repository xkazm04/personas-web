"use client";

import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import SectionWrapper from "@/components/SectionWrapper";

interface Release {
  version: string;
  date: string;
  summary: string;
}

const releases: Release[] = [
  {
    version: "0.12.0",
    date: "2026-02-28",
    summary: "Cloud execution engine with live event streaming",
  },
  {
    version: "0.11.2",
    date: "2026-02-14",
    summary: "Dashboard polish — status badges, filter bar, and empty states",
  },
  {
    version: "0.11.0",
    date: "2026-01-30",
    summary: "Event bus subscriptions and webhook trigger support",
  },
];

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Changelog() {
  return (
    <SectionWrapper id="changelog" className="py-16 md:py-20">
      <motion.div variants={fadeUp} className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-muted-dark/70 mb-5">
          <Tag className="h-3.5 w-3.5 text-brand-cyan/60" />
          Recent updates
        </div>

        <div className="space-y-0 divide-y divide-white/[0.04]">
          {releases.map((r) => (
            <motion.div
              key={r.version}
              variants={fadeUp}
              className="flex items-baseline gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="shrink-0 rounded-md border border-brand-cyan/15 bg-brand-cyan/5 px-2 py-0.5 text-sm font-mono font-medium text-brand-cyan/80">
                v{r.version}
              </span>
              <span className="shrink-0 text-sm text-muted-dark/60 tabular-nums">
                {formatDate(r.date)}
              </span>
              <span className="text-base text-muted-dark leading-snug">
                {r.summary}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
