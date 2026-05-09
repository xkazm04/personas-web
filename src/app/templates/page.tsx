"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Clock, Webhook, Mouse, Zap, Radio, ChevronRight, type LucideIcon } from "lucide-react";
import { templateList as templates, categories, difficultyColors, type Category, type TemplateListItem as AgentTemplate } from "@/lib/templates";
import { fadeUp, staggerContainer } from "@/lib/animations";
import Navbar from "@/components/Navbar";
import { useTranslation } from "@/i18n/useTranslation";

const triggerIcons: Record<string, LucideIcon> = { schedule: Clock, webhook: Webhook, manual: Mouse, event: Zap, polling: Radio };

const categoryAccent: Record<Category, string> = {
  DevOps: "border-brand-purple", Communication: "border-brand-cyan", Productivity: "border-brand-emerald",
  Finance: "border-green-400", Sales: "border-orange-400", Support: "border-cyan-400",
  Research: "border-violet-400", Marketing: "border-pink-400", Legal: "border-stone-400", Security: "border-red-400",
};

const CATEGORY_IMAGES: Record<Category, { dark: string; light: string }> = {
  DevOps: { dark: "/imgs/templates/devops-dark.png", light: "/imgs/templates/devops-light.png" },
  Communication: { dark: "/imgs/templates/communication-dark.png", light: "/imgs/templates/communication-light.png" },
  Productivity: { dark: "/imgs/templates/productivity-dark.png", light: "/imgs/templates/productivity-light.png" },
  Finance: { dark: "/imgs/templates/finance-dark.png", light: "/imgs/templates/finance-light.png" },
  Sales: { dark: "/imgs/templates/sales-dark.png", light: "/imgs/templates/sales-light.png" },
  Support: { dark: "/imgs/templates/support-dark.png", light: "/imgs/templates/support-light.png" },
  Research: { dark: "/imgs/templates/research-dark.png", light: "/imgs/templates/research-light.png" },
  Marketing: { dark: "/imgs/templates/marketing-dark.png", light: "/imgs/templates/marketing-light.png" },
  Legal: { dark: "/imgs/templates/legal-dark.png", light: "/imgs/templates/legal-light.png" },
  Security: { dark: "/imgs/templates/security-dark.png", light: "/imgs/templates/security-light.png" },
};

type Complexity = "basic" | "professional" | "enterprise";

