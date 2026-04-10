"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Download, Copy, Check, Clock, Webhook,
  Mouse, Zap, Radio, ChevronRight, ExternalLink,
} from "lucide-react";
import { templates, categoryColors, difficultyColors } from "@/lib/templates";
import { fadeUp, staggerContainer } from "@/lib/animations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

const triggerIcons: Record<string, typeof Clock> = {
  schedule: Clock, webhook: Webhook, manual: Mouse, event: Zap, polling: Radio,
};

const triggerDescriptions: Record<string, string> = {
  schedule: "Runs automatically on a time-based schedule",
  webhook: "Triggered by incoming web requests from external services",
  manual: "Run on-demand with one click from the Personas app",
  event: "Activates when specific events occur in your system",
  polling: "Checks for changes at regular intervals",
};

const complexityColors: Record<string, string> = {
  basic: "text-green-400 border-green-400/30 bg-green-400/10",
  professional: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  enterprise: "text-red-400 border-red-400/30 bg-red-400/10",
};

export default function TemplateDetail({ templateId }: { templateId: string }) {
  const [copied, setCopied] = useState(false);

  const template = templates.find((t) => t.id === templateId)!;
  const related = templates
    .filter((t) => t.category === template.category && t.id !== template.id)
    .slice(0, 3);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ToolIcon = template.toolIcon;
  const iconColor = template.toolColor === "#e6e6e6" ? "#999" : template.toolColor;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: template.title,
          description: template.description,
          programmingLanguage: "YAML",
          runtimePlatform: "Personas",
          applicationCategory: template.category,
          url: `https://personas.ai/templates/${template.id}`,
        }) }}
      />
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          {/* Back link */}
          <motion.div variants={fadeUp}>
            <Link
              href="/templates"
              className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-dark transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Templates
            </Link>
          </motion.div>

          {/* Hero */}
          <motion.section variants={fadeUp} className="mb-12">
            <div className="flex items-start gap-5 mb-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${template.toolColor}15` }}
              >
                <ToolIcon className="h-8 w-8" style={{ color: iconColor }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{template.title}</h1>
                <p className="mt-1 text-sm text-muted-dark">{template.tool}</p>
              </div>
            </div>
            <p className="mb-5 text-lg leading-relaxed text-muted-dark">{template.description}</p>
            <div className="mb-6 flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${categoryColors[template.category]}`}>{template.category}</span>
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${difficultyColors[template.difficulty]}`}>{template.difficulty}</span>
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${complexityColors[template.complexity]}`}>{template.complexity}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {template.serviceFlow.map((s) => (
                <span key={s} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-foreground">
                  {s}
                </span>
              ))}
            </div>
          </motion.section>

          {/* Design Highlights */}
          {template.designHighlights.length > 0 && (
            <motion.section variants={fadeUp} className="mb-12">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Design Highlights</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {template.designHighlights.map((h) => (
                  <div key={h} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-emerald" />
                    <span className="text-sm text-muted-dark">{h}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Triggers */}
          <motion.section variants={fadeUp} className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Triggers</h2>
            <div className="flex flex-col gap-3">
              {template.triggers.map((t) => {
                const Icon = triggerIcons[t] ?? Zap;
                return (
                  <div key={t} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
                    <Icon className="h-5 w-5 shrink-0" style={{ color: iconColor }} />
                    <div>
                      <span className="text-sm font-medium capitalize text-foreground">{t}</span>
                      <p className="text-xs text-muted-dark">{triggerDescriptions[t] ?? "Custom trigger"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Configuration */}
          <motion.section variants={fadeUp} className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Configuration</h2>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-dark transition-colors hover:bg-white/10 hover:text-foreground"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02] p-5 text-sm leading-relaxed text-muted-dark backdrop-blur-sm">
              <code>{template.config}</code>
            </pre>
          </motion.section>

          {/* Download CTA */}
          <motion.section variants={fadeUp} className="mb-16">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-purple/10 via-transparent to-brand-cyan/10 pointer-events-none" />
              <div className="relative flex flex-col items-center text-center gap-4">
                <h2 className="text-xl font-semibold text-foreground">Get Started with This Template</h2>
                <p className="max-w-md text-sm text-muted-dark">
                  Import this template directly into Personas, or copy the configuration to customize it yourself.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  <a
                    href={`personas://template/${template.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-purple px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-purple/80"
                  >
                    <ExternalLink className="h-4 w-4" /> Open in Personas
                  </a>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Configuration"}
                  </button>
                  <Link
                    href="/#download"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-muted-dark transition-colors hover:bg-white/10 hover:text-foreground"
                  >
                    <Download className="h-4 w-4" /> Download Personas
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Related Templates */}
          {related.length > 0 && (
            <motion.section variants={fadeUp}>
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                More {template.category} Templates
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((r) => {
                  const RIcon = r.toolIcon;
                  const rColor = r.toolColor === "#e6e6e6" ? "#999" : r.toolColor;
                  return (
                    <Link
                      key={r.id}
                      href={`/templates/${r.id}`}
                      className="group flex flex-col rounded-xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${r.toolColor}15` }}
                        >
                          <RIcon className="h-4 w-4" style={{ color: rColor }} />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-purple transition-colors">
                          {r.title}
                        </h3>
                      </div>
                      <p className="mb-3 flex-1 text-xs leading-relaxed text-muted-dark line-clamp-2">
                        {r.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${complexityColors[r.complexity]}`}>
                          {r.complexity}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-dark transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          )}
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
