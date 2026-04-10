"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MessageCircle,
  Rocket,
  Bot,
  Zap,
  ShieldCheck,
  GitBranch,
  FlaskConical,
  Brain,
  BarChart3,
  Cloud,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import GradientText from "@/components/GradientText";
import { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import type { GuideTopic } from "@/data/guide/types";
import { fadeUp, staggerContainer } from "@/lib/animations";

/* ── Icon map ────────────────────────────────────────────────────────── */

const iconMap: Record<string, LucideIcon> = {
  Rocket,
  Bot,
  Zap,
  ShieldCheck,
  GitBranch,
  FlaskConical,
  Brain,
  BarChart3,
  Cloud,
  Wrench,
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

function topicCountFor(categoryId: string) {
  return GUIDE_TOPICS.filter((t) => t.categoryId === categoryId).length;
}

function categoryName(categoryId: string) {
  return GUIDE_CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId;
}

function categoryColor(categoryId: string) {
  return GUIDE_CATEGORIES.find((c) => c.id === categoryId)?.color ?? "#888";
}

/* ── Search logic ────────────────────────────────────────────────────── */

function filterTopics(query: string): GuideTopic[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return GUIDE_TOPICS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)),
  );
}

function groupByCategory(topics: GuideTopic[]) {
  const groups: Record<string, GuideTopic[]> = {};
  for (const t of topics) {
    (groups[t.categoryId] ??= []).push(t);
  }
  return groups;
}

/* ── Page ─────────────────────────────────────────────────────────────── */

const MAX_VISIBLE = 20;

export default function GuidePage() {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const results = useMemo(() => filterTopics(query), [query]);
  const visibleResults = showAll ? results : results.slice(0, MAX_VISIBLE);
  const visibleGrouped = useMemo(() => groupByCategory(visibleResults), [visibleResults]);

  return (
    <>
      <Navbar />
      {/* Spacer for fixed navbar */}
      <div className="h-24" />

      <main className="min-h-screen px-6 pb-32">
        <div className="mx-auto max-w-6xl">
          {/* ── Hero ──────────────────────────────────────────────── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="pt-16 text-center"
          >
            <motion.h1
              variants={fadeUp}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl drop-shadow-md"
            >
              User <GradientText className="drop-shadow-lg">Guide</GradientText>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-dark leading-relaxed font-light"
            >
              Everything you need to know about Personas — from your first agent
              to advanced multi-agent pipelines.
            </motion.p>

            {/* ── Search bar ──────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="mx-auto mt-10 max-w-xl">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-dark" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowAll(false);
                  }}
                  placeholder="Search 100+ topics..."
                  className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-3.5 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-dark backdrop-blur-sm outline-none transition-all duration-300 focus:border-brand-cyan/30 focus:ring-2 focus:ring-brand-cyan/10"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* ── Search results ────────────────────────────────────── */}
          {query.trim() && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mt-12"
            >
              {results.length === 0 ? (
                <motion.p variants={fadeUp} className="text-center text-muted-dark">
                  No topics match &ldquo;{query}&rdquo;. Try a different search.
                </motion.p>
              ) : (
                <>
                  <motion.p variants={fadeUp} className="mb-6 text-sm text-muted-dark">
                    {results.length} result{results.length !== 1 && "s"} found
                  </motion.p>

                  {Object.entries(visibleGrouped).map(([catId, topics]) => (
                    <motion.div key={catId} variants={fadeUp} className="mb-8">
                      <h3
                        className="mb-3 text-xs font-semibold uppercase tracking-widest"
                        style={{ color: categoryColor(catId) }}
                      >
                        {categoryName(catId)}
                      </h3>
                      <div className="space-y-2">
                        {topics.map((topic) => (
                          <Link
                            key={topic.id}
                            href={`/guide/${topic.categoryId}`}
                            className="group block rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                                  {topic.title}
                                </p>
                                <p className="mt-1 text-xs text-muted-dark line-clamp-1">
                                  {topic.description}
                                </p>
                              </div>
                              <span
                                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{
                                  backgroundColor: `${categoryColor(topic.categoryId)}15`,
                                  color: categoryColor(topic.categoryId),
                                }}
                              >
                                {categoryName(topic.categoryId)}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  {!showAll && results.length > MAX_VISIBLE && (
                    <motion.div variants={fadeUp} className="text-center">
                      <button
                        onClick={() => setShowAll(true)}
                        className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2 text-sm font-medium text-muted transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-foreground"
                      >
                        Show all {results.length} results
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── Category grid ─────────────────────────────────────── */}
          {!query.trim() && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={staggerContainer}
              className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {GUIDE_CATEGORIES.map((cat) => {
                const Icon = iconMap[cat.icon];
                const count = topicCountFor(cat.id);
                return (
                  <motion.div key={cat.id} variants={fadeUp}>
                    <Link
                      href={`/guide/${cat.id}`}
                      className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/[0.12]"
                      style={{
                        // @ts-expect-error -- CSS custom property for hover shadow
                        "--cat-shadow": `${cat.color}20`,
                      }}
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${cat.color}15` }}
                        >
                          {Icon && <Icon className="h-5 w-5" style={{ color: cat.color }} />}
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${cat.color}15`,
                            color: cat.color,
                          }}
                        >
                          {count} topic{count !== 1 && "s"}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold group-hover:text-foreground transition-colors">
                        {cat.name}
                      </h3>
                      <p className="mt-2 text-sm text-muted-dark leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ── Discord CTA ───────────────────────────────────────── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-24 text-center"
          >
            <div className="mx-auto inline-flex flex-col items-center gap-4 rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent px-8 py-6 sm:flex-row sm:gap-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-purple/15 ring-1 ring-brand-purple/20">
                <MessageCircle className="h-5 w-5 text-brand-purple" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium">Still have questions?</p>
                <p className="mt-1 text-sm text-muted-dark">
                  Our community is happy to help.
                </p>
              </div>
              <a
                href="#"
                className="inline-flex items-center rounded-full border border-brand-purple/20 bg-brand-purple/10 px-6 py-2 text-sm font-medium text-brand-purple transition-all duration-300 hover:border-brand-purple/30 hover:bg-brand-purple/15 focus-visible:ring-2 focus-visible:ring-brand-purple/40 focus-visible:outline-none"
              >
                Join our Discord
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}
