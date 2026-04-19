"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp } from "@/lib/animations";
import type { PlatformInfo } from "@/data/download";

interface InstallGuideProps {
  platform: PlatformInfo;
}

export default function InstallGuide({ platform }: InstallGuideProps) {
  return (
    <SectionWrapper id="install" aria-label="Installation guide">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Requirements */}
        <motion.div variants={fadeUp}>
          <h3 className="text-base font-semibold text-foreground uppercase tracking-wider mb-4">
            System Requirements — {platform.name}
          </h3>
          <div className="rounded-xl border border-glass bg-white/[0.02] backdrop-blur-sm p-6">
            <ul className="space-y-3">
              {platform.requirements.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-base text-muted"
                >
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-brand-cyan/60" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Install steps */}
        <motion.div variants={fadeUp}>
          <h3 className="text-base font-semibold text-foreground uppercase tracking-wider mb-4">
            Installation Steps
          </h3>
          <div className="rounded-xl border border-glass bg-white/[0.02] backdrop-blur-sm p-6">
            <ol className="space-y-4">
              {platform.installSteps.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-base text-muted"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-cyan/10 text-brand-cyan text-base font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* After install links */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { href: "/#get-started", label: "Take the product tour" },
              { href: "/guide/getting-started", label: "Getting started guide" },
              { href: "/security", label: "Security & Privacy" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-glass bg-white/[0.02] px-4 py-2 text-base text-muted hover:border-glass-hover hover:text-foreground transition-colors"
              >
                {link.label}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
