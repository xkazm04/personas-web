"use client";

import { motion } from "framer-motion";
import { Tag, Download } from "lucide-react";
import Link from "next/link";
import { fadeUp } from "@/lib/animations";
import SectionWrapper from "@/components/SectionWrapper";
import { formatDateShort as formatDate } from "@/lib/format-date";
import { RELEASES } from "@/data/changelog";

// The 3 most recent releases by date. Reading from the canonical
// data/changelog.ts source instead of a hardcoded copy means a new
// release shipped to /roadmap#changelog also surfaces here automatically;
// previously the homepage advertised stale "latest" versions for
// weeks until someone remembered to bump this file too.
const RECENT_COUNT = 3;
const sortedReleases = [...RELEASES].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);
const releases = sortedReleases.slice(0, RECENT_COUNT);
// Shipping momentum: releases within 90 days of the most recent one. Measured
// against the newest release date (not "today") so the stat stays meaningful
// even if the changelog hasn't been bumped in a while.
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const newestTime = sortedReleases.length ? new Date(sortedReleases[0].date).getTime() : 0;
const recentShipCount = sortedReleases.filter(
  (r) => newestTime - new Date(r.date).getTime() <= NINETY_DAYS_MS,
).length;


export default function Changelog() {
  return (
    <SectionWrapper id="changelog" className="py-16 md:py-20">
      <motion.div variants={fadeUp} className="mx-auto max-w-2xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-muted-dark/70">
            <Tag className="h-3.5 w-3.5 text-brand-cyan/60" />
            Recent updates
          </div>
          {recentShipCount > 1 && (
            <span className="text-sm text-muted-dark">
              <span className="font-semibold text-foreground">{recentShipCount} releases</span> in 90 days
            </span>
          )}
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

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/#download"
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-2 text-sm font-medium text-brand-cyan transition-colors hover:bg-brand-cyan/20"
          >
            <Download className="h-4 w-4" />
            Download free
          </Link>
          <Link
            href="/roadmap#changelog"
            className="text-sm font-medium text-muted-dark transition-colors hover:text-foreground"
          >
            All updates &rarr;
          </Link>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
