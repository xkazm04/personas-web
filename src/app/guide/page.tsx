"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Zap } from "lucide-react";
import GradientText from "@/components/GradientText";
import SearchCombobox from "@/components/guide/SearchCombobox";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { GUIDE_ILLUSTRATIONS } from "@/data/guide/illustrations";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { isTopicVisibleForMode, isCategoryVisibleForMode } from "@/lib/guide-utils";
import type { GuideMode } from "@/data/guide/types";

/* ── Helpers ─────────────────────────────────────────────────────────── */

function topicCountFor(categoryId: string, modeFilter: GuideMode | null) {
  return GUIDE_TOPICS.filter((t) => t.categoryId === categoryId && isTopicVisibleForMode(t, modeFilter)).length;
}

const MODE_OPTIONS: Array<{ value: GuideMode | null; label: string; icon: typeof Sparkles; color: string }> = [
  { value: null, label: "All", icon: Zap, color: "#94a3b8" },
  { value: "simple", label: "Simple", icon: Sparkles, color: "#F59E0B" },
  { value: "power", label: "Power", icon: Zap, color: "#06b6d4" },
];

/* ── Page ─────────────────────────────────────────────────────────────── */

function GuidePageInner() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") as GuideMode | null;
  const [modeFilter, setModeFilter] = useState<GuideMode | null>(initialMode);

  return (
    <div className="px-6 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Personas User Guide",
          description: "Everything you need to know about Personas — from your first agent to advanced multi-agent pipelines. 102 topics across 10 categories.",
          url: "https://personas.ai/guide",
          isPartOf: { "@type": "WebSite", name: "Personas", url: "https://personas.ai" },
          numberOfItems: 102,
        }) }}
      />
      <div className="mx-auto max-w-5xl">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="pt-12 text-center"
        >
          <motion.h1
            variants={fadeUp}
            className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl drop-shadow-md"
          >
            User <GradientText className="drop-shadow-lg">Guide</GradientText>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-2xl text-base text-muted-dark leading-relaxed font-light"
          >
            Everything you need to know about Personas — from your first agent
            to advanced multi-agent pipelines.
          </motion.p>

          {/* ── Search combobox ──────────────────────────────────── */}
          <motion.div variants={fadeUp} className="mx-auto mt-8 max-w-xl">
            <SearchCombobox placeholder="Search 100+ topics..." />
          </motion.div>

          {/* ── Mode filter toggle ──────────────────────────────── */}
          <motion.div variants={fadeUp} className="mt-6 flex items-center justify-center gap-2">
            {MODE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = modeFilter === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() => setModeFilter(opt.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border bg-white/[0.06] shadow-sm"
                      : "border border-transparent text-muted-dark hover:text-foreground hover:bg-white/[0.03]"
                  }`}
                  style={isActive ? { borderColor: `${opt.color}40`, color: opt.color } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {opt.label}
                </button>
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
            className="mt-12 grid gap-4 sm:grid-cols-2"
          >
            {GUIDE_CATEGORIES.filter((cat) => isCategoryVisibleForMode(cat.id, modeFilter)).map((cat) => {
              const count = topicCountFor(cat.id, modeFilter);
              const illus = GUIDE_ILLUSTRATIONS[cat.id];
              return (
                <motion.div key={cat.id} variants={fadeUp}>
                  <Link
                    href={`/guide/${cat.id}`}
                    className="group block overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-white/[0.12]"
                  >
                    {/* Illustration header — dark/light variants swap via CSS */}
                    {illus && (
                      <div className="relative aspect-video w-full overflow-hidden bg-white/[0.02]">
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
                      </div>
                    )}

                    {/* Text content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold group-hover:text-foreground transition-colors">
                          {cat.name}
                        </h3>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-sm font-semibold"
                          style={{
                            backgroundColor: `${cat.color}15`,
                            color: cat.color,
                          }}
                        >
                          {count} topic{count !== 1 && "s"}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-muted-dark leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
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
          className="mt-16 text-center"
        >
          <div className="mx-auto inline-flex flex-col items-center gap-4 rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent px-8 py-6 sm:flex-row sm:gap-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-purple/15 ring-1 ring-brand-purple/20">
              <MessageCircle className="h-5 w-5 text-brand-purple" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-base font-medium">Still have questions?</p>
              <p className="mt-1 text-base text-muted-dark">
                Our community is happy to help.
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center rounded-full border border-brand-purple/20 bg-brand-purple/10 px-6 py-2 text-base font-medium text-brand-purple transition-all duration-300 hover:border-brand-purple/30 hover:bg-brand-purple/15 focus-visible:ring-2 focus-visible:ring-brand-purple/40 focus-visible:outline-none"
            >
              Join our Discord
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
