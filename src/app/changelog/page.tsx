"use client";

import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";
import { RELEASES, CHANGE_TYPE_META } from "@/data/changelog";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function ChangelogPage() {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={[{ label: "CHANGELOG", href: "#changelog" }]}>
        <div className="h-24" />

        <SectionWrapper id="changelog" aria-label="Changelog">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-cyan/70">
              Changelog
            </p>
            <SectionHeading>
              What&apos;s{" "}
              <GradientText className="drop-shadow-lg">new</GradientText>
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              Version history and release notes for the Personas desktop app.
              Every update, every improvement, every fix.
            </p>
          </motion.div>

          <div className="mx-auto max-w-3xl space-y-0">
            {RELEASES.map((release, i) => (
              <motion.div
                key={release.version}
                variants={fadeUp}
                className="relative pl-8 pb-12 last:pb-0"
              >
                {/* Timeline line */}
                {i < RELEASES.length - 1 && (
                  <div className="absolute left-[11px] top-8 bottom-0 w-px bg-white/[0.06]" />
                )}

                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-brand-cyan/30 bg-brand-cyan/10">
                  <Tag className="h-3 w-3 text-brand-cyan" />
                </div>

                {/* Version header */}
                <div className="flex flex-wrap items-baseline gap-3 mb-4">
                  <span className="rounded-md border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-1 text-sm font-mono font-semibold text-brand-cyan">
                    v{release.version}
                  </span>
                  <span className="text-sm text-muted">{formatDate(release.date)}</span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {release.summary}
                </h3>

                {/* Changes */}
                <div className="space-y-2">
                  {release.changes.map((change, j) => {
                    const meta = CHANGE_TYPE_META[change.type];
                    return (
                      <div key={j} className="flex items-start gap-3">
                        <span
                          className="shrink-0 mt-0.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${meta.color}15`,
                            color: meta.color,
                          }}
                        >
                          {meta.label}
                        </span>
                        <span className="text-sm text-muted leading-relaxed">
                          {change.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}
