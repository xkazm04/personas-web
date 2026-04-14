"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Zap, BookOpen, ArrowRight } from "lucide-react";
import GradientText from "@/components/GradientText";
import SearchCombobox from "@/components/guide/SearchCombobox";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { GUIDE_ILLUSTRATIONS } from "@/data/guide/illustrations";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { isTopicVisibleForMode, isCategoryVisibleForMode } from "@/lib/guide-utils";
import type { GuideMode } from "@/data/guide/types";
import { BRAND_VAR, tint, brandShadow, hexToBrand, type BrandKey } from "@/lib/brand-theme";
import { ThemedChip } from "@/components/primitives";

/* ── Helpers ─────────────────────────────────────────────────────────── */

function topicCountFor(categoryId: string, modeFilter: GuideMode | null) {
  return GUIDE_TOPICS.filter(
    (t) => t.categoryId === categoryId && isTopicVisibleForMode(t, modeFilter),
  ).length;
}

const MODE_OPTIONS: Array<{
  value: GuideMode | null;
  label: string;
  icon: typeof Sparkles;
  brand: BrandKey;
}> = [
  { value: null, label: "All modes", icon: BookOpen, brand: "cyan" },
  { value: "simple", label: "Simple", icon: Sparkles, brand: "amber" },
  { value: "power", label: "Power", icon: Zap, brand: "blue" },
];

/* ── Page ─────────────────────────────────────────────────────────────── */

