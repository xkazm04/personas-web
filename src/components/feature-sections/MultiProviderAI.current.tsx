"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Cpu,
  HardDrive,
  Check,
  Terminal,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer, revealFromBelow } from "@/lib/animations";

/* ── Reality: Personas runs on Claude Code (primary) and Ollama (optional BYOM) ── */

const claudeModels = [
  { id: "sonnet-4-6", label: "Claude Sonnet 4.6", effort: "default", desc: "Balanced, fast, high-quality" },
  { id: "opus-4-7", label: "Claude Opus 4.7", effort: "max", desc: "Deep reasoning, long tasks" },
  { id: "haiku-4-5", label: "Claude Haiku 4.5", effort: "low", desc: "Light work, cheap + fast" },
];

export default function MultiProviderAI() {
  return (
    <SectionWrapper id="multi-provider">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center"
      >
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Powered by{" "}
            <GradientText className="drop-shadow-lg">Claude</GradientText>.
            Private via <GradientText className="drop-shadow-lg">Ollama</GradientText>.
          </SectionHeading>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-foreground/85 font-light"
        >
          Personas is built around Claude — the primary engine we tune, test, and trust.
          For private or offline work, bring your own open-source model through Ollama.{" "}
          <span className="text-foreground font-medium">
            Two engines, one consistent agent runtime.
          </span>
        </motion.p>
      </motion.div>

      {/* ── Two-engine card layout ─────────────────────────────────── */}
      <motion.div
        variants={revealFromBelow}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-14 mx-auto max-w-5xl grid gap-6 md:grid-cols-2"
      >
        {/* Claude card — featured */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative rounded-2xl border border-orange-500/40 dark:border-orange-400/30 bg-gradient-to-br from-orange-100 via-orange-50/70 to-background/60 dark:from-orange-500/[0.08] dark:via-[rgba(10,14,20,0.55)] dark:to-[rgba(10,14,20,0.85)] p-7 backdrop-blur-sm shadow-[0_10px_40px_rgba(251,146,60,0.08)] dark:shadow-[0_0_40px_rgba(251,146,60,0.10)]"
        >
          <div className="absolute -top-3 left-6 flex items-center gap-1 rounded-full bg-orange-500 px-3 py-0.5 text-base font-semibold uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3" />
            Primary engine
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 dark:bg-orange-500/15">
              <Cpu className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Claude Code</h3>
              <p className="text-base font-mono text-foreground/70">by Anthropic</p>
            </div>
          </div>

          <p className="mb-5 text-base leading-relaxed text-foreground/85">
            The agent runtime Personas is designed around. Personas intelligently picks
            the right model and effort level per task — no manual knob-twiddling.
          </p>

          <div className="space-y-2">
            {claudeModels.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-foreground/[0.08] bg-background/60 dark:bg-background/30 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-foreground">{m.label}</div>
                  <div className="text-base text-foreground/70">{m.desc}</div>
                </div>
                <span className="shrink-0 rounded-full border border-orange-500/40 dark:border-orange-400/30 bg-orange-500/15 dark:bg-orange-500/10 px-2 py-0.5 text-base font-mono uppercase tracking-wider text-orange-700 dark:text-orange-300">
                  {m.effort}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 text-base text-foreground/75">
            <Check className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span>Requires a Claude Pro or Max subscription</span>
          </div>
        </motion.div>

        {/* Ollama / BYOM card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative rounded-2xl border border-emerald-500/40 dark:border-emerald-400/25 bg-gradient-to-br from-emerald-100 via-emerald-50/70 to-background/60 dark:from-emerald-500/[0.07] dark:via-[rgba(10,14,20,0.55)] dark:to-[rgba(10,14,20,0.85)] p-7 backdrop-blur-sm shadow-[0_10px_40px_rgba(52,211,153,0.08)] dark:shadow-[0_0_40px_rgba(52,211,153,0.08)]"
        >
          <div className="absolute -top-3 left-6 flex items-center gap-1 rounded-full border border-emerald-500/50 dark:border-emerald-400/40 bg-emerald-500/20 dark:bg-emerald-500/15 px-3 py-0.5 text-base font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <Terminal className="h-3 w-3" />
            Bring your own model
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 dark:bg-emerald-500/15">
              <HardDrive className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Ollama</h3>
              <p className="text-base font-mono text-foreground/70">any open-source model, local</p>
            </div>
          </div>

          <p className="mb-5 text-base leading-relaxed text-foreground/85">
            Point Personas at a local Ollama server and run any open-source model — Llama,
            Mistral, Qwen, DeepSeek, anything you can pull. Your data never leaves your machine.
          </p>

          <div className="space-y-2.5">
            {[
              "100% offline — zero outbound traffic",
              "Free and unlimited — no token billing",
              "Per-agent routing — mix with Claude",
              "Fallback engine when Claude is unavailable",
            ].map((line) => (
              <div key={line} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-base leading-relaxed text-foreground/85">{line}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-foreground/[0.08] bg-background/60 dark:bg-background/30 px-3 py-2 font-mono text-base text-foreground/80">
            <span className="text-emerald-600 dark:text-emerald-400">$</span> ollama pull llama3.1 &nbsp;·&nbsp;
            <span className="text-emerald-600 dark:text-emerald-400">point Personas → localhost:11434</span>
          </div>
        </motion.div>
      </motion.div>

    </SectionWrapper>
  );
}
