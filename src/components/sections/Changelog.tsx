"use client";

import { motion } from "framer-motion";
import { Tag } from "lucide-react";
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
const releases = [...RELEASES]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, RECENT_COUNT);


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
