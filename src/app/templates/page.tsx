"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Clock, Webhook, Mouse, Zap, Radio, ChevronRight, type LucideIcon } from "lucide-react";
import { templates, categories, difficultyColors, type Category, type AgentTemplate } from "@/lib/templates";
import { fadeUp, staggerContainer } from "@/lib/animations";
import Navbar from "@/components/Navbar";

const triggerIcons: Record<string, LucideIcon> = { schedule: Clock, webhook: Webhook, manual: Mouse, event: Zap, polling: Radio };

const categoryAccent: Record<Category, string> = {
  DevOps: "border-brand-purple", Communication: "border-brand-cyan", Productivity: "border-brand-emerald",
  Finance: "border-green-400", Sales: "border-orange-400", Support: "border-cyan-400",
  Research: "border-violet-400", Marketing: "border-pink-400", Legal: "border-stone-400", Security: "border-red-400",
};

type Complexity = "basic" | "professional" | "enterprise";
const complexities: { value: Complexity | null; label: string }[] = [
  { value: null, label: "All" }, { value: "basic", label: "Basic" },
  { value: "professional", label: "Professional" }, { value: "enterprise", label: "Enterprise" },
];

function TemplateCard({ template }: { template: AgentTemplate }) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        href={`/templates/${template.id}`}
        className={`group relative flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.05] border-l-2 ${categoryAccent[template.category]} h-full`}
      >
        {/* Service flow pills */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {template.serviceFlow.map((svc) => (
            <span key={svc} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-medium text-muted">
              {svc}
            </span>
          ))}
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1.5">{template.title}</h3>
        <p className="mb-4 flex-1 text-base leading-relaxed text-muted-dark line-clamp-2">{template.description}</p>

        {/* Bottom: complexity + difficulty + trigger icons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-medium capitalize bg-white/[0.04] border-white/10 text-muted">
            {template.complexity}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${difficultyColors[template.difficulty]}`}>
            {template.difficulty}
          </span>
          <span className="flex-1" />
          {template.triggers.map((tr) => {
            const Icon = triggerIcons[tr];
            return Icon ? <Icon key={tr} className="h-3.5 w-3.5 text-muted-dark" aria-label={tr} /> : null;
          })}
        </div>

        {/* Hover overlay */}
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
          <span className="flex items-center gap-1 text-sm font-medium text-white">
            View Details <ChevronRight className="h-4 w-4" />
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeComplexity, setActiveComplexity] = useState<Complexity | null>(null);

  const categoryCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of categories) m[c] = templates.filter((t) => t.category === c).length;
    return m;
  }, []);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (activeCategory && t.category !== activeCategory) return false;
      if (activeComplexity && t.complexity !== activeComplexity) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) ||
          t.tool.toLowerCase().includes(q) || t.serviceFlow.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, activeCategory, activeComplexity]);

  const activeFilterLabels: string[] = [];
  if (activeCategory) activeFilterLabels.push(activeCategory);
  if (activeComplexity) activeFilterLabels.push(activeComplexity);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-20 px-6">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div variants={fadeUp} className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Agent Templates</h1>
            <p className="mt-3 max-w-2xl text-base text-muted-dark leading-relaxed">
              Browse {templates.length} ready-made agent templates. Pick one and start automating in seconds.
            </p>
          </motion.div>

          {/* Category tabs — horizontal scrollable */}
          <motion.div variants={fadeUp} className="mb-4 -mx-6 px-6 overflow-x-auto scrollbar-none">
            <div role="tablist" aria-label="Filter by category" className="flex gap-1 border-b border-white/[0.06] min-w-max">
              <button
                role="tab"
                aria-selected={activeCategory === null}
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  activeCategory === null ? "border-white text-foreground" : "border-transparent text-muted-dark hover:text-foreground"
                }`}
              >
                All
                <span className="ml-1.5 rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-semibold">{templates.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                    activeCategory === cat
                      ? `${categoryAccent[cat]} text-foreground`
                      : "border-transparent text-muted-dark hover:text-foreground"
                  }`}
                >
                  {cat}
                  <span className="ml-1.5 rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-semibold">{categoryCounts[cat]}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Complexity toggle + search */}
          <motion.div variants={fadeUp} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Filter by complexity" className="flex rounded-xl border border-white/[0.08] bg-white/[0.02] p-1 backdrop-blur-sm">
              {complexities.map(({ value, label }) => (
                <button
                  key={label}
                  aria-pressed={activeComplexity === value}
                  onClick={() => setActiveComplexity(value)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                    activeComplexity === value
                      ? "bg-white/[0.1] text-foreground shadow-[0_0_12px_rgba(255,255,255,0.06)]"
                      : "text-muted-dark hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-dark" />
              <input
                type="text"
                placeholder="Search templates, tools, services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search templates"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-dark outline-none transition-colors focus:border-brand-cyan/40 focus:bg-white/[0.05]"
              />
            </div>
          </motion.div>

          {/* Results summary */}
          <motion.p variants={fadeUp} className="mb-6 text-xs text-muted-dark" aria-live="polite" aria-atomic="true">
            Showing {filtered.length} of {templates.length} templates
            {activeFilterLabels.length > 0 && (
              <> &mdash; {activeFilterLabels.map((f, i) => (
                <span key={f}>{i > 0 && ", "}<span className="text-foreground font-medium">{f}</span></span>
              ))}</>
            )}
          </motion.p>

          {/* Grid */}
          <motion.div variants={staggerContainer} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => <TemplateCard key={t.id} template={t} />)}
          </motion.div>

          {filtered.length === 0 && (
            <motion.div variants={fadeUp} className="mt-16 flex flex-col items-center gap-3 text-center">
              <p className="text-lg font-medium text-muted-dark">No templates match your filters</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory(null); setActiveComplexity(null); }}
                className="text-sm text-brand-cyan hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </>
  );
}