function GuidePageInner() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") as GuideMode | null;
  const [modeFilter, setModeFilter] = useState<GuideMode | null>(initialMode);

  const visibleCategories = GUIDE_CATEGORIES.filter((cat) =>
    isCategoryVisibleForMode(cat.id, modeFilter),
  );

  const totalTopics = visibleCategories.reduce(
    (sum, c) => sum + topicCountFor(c.id, modeFilter),
    0,
  );

  return (
    <div className="px-6 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Personas User Guide",
            description:
              "Everything you need to know about Personas — from your first agent to advanced multi-agent pipelines. 102 topics across 10 categories.",
            url: "https://personas.ai/guide",
            isPartOf: {
              "@type": "WebSite",
              name: "Personas",
              url: "https://personas.ai",
            },
            numberOfItems: 102,
          }),
        }}
      />
      <div className="mx-auto max-w-6xl">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="pt-12 text-center"
        >
          <motion.p
            variants={fadeUp}
            className="mb-4 text-base font-semibold uppercase tracking-widest"
            style={{ color: BRAND_VAR.purple }}
          >
            Guide
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl drop-shadow-md"
          >
            User{" "}
            <GradientText className="drop-shadow-lg">Guide</GradientText>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light"
          >
            Everything you need to know about Personas — from your first agent
            to advanced multi-agent pipelines.{" "}
            <span className="font-semibold text-foreground/80">
              {totalTopics} topics
            </span>{" "}
            across {visibleCategories.length} categories.
          </motion.p>

          {/* ── Search combobox ──────────────────────────────────── */}
          <motion.div variants={fadeUp} className="mx-auto mt-10 max-w-xl">
            <SearchCombobox placeholder="Search 100+ topics..." />
          </motion.div>

          {/* ── Mode filter toggle ──────────────────────────────── */}
          <motion.div
            variants={fadeUp}
            className="mt-8 inline-flex items-center gap-1 rounded-full border p-1"
            style={{
              borderColor: "rgba(var(--surface-overlay), 0.08)",
              backgroundColor: "rgba(var(--surface-overlay), 0.02)",
            }}
          >
            {MODE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <ThemedChip
                  key={opt.label}
                  brand={opt.brand}
                  active={modeFilter === opt.value}
                  onClick={() => setModeFilter(opt.value)}
                  icon={<Icon className="h-4 w-4" />}
                >
                  {opt.label}
                </ThemedChip>
              );
            })}
          </motion.div>
        </motion.div>

        {/* ── Category grid ─────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visibleCategories.map((cat) => {
            const count = topicCountFor(cat.id, modeFilter);
            const illus = GUIDE_ILLUSTRATIONS[cat.id];
            const brand = hexToBrand(cat.color);
            const bv = BRAND_VAR[brand];
            return (
              <motion.div key={cat.id} variants={fadeUp}>
                <Link
                  href={`/guide/${cat.id}`}
                  className="group relative block overflow-hidden rounded-2xl border transition-all duration-500 hover:scale-[1.01]"
                  style={{
                    borderColor: "rgba(var(--surface-overlay), 0.08)",
                    backgroundColor: "rgba(var(--surface-overlay), 0.02)",
                    backgroundImage: `linear-gradient(180deg, transparent 0%, ${tint(brand, 8)} 100%)`,
                  }}
                >
                  {/* Illustration header — dark/light variants */}
                  {illus && (
                    <div
                      className="relative aspect-video w-full overflow-hidden"
                      style={{ backgroundColor: tint(brand, 6) }}
                    >
                      <Image
                        src={illus.dark}
                        alt={cat.name}
                        width={800}
                        height={400}
                        aria-hidden="true"
                        className="hidden dark:block h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <Image
                        src={illus.light}
                        alt={cat.name}
                        width={800}
                        height={400}
                        className="block dark:hidden h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Bottom gradient fade into card */}
                      <div
                        className="absolute inset-x-0 bottom-0 h-1/2"
                        style={{
                          backgroundImage:
                            "linear-gradient(180deg, transparent 0%, rgba(var(--background-rgb, 10,10,18), 0.85) 100%)",
                        }}
                      />
                    </div>
                  )}

                  {/* Text content */}
                  <div className="relative p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3
                        className="text-xl font-extrabold tracking-tight leading-tight"
                        style={{
                          color: bv,
                          textShadow: `0 0 24px ${tint(brand, 30)}`,
                        }}
                      >
                        {cat.name}
                      </h3>
                      <span
                        className="shrink-0 rounded-full px-3 py-1 text-base font-semibold tabular-nums"
                        style={{
                          backgroundColor: tint(brand, 16),
                          color: bv,
                        }}
                      >
                        {count}
                      </span>
                    </div>
                    <p className="text-base text-foreground/75 leading-relaxed line-clamp-2 mb-4">
                      {cat.description}
                    </p>
                    <div
                      className="inline-flex items-center gap-1.5 text-base font-semibold transition-transform group-hover:translate-x-0.5"
                      style={{ color: bv }}
                    >
                      Explore
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Discord CTA ───────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-16 mx-auto max-w-3xl"
        >
          <div
            className="flex flex-col items-center gap-5 rounded-2xl border p-8 sm:flex-row sm:gap-6"
            style={{
              borderColor: "rgba(var(--surface-overlay), 0.08)",
              backgroundColor: "rgba(var(--surface-overlay), 0.02)",
              backgroundImage: `linear-gradient(135deg, ${tint("purple", 10)} 0%, transparent 60%)`,
            }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: tint("purple", 18),
                boxShadow: brandShadow("purple", 32, 28),
              }}
            >
              <MessageCircle
                className="h-5 w-5"
                style={{ color: BRAND_VAR.purple }}
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-lg font-bold" style={{ color: BRAND_VAR.purple }}>
                Still have questions?
              </p>
              <p className="mt-1 text-base text-foreground/75">
                Our community is happy to help — real answers from real builders.
              </p>
            </div>
            <a
              href="https://discord.gg/personas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-base font-semibold transition-colors"
              style={{
                color: BRAND_VAR.purple,
                backgroundColor: tint("purple", 14),
                border: `1px solid ${tint("purple", 35)}`,
              }}
            >
              Join our Discord
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense>
      <GuidePageInner />
    </Suspense>
  );
}
