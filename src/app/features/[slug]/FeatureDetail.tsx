"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, Check, Download, ArrowRight, BookOpen } from "lucide-react";
import { FEATURE_PAGES } from "@/data/feature-pages";
import { FEATURE_ILLUSTRATIONS } from "@/data/feature-illustrations";
import { fadeUp, staggerContainer } from "@/lib/animations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

/* ── Guide topic mapping per feature slug ──────────────────────────── */

const FEATURE_GUIDE_MAP: Record<string, { label: string; category: string; topic: string }[]> = {
  orchestration: [
    { label: "What are pipelines?", category: "pipelines", topic: "what-are-pipelines" },
    { label: "The team canvas", category: "pipelines", topic: "the-team-canvas" },
    { label: "Connecting agents with data flow", category: "pipelines", topic: "connecting-agents-with-data-flow" },
    { label: "Pipeline execution", category: "pipelines", topic: "pipeline-execution" },
  ],
  security: [
    { label: "How Personas keeps your data safe", category: "credentials", topic: "how-personas-keeps-your-data-safe" },
    { label: "Understanding the credential vault", category: "credentials", topic: "understanding-the-credential-vault" },
    { label: "Adding a new credential", category: "credentials", topic: "adding-a-new-credential" },
    { label: "OAuth setup walkthrough", category: "credentials", topic: "oauth-setup-walkthrough" },
  ],
  "multi-provider": [
    { label: "Choosing your AI provider", category: "getting-started", topic: "choosing-your-ai-provider" },
    { label: "Cost tracking per model", category: "monitoring", topic: "cost-tracking-per-model" },
    { label: "Cost tracking per agent", category: "monitoring", topic: "cost-tracking-per-agent" },
    { label: "Arena testing", category: "testing", topic: "arena-testing" },
  ],
  genome: [
    { label: "Genome evolution basics", category: "testing", topic: "genome-evolution-basics" },
    { label: "Running a breeding cycle", category: "testing", topic: "running-a-breeding-cycle" },
    { label: "Fitness scoring explained", category: "testing", topic: "fitness-scoring-explained" },
    { label: "Adopting evolved prompts", category: "testing", topic: "adopting-evolved-prompts" },
  ],
};

/* ------------------------------------------------------------------ */

interface Props {
  slug: string;
}

export default function FeatureDetail({ slug }: Props) {
  const feature = FEATURE_PAGES.find((f) => f.slug === slug)!;
  const illustration = FEATURE_ILLUSTRATIONS[slug];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const Icon = feature.icon;

  /* ── gradient helper ─────────────────────────────────────────────── */
  const gradientWord = feature.headlineGradient;
  const headlineParts = feature.headline.split(gradientWord);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: feature.title,
          description: feature.description,
          url: `https://personas.ai/features/${feature.slug}`,
          mainEntity: {
            "@type": "SoftwareApplication",
            name: "Personas",
            featureList: feature.benefits.map((b: { title: string }) => b.title),
          },
        }) }}
      />
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-[#09090b] text-white">
        {/* subtle radial glow behind hero */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full opacity-15 blur-[120px]"
          style={{ background: feature.color }}
        />

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative mx-auto max-w-4xl px-6 pt-32 pb-16">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeUp}>
              <Link
                href="/features"
                className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white/80"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Features
              </Link>
            </motion.div>

            {illustration && (
              <motion.div
                variants={fadeUp}
                className="relative mb-10 aspect-[2/1] w-full overflow-hidden rounded-2xl border border-white/10"
              >
                <Image
                  src={illustration}
                  alt={feature.title}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            )}

            <motion.h1
              variants={fadeUp}
              className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
            >
              {headlineParts[0]}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${feature.color}, ${feature.color}bb)`,
                }}
              >
                {gradientWord}
              </span>
              {headlineParts[1]}
            </motion.h1>

            <motion.p variants={fadeUp} className="mb-8 max-w-2xl text-lg text-white/60">
              {feature.description}
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link
                href="/#download"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-black transition hover:opacity-90"
                style={{ background: feature.color }}
              >
                <Download className="h-4 w-4" />
                {feature.ctaText}
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ── BENEFITS GRID ────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="mb-10 text-2xl font-semibold"
          >
            Why it matters
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid gap-4 sm:grid-cols-2"
          >
            {feature.benefits.map((b) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md"
              >
                <div
                  className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${feature.color}22` }}
                >
                  <Check className="h-4 w-4" style={{ color: feature.color }} />
                </div>
                <h3 className="mb-1 font-semibold">{b.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{b.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── USE CASES ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="mb-10 text-2xl font-semibold"
          >
            See it in action
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid gap-4 md:grid-cols-3"
          >
            {feature.useCases.map((uc) => (
              <motion.div
                key={uc.title}
                variants={fadeUp}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md"
              >
                <h3 className="mb-3 font-semibold">{uc.title}</h3>
                <p className="mb-3 text-sm italic text-white/40">{uc.scenario}</p>
                <ArrowRight
                  className="mb-3 h-4 w-4 shrink-0"
                  style={{ color: feature.color }}
                />
                <p className="text-sm leading-relaxed text-white/60">{uc.outcome}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── FAQ ACCORDION ────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="mb-10 text-2xl font-semibold"
          >
            Frequently asked
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="space-y-3"
          >
            {feature.faq.map((item, i) => (
              <motion.div
                key={item.question}
                variants={fadeUp}
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-${i}`}
                  className="flex w-full items-center justify-between px-6 py-4 text-left font-medium"
                >
                  {item.question}
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-white/40" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      id={`faq-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-white/50">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── RELATED GUIDE TOPICS ─────────────────────────────────── */}
        {FEATURE_GUIDE_MAP[slug] && FEATURE_GUIDE_MAP[slug].length > 0 && (
          <section className="mx-auto max-w-4xl px-6 py-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="flex items-center gap-2 mb-8">
                <BookOpen className="h-5 w-5" style={{ color: feature.color }} />
                <h2 className="text-2xl font-semibold">Learn more in the Guide</h2>
              </motion.div>

              <div className="grid gap-3 sm:grid-cols-2">
                {FEATURE_GUIDE_MAP[slug].map((gt) => (
                  <motion.div key={gt.topic} variants={fadeUp}>
                    <Link
                      href={`/guide/${gt.category}/${gt.topic}`}
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]"
                    >
                      <BookOpen className="h-4 w-4 shrink-0 text-muted-dark group-hover:text-brand-cyan transition-colors" />
                      <span className="text-sm font-medium text-foreground group-hover:text-brand-cyan transition-colors">
                        {gt.label}
                      </span>
                      <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-dark opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* ── BOTTOM CTA ───────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 pb-24 pt-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="rounded-2xl p-[1px]"
            style={{
              backgroundImage: `linear-gradient(135deg, ${feature.color}44, ${feature.color}11)`,
            }}
          >
            <div className="flex flex-col items-center gap-5 rounded-2xl bg-[#09090b] px-8 py-12 text-center">
              <h2 className="text-2xl font-semibold">
                Ready to try {feature.title}?
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/#download"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-black transition hover:opacity-90"
                  style={{ background: feature.color }}
                >
                  <Download className="h-4 w-4" />
                  {feature.ctaText}
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 font-medium text-white/70 transition hover:text-white"
                >
                  Back to all features
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
