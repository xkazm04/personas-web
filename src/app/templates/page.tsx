"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";

import Navbar from "@/components/Navbar";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  categories,
  templateList as templates,
  type Category,
} from "@/lib/templates";

import { CategoryTile } from "./templates-page/CategoryTile";
import { TemplateCard } from "./templates-page/TemplateCard";
import type { Complexity } from "./templates-page/templatePageConfig";

const categoryCounts: Record<string, number> = Object.fromEntries(
  categories.map((category) => [
    category,
    templates.filter((template) => template.category === category).length,
  ]),
);

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

  const filtered = useMemo(() => {
    return templates.filter((template) => {
      if (activeCategory && template.category !== activeCategory) return false;
      if (activeComplexity && template.complexity !== activeComplexity) return false;
      if (!search) return true;

      const query = search.toLowerCase();
      return (
        template.title.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tool.toLowerCase().includes(query) ||
        template.serviceFlow.some((service) => service.toLowerCase().includes(query))
      );
    });
  }, [search, activeCategory, activeComplexity]);

  function resetFilters() {
    setActiveCategory(null);
    setActiveComplexity(null);
    setSearch("");
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-background px-4 pb-20 pt-24 sm:px-6">
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
                {categories.map((category) => (
                  <CategoryTile
                    key={category}
                    category={category}
                    count={categoryCounts[category] ?? 0}
                    onSelect={() => setActiveCategory(category)}
                  />
                ))}
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={fadeUp} className="mb-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-full border border-glass-hover bg-white/[0.02] px-4 py-2 text-base font-medium text-muted transition-colors hover:border-glass-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t.templatesPage.changeCategory}
                </button>
                <h2 className="text-2xl font-bold text-foreground">
                  {activeCategory}
                </h2>
              </motion.div>

              <motion.div variants={fadeUp} className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div role="group" aria-label={t.templatesPage.filterByComplexity} className="scrollbar-hide flex overflow-x-auto rounded-xl border border-glass-hover bg-white/[0.02] p-1 backdrop-blur-sm">
                  {complexities.map(({ value, label }) => (
                    <button
                      key={label}
                      aria-pressed={activeComplexity === value}
                      onClick={() => setActiveComplexity(value)}
                      className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                        activeComplexity === value
                          ? "bg-white/[0.1] text-foreground shadow-[0_0_12px_rgba(255,255,255,0.06)]"
                          : "text-muted-dark hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="relative w-full lg:w-80">
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
                {filtered.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    viewDetailsLabel={t.templatesPage.viewDetails}
                  />
                ))}
              </motion.div>

              {filtered.length === 0 && (
                <motion.div variants={fadeUp} className="mt-16 flex flex-col items-center gap-3 text-center">
                  <p className="text-lg font-medium text-muted-dark">{t.templatesPage.noMatches}</p>
                  <button onClick={resetFilters} className="text-base text-brand-cyan hover:underline">
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
