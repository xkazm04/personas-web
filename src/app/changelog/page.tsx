"use client";

import { motion } from "framer-motion";
import { Tag, Sparkles, Wrench, Bug, AlertTriangle, type LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import { SectionIntro } from "@/components/primitives";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { RELEASES, type ChangeType } from "@/data/changelog";
import { BRAND_VAR, tint, brandShadow, type BrandKey } from "@/lib/brand-theme";
import { formatDateLong as formatDate } from "@/lib/format-date";

const CHANGE_META: Record<
  ChangeType,
  { label: string; brand: BrandKey; icon: LucideIcon }
> = {
  feature: { label: "New", brand: "emerald", icon: Sparkles },
  improvement: { label: "Improved", brand: "cyan", icon: Wrench },
  fix: { label: "Fixed", brand: "amber", icon: Bug },
  breaking: { label: "Breaking", brand: "rose", icon: AlertTriangle },
};

export default function ChangelogPage() {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={[{ label: "CHANGELOG", href: "#changelog" }]}>
        <div className="h-24" />

        <SectionWrapper id="changelog" aria-label="Changelog">
          <SectionIntro
            eyebrow="Changelog"
            heading="What's"
            gradient="new"
            description="Version history and release notes for the Personas desktop app — every update, every improvement, every fix."
            className="mb-16"
          />

          {/* Highlights strip — shows counts across all change types */}
          <motion.div
            variants={fadeUp}
            className="mx-auto max-w-4xl mb-14 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {(Object.keys(CHANGE_META) as ChangeType[]).map((t) => {
              const meta = CHANGE_META[t];
              const Icon = meta.icon;
              const count = RELEASES.flatMap((r) => r.changes).filter(
                (c) => c.type === t
              ).length;
              const bv = BRAND_VAR[meta.brand];
              return (
                <div
                  key={t}
                  className="flex items-center gap-3 rounded-xl border px-4 py-3"
                  style={{
                    borderColor: "rgba(var(--surface-overlay), 0.08)",
                    backgroundColor: tint(meta.brand, 8),
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: tint(meta.brand, 18) }}
                  >
                    <Icon className="h-4 w-4" style={{ color: bv }} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-2xl font-extrabold tabular-nums tracking-tight"
                      style={{ color: bv }}
                    >
                      {count}
                    </div>
                    <div className="text-base font-medium text-muted-dark leading-none mt-0.5">
                      {meta.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Timeline */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="mx-auto max-w-4xl relative"
          >
            {/* Vertical rail behind all releases */}
            <div
              className="absolute left-[23px] top-8 bottom-8 w-px"
              style={{ backgroundColor: "rgba(var(--surface-overlay), 0.08)" }}
            />

            {RELEASES.map((release, i) => (
              <motion.div
                key={release.version}
                variants={fadeUp}
                className="relative pl-16 pb-14 last:pb-0"
              >
                {/* Version bubble */}
                <div
                  className="absolute left-0 top-1 flex h-12 w-12 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: tint("cyan", 45),
                    backgroundColor: "var(--background)",
                    boxShadow: brandShadow("cyan", 32, 25),
                  }}
                >
                  <Tag className="h-5 w-5" style={{ color: BRAND_VAR.cyan }} />
                </div>

                {/* Release card */}
                <div
                  className="relative rounded-2xl border p-6 sm:p-7"
                  style={{
                    borderColor: "rgba(var(--surface-overlay), 0.08)",
                    backgroundColor: "rgba(var(--surface-overlay), 0.02)",
                    backgroundImage: i === 0
                      ? `linear-gradient(135deg, ${tint("cyan", 10)} 0%, transparent 55%)`
                      : undefined,
                  }}
                >
                  {/* Header row */}
                  <div className="flex flex-wrap items-baseline gap-3 mb-4">
                    <span
                      className="rounded-lg px-3 py-1 text-lg font-mono font-bold"
                      style={{
                        color: BRAND_VAR.cyan,
                        backgroundColor: tint("cyan", 12),
                        border: `1px solid ${tint("cyan", 35)}`,
                      }}
                    >
                      v{release.version}
                    </span>
                    <span className="text-base text-muted-dark">
                      {formatDate(release.date)}
                    </span>
                    {i === 0 && (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-base font-semibold uppercase tracking-wider"
                        style={{
                          color: BRAND_VAR.emerald,
                          backgroundColor: tint("emerald", 14),
                        }}
                      >
                        Latest
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-2xl font-extrabold tracking-tight text-foreground mb-5 leading-tight"
                    style={{ textShadow: i === 0 ? `0 0 32px ${tint("cyan", 22)}` : undefined }}
                  >
                    {release.summary}
                  </h3>

                  {/* Change list */}
                  <ul className="space-y-2.5">
                    {release.changes.map((change, j) => {
                      const meta = CHANGE_META[change.type];
                      const Icon = meta.icon;
                      const bv = BRAND_VAR[meta.brand];
                      return (
                        <li
                          key={j}
                          className="flex items-start gap-3 rounded-lg px-3 py-2"
                          style={{
                            backgroundColor: "rgba(var(--surface-overlay), 0.02)",
                          }}
                        >
                          <span
                            className="shrink-0 flex items-center gap-1.5 rounded-md px-2 py-1 text-base font-semibold uppercase tracking-wider"
                            style={{
                              backgroundColor: tint(meta.brand, 16),
                              color: bv,
                            }}
                          >
                            <Icon className="h-3 w-3" />
                            {meta.label}
                          </span>
                          <span className="text-base text-foreground/80 leading-relaxed">
                            {change.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}
