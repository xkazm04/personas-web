"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Copy, Check, X } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import GradientText from "@/components/GradientText";
import {
  templates,
  categories,
  difficulties,
  difficultyColors,
  categoryColors,
  type Category,
  type Difficulty,
  type AgentTemplate,
} from "@/lib/templates";
import { fadeUp, staggerContainer } from "@/lib/animations";

function TemplateCard({
  template,
  onSelect,
}: {
  template: AgentTemplate;
  onSelect: (t: AgentTemplate) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(template.config);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [template.config]
  );

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ scale: 1.02, borderColor: `${template.toolColor}50` }}
      className="group relative flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.04] cursor-pointer"
      onClick={() => onSelect(template)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${template.toolColor}15` }}
          >
            <template.toolIcon
              className="h-5 w-5"
              style={{
                color:
                  template.toolColor === "#e6e6e6"
                    ? "#999"
                    : template.toolColor,
              }}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {template.title}
            </h3>
            <p className="text-xs text-muted-dark">{template.tool}</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-2 text-muted-dark transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label={copied ? "Copied" : "Copy template config"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-dark">
        {template.description}
      </p>

      <div className="flex flex-wrap gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${categoryColors[template.category]}`}
        >
          {template.category}
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${difficultyColors[template.difficulty]}`}
        >
          {template.difficulty}
        </span>
      </div>
    </motion.div>
  );
}

function TemplateModal({
  template,
  onClose,
}: {
  template: AgentTemplate;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(template.config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [template.config]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0f] p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-dark transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${template.toolColor}15` }}
          >
            <template.toolIcon
              className="h-7 w-7"
              style={{
                color:
                  template.toolColor === "#e6e6e6"
                    ? "#999"
                    : template.toolColor,
              }}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{template.title}</h2>
            <p className="text-sm text-muted-dark">{template.tool} Agent</p>
          </div>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-muted-dark">
          {template.description}
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${categoryColors[template.category]}`}
          >
            {template.category}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${difficultyColors[template.difficulty]}`}
          >
            {template.difficulty}
          </span>
        </div>

        <div className="relative rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="text-xs font-medium text-muted-dark font-mono">
              agent.yaml
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-dark transition-colors hover:bg-white/10 hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy to clipboard
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-muted font-mono">
            {template.config}
          </pre>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<AgentTemplate | null>(null);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (selectedCategory && t.category !== selectedCategory) return false;
      if (selectedDifficulty && t.difficulty !== selectedDifficulty)
        return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.tool.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, selectedCategory, selectedDifficulty]);

  const activeFilters =
    (selectedCategory ? 1 : 0) + (selectedDifficulty ? 1 : 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-20 px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto max-w-6xl"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="mb-12">
            <Link
              href="/#use-cases"
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-dark transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              <GradientText variant="silver">
                Agent Template Gallery
              </GradientText>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-dark leading-relaxed">
              Browse {templates.length} ready-made agent templates. Pick one,
              copy the config, and start automating in seconds.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            variants={fadeUp}
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap gap-2">
              {/* Category filters */}
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat ? null : cat)
                  }
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? categoryColors[cat]
                      : "border-white/10 text-muted-dark hover:border-white/20 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <div className="w-px bg-white/10 mx-1 hidden sm:block" />
              {/* Difficulty filters */}
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() =>
                    setSelectedDifficulty(
                      selectedDifficulty === diff ? null : diff
                    )
                  }
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    selectedDifficulty === diff
                      ? difficultyColors[diff]
                      : "border-white/10 text-muted-dark hover:border-white/20 hover:text-foreground"
                  }`}
                >
                  {diff}
                </button>
              ))}
              {activeFilters > 0 && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedDifficulty(null);
                  }}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted-dark hover:text-foreground transition-colors"
                >
                  Clear ({activeFilters})
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-dark" />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-dark outline-none transition-colors focus:border-brand-cyan/40 focus:bg-white/[0.05]"
              />
            </div>
          </motion.div>

          {/* Results count */}
          <motion.p
            variants={fadeUp}
            className="mb-6 text-xs text-muted-dark"
          >
            Showing {filtered.length} of {templates.length} templates
          </motion.p>

          {/* Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={setSelectedTemplate}
              />
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <motion.div
              variants={fadeUp}
              className="mt-16 flex flex-col items-center gap-3 text-center"
            >
              <p className="text-lg font-medium text-muted-dark">
                No templates match your filters
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(null);
                  setSelectedDifficulty(null);
                }}
                className="text-sm text-brand-cyan hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {selectedTemplate && (
            <TemplateModal
              template={selectedTemplate}
              onClose={() => setSelectedTemplate(null)}
            />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