function TemplateCard({ template }: { template: AgentTemplate }) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        href={`/templates/${template.id}`}
        className={`group relative flex flex-col rounded-2xl border border-glass bg-white/[0.02] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.05] border-l-2 ${categoryAccent[template.category]} h-full`}
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          {template.serviceFlow.map((svc) => (
            <span key={svc} className="rounded-full border border-glass-hover bg-white/[0.05] px-2.5 py-0.5 text-sm font-medium text-muted">
              {svc}
            </span>
          ))}
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1.5">{template.title}</h3>
        <p className="mb-4 flex-1 text-base leading-relaxed text-muted-dark line-clamp-2">{template.description}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-full border px-2.5 py-0.5 text-sm font-medium capitalize bg-white/[0.04] border-glass-hover text-muted">
            {template.complexity}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-sm font-medium ${difficultyColors[template.difficulty]}`}>
            {template.difficulty}
          </span>
          <span className="flex-1" />
          {template.triggers.map((tr) => {
            const Icon = triggerIcons[tr];
            return Icon ? <Icon key={tr} className="h-3.5 w-3.5 text-muted-dark" aria-label={tr} /> : null;
          })}
        </div>

        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
          <span className="flex items-center gap-1 text-base font-medium text-white">
            View Details <ChevronRight className="h-4 w-4" />
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

interface CategoryTileProps {
  category: Category;
  count: number;
  onSelect: () => void;
}

function CategoryTile({ category, count, onSelect }: CategoryTileProps) {
  const images = CATEGORY_IMAGES[category];
  return (
    <motion.button
      variants={fadeUp}
      onClick={onSelect}
      className={`group relative flex items-end overflow-hidden rounded-2xl border text-left h-[280px] cursor-pointer transition-all duration-500 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 border-l-2 ${categoryAccent[category]} border-glass-hover`}
    >
      <div className="absolute inset-0 transition-opacity duration-500 opacity-60 group-hover:opacity-100">
        <Image
          src={images.dark}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          aria-hidden="true"
          className="hidden dark:block object-cover"
        />
        <Image
          src={images.light}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          aria-hidden="true"
          className="block dark:hidden object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.9) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 p-6 w-full">
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-2xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {category}
          </h3>
          <span className="rounded-full border border-white/20 bg-black/40 backdrop-blur-sm px-3 py-0.5 text-sm font-medium text-white">
            {count}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function TemplatesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeComplexity, setActiveComplexity] = useState<Complexity | null>(null);

  const complexities: { value: Complexity | null; label: string }[] = [
    { value: null, label: t.templatesPage.complexityAll },
    { value: "basic", label: t.templatesPage.complexityBasic },
    { value: "professional", label: t.templatesPage.complexityProfessional },
    { value: "enterprise", label: t.templatesPage.complexityEnterprise },
  ];

  const categoryCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of categories) m[c] = templates.filter((t) => t.category === c).length;
    return m;
  }, []);

  const filtered = useMemo(() => {
    return templates.filter((tmpl) => {
      if (activeCategory && tmpl.category !== activeCategory) return false;
      if (activeComplexity && tmpl.complexity !== activeComplexity) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          tmpl.title.toLowerCase().includes(q) || tmpl.description.toLowerCase().includes(q) ||
          tmpl.tool.toLowerCase().includes(q) || tmpl.serviceFlow.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, activeCategory, activeComplexity]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-20 px-6">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t.templatesPage.title}</h1>
            <p className="mt-3 max-w-2xl text-base text-muted-dark leading-relaxed">
              {t.templatesPage.subtitle.replace("{count}", String(templates.length))}
            </p>
          </motion.div>

          {activeCategory === null ? (
            <>
              <motion.div variants={fadeUp} className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {t.templatesPage.gridHeading}
                </h2>
                <p className="text-base text-muted-dark leading-relaxed max-w-2xl">
                  {t.templatesPage.gridDescription}
                </p>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {categories.map((cat) => (
                  <CategoryTile
                    key={cat}
                    category={cat}
                    count={categoryCounts[cat] ?? 0}
                    onSelect={() => setActiveCategory(cat)}
                  />
                ))}
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={fadeUp} className="mb-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setActiveCategory(null);
                    setActiveComplexity(null);
                    setSearch("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-glass-hover bg-white/[0.02] px-4 py-2 text-base font-medium text-muted transition-colors hover:border-glass-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t.templatesPage.changeCategory}
                </button>
                <h2 className="text-2xl font-bold text-foreground">
                  {activeCategory}
                </h2>
              </motion.div>

              <motion.div variants={fadeUp} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div role="group" aria-label="Filter by complexity" className="flex rounded-xl border border-glass-hover bg-white/[0.02] p-1 backdrop-blur-sm">
                  {complexities.map(({ value, label }) => (
                    <button
                      key={label}
                      aria-pressed={activeComplexity === value}
                      onClick={() => setActiveComplexity(value)}
                      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
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
                    placeholder={t.templatesPage.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label={t.templatesPage.searchAriaLabel}
                    className="w-full rounded-xl border border-glass-hover bg-white/[0.03] py-2.5 pl-10 pr-4 text-base text-foreground placeholder:text-muted-dark outline-none transition-colors focus:border-brand-cyan/40 focus:bg-white/[0.05]"
                  />
                </div>
              </motion.div>

              <motion.p variants={fadeUp} className="mb-6 text-sm text-muted-dark" aria-live="polite" aria-atomic="true">
                {t.templatesPage.showingCount
                  .replace("{shown}", String(filtered.length))
                  .replace("{total}", String(categoryCounts[activeCategory] ?? 0))}
              </motion.p>

              <motion.div variants={staggerContainer} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((tmpl) => <TemplateCard key={tmpl.id} template={tmpl} />)}
              </motion.div>

              {filtered.length === 0 && (
                <motion.div variants={fadeUp} className="mt-16 flex flex-col items-center gap-3 text-center">
                  <p className="text-lg font-medium text-muted-dark">{t.templatesPage.noMatches}</p>
                  <button
                    onClick={() => { setSearch(""); setActiveComplexity(null); }}
                    className="text-base text-brand-cyan hover:underline"
                  >
                    {t.templatesPage.clearFilters}
                  </button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </>
  );
}
