"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import type { GuideTopic } from "@/data/guide/types";
import { TOPIC_MODULE_MAP } from "@/data/guide/desktop-modules";
import ModuleBadge from "@/components/guide/ModuleBadge";
import { fadeUp, staggerContainer } from "@/lib/animations";

/* ── Props ────────────────────────────────────────────────────────────── */

interface CategoryTopicsProps {
  topics: GuideTopic[];
  color: string;
  categoryId: string;
}

/* ── Component ────────────────────────────────────────────────────────── */

export default function CategoryTopics({ topics, color, categoryId }: CategoryTopicsProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return topics;
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [query, topics]);

  return (
    <div className="mt-10">
      {/* Search within category */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-dark" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Filter ${topics.length} topics...`}
          aria-label="Filter topics in this category"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-11 pr-4 text-base text-foreground placeholder:text-muted-dark backdrop-blur-sm outline-none transition-all duration-300 focus:border-brand-cyan/30 focus:ring-2 focus:ring-brand-cyan/10"
        />
      </div>

      {/* Results count when filtering */}
      {query.trim() && (
        <p className="mt-4 text-base text-muted-dark">
          {filtered.length} result{filtered.length !== 1 && "s"} found
        </p>
      )}

      {/* Topic cards grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mt-6 grid gap-4 sm:grid-cols-2"
      >
        {filtered.map((topic) => (
          <motion.div key={topic.id} variants={fadeUp}>
            <Link
              href={`/guide/${categoryId}/${topic.id}`}
              className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]"
            >
              <h3 className="text-lg font-semibold text-foreground group-hover:text-brand-cyan transition-colors">
                {topic.title}
              </h3>
              {TOPIC_MODULE_MAP[topic.id] && (
                <div className="mt-1.5">
                  <ModuleBadge moduleRef={TOPIC_MODULE_MAP[topic.id]} compact />
                </div>
              )}
              <p className="mt-2 text-base leading-relaxed text-muted-dark line-clamp-3">
                {topic.description}
              </p>

              {/* Tags */}
              {topic.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {topic.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2 py-0.5 text-sm font-medium"
                      style={{ backgroundColor: `${color}12`, color }}
                    >
                      {tag}
                    </span>
                  ))}
                  {topic.tags.length > 5 && (
                    <span className="rounded-full px-2 py-0.5 text-sm font-medium text-muted-dark">
                      +{topic.tags.length - 5}
                    </span>
                  )}
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty state */}
      {filtered.length === 0 && query.trim() && (
        <p className="mt-12 text-center text-muted-dark">
          No topics match &ldquo;{query}&rdquo; in this category.
        </p>
      )}
    </div>
  );
}
