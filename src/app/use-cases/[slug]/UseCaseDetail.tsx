"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Download,
  Zap,
  Link2,
  Users,
  Code,
  FileText,
  Search,
  Server,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";
import type { UseCase } from "@/data/use-cases";

const ICONS = { Code, FileText, Search, Server, MessageSquare } as Record<
  string,
  typeof Code
>;

const scrollMapItems = [
  { label: "OVERVIEW", href: "#overview" },
  { label: "WORKFLOWS", href: "#workflows" },
  { label: "START", href: "#uc-cta" },
];

export default function UseCaseDetail({ useCase }: { useCase: UseCase }) {
  const Icon = ICONS[useCase.icon] ?? Code;

  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        <div className="h-24" />

        {/* ── Overview ──────────────────────────────────────────── */}
        <SectionWrapper id="overview" aria-label={useCase.title}>
          <motion.div variants={fadeUp}>
            <Link
              href="/use-cases"
              className="inline-flex items-center gap-1.5 text-base text-muted hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              All use cases
            </Link>
          </motion.div>

          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] items-start">
            <motion.div variants={fadeUp}>
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${useCase.color}15` }}
              >
                <Icon className="h-6 w-6" style={{ color: useCase.color }} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
                {useCase.title}
              </h1>
              <p className="text-lg text-muted/80 italic mb-4">
                {useCase.headline}
              </p>
              <p className="text-base text-muted leading-relaxed">
                {useCase.description}
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="rounded-xl border border-glass bg-white/[0.02] backdrop-blur-sm p-6">
                <h3 className="text-base font-semibold text-foreground uppercase tracking-wider mb-4">
                  Key Benefits
                </h3>
                <ul className="space-y-3">
                  {useCase.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-base text-muted">
                      <Check
                        className="h-4 w-4 shrink-0 mt-0.5"
                        style={{ color: useCase.color }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-glass grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Zap className="h-3 w-3" /> Triggers
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {useCase.triggers.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-glass-hover bg-white/3 px-2.5 py-0.5 text-sm text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Link2 className="h-3 w-3" /> Connectors
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {useCase.connectors.slice(0, 5).map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-glass-hover bg-white/3 px-2.5 py-0.5 text-sm text-muted"
                        >
                          {c}
                        </span>
                      ))}
                      {useCase.connectors.length > 5 && (
                        <span className="rounded-full border border-glass-hover bg-white/3 px-2.5 py-0.5 text-sm text-muted">
                          +{useCase.connectors.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </SectionWrapper>

        {/* ── Workflows ─────────────────────────────────────────── */}
        <SectionWrapper id="workflows" aria-label="Example workflows">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <SectionHeading>
              Example{" "}
              <GradientText className="drop-shadow-lg">workflows</GradientText>
            </SectionHeading>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {useCase.workflows.map((wf) => (
              <motion.div
                key={wf.title}
                variants={fadeUp}
                className="rounded-xl border border-glass bg-white/[0.02] backdrop-blur-sm p-6 flex flex-col"
              >
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {wf.title}
                </h3>
                <p className="text-base text-muted leading-relaxed flex-1 mb-4">
                  {wf.description}
                </p>
                <div className="space-y-2 pt-3 border-t border-glass">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Zap className="h-3 w-3 shrink-0" style={{ color: useCase.color }} />
                    <span className="font-medium">Trigger:</span> {wf.trigger}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Link2 className="h-3 w-3 shrink-0" style={{ color: useCase.color }} />
                    <span className="font-medium">Connectors:</span>{" "}
                    {wf.connectors.join(", ")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Users className="h-3 w-3 shrink-0" style={{ color: useCase.color }} />
                    <span className="font-medium">Agents:</span> {wf.agentCount}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <SectionWrapper id="uc-cta" aria-label="Get started">
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
            <SectionHeading>
              Build this{" "}
              <GradientText className="drop-shadow-lg">today</GradientText>
            </SectionHeading>
            <p className="mt-6 text-base text-muted leading-relaxed font-light">
              Download Personas, create your first {useCase.title.toLowerCase()} agent,
              and have it running in under 10 minutes. Free forever.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#download"
                className="inline-flex items-center gap-2 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 px-8 py-3 text-base font-semibold text-brand-cyan transition-colors hover:bg-brand-cyan/25"
              >
                <Download className="h-4 w-4" />
                Download Free
              </Link>
              <Link
                href="/#get-started"
                className="inline-flex items-center gap-2 rounded-full border border-glass-hover px-8 py-3 text-base font-medium text-muted transition-colors hover:border-white/20 hover:text-foreground"
              >
                Get started
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-base text-muted">
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Read the blog &rarr;
              </Link>
              <span className="text-white/60">|</span>
              <Link href="/compare" className="hover:text-foreground transition-colors">
                Compare platforms &rarr;
              </Link>
              <span className="text-white/60">|</span>
              <Link href="/security" className="hover:text-foreground transition-colors">
                Security &amp; Privacy &rarr;
              </Link>
            </div>
          </motion.div>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}
