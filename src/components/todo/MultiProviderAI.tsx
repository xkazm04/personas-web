"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Cpu,
  HardDrive,
  Gauge,
  Check,
  Terminal,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer, revealFromBelow } from "@/lib/animations";

/* ── Reality: Personas runs on Claude Code (primary) and Ollama (optional BYOM) ── */

const claudeModels = [
  { id: "sonnet-4-5", label: "Claude Sonnet 4.5", effort: "default", desc: "Balanced, fast, high-quality" },
  { id: "opus-4-6", label: "Claude Opus 4.6", effort: "max", desc: "Deep reasoning, long tasks" },
  { id: "haiku-4-5", label: "Claude Haiku 4.5", effort: "low", desc: "Light work, cheap + fast" },
];

const capabilities = [
  {
    icon: Sparkles,
    title: "Intelligent routing",
    desc: "Personas reads the task and picks the right Claude model + effort level automatically. You never have to fiddle with model names.",
    color: "#06b6d4",
  },
  {
    icon: Gauge,
    title: "Effort presets",
    desc: "Low, default, and max. Cheap fast responses for routine work — thorough reasoning reserved for the tasks that need it.",
    color: "#a855f7",
  },
  {
    icon: HardDrive,
    title: "Bring Your Own Model",
    desc: "Run any open-source model locally via Ollama. Private, offline, free. Pair it with Claude as a fallback or route specific agents to it.",
    color: "#34d399",
  },
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
          className="force-dark relative rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-500/[0.06] to-[rgba(10,14,20,0.8)] p-7 backdrop-blur-sm"
          style={{ boxShadow: "0 0 40px rgba(251, 146, 60, 0.10)" }}
        >
          <div className="absolute -top-3 left-6 flex items-center gap-1 rounded-full bg-orange-500 px-3 py-0.5 text-base font-semibold uppercase tracking-wider text-black">
            <Sparkles className="h-3 w-3" />
            Primary engine
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15">
              <Cpu className="h-6 w-6 text-orange-400" />
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
                className="flex items-center justify-between rounded-lg border border-foreground/[0.06] bg-background/30 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-foreground">{m.label}</div>
                  <div className="text-base text-foreground/65">{m.desc}</div>
                </div>
                <span
                  className="shrink-0 rounded-full border border-orange-400/30 bg-orange-500/10 px-2 py-0.5 text-base font-mono uppercase tracking-wider text-orange-300"
                >
                  {m.effort}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 text-base text-foreground/70">
            <Check className="h-4 w-4 text-orange-400" />
            <span>Requires a Claude Pro or Max subscription</span>
          </div>
        </motion.div>

        {/* Ollama / BYOM card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="force-dark relative rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.05] to-[rgba(10,14,20,0.8)] p-7 backdrop-blur-sm"
          style={{ boxShadow: "0 0 40px rgba(52, 211, 153, 0.08)" }}
        >
          <div className="absolute -top-3 left-6 flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-0.5 text-base font-semibold uppercase tracking-wider text-emerald-300">
            <Terminal className="h-3 w-3" />
            Bring your own model
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15">
              <HardDrive className="h-6 w-6 text-emerald-400" />
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
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-base leading-relaxed text-foreground/85">{line}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-foreground/[0.06] bg-background/30 px-3 py-2 font-mono text-base text-foreground/75">
            <span className="text-emerald-400">$</span> ollama pull llama3.1 &nbsp;·&nbsp;
            <span className="text-emerald-400">point Personas → localhost:11434</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Capability strip ───────────────────────────────────────── */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3 mx-auto max-w-5xl">
        {capabilities.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            whileHover={{ scale: 1.03, boxShadow: `0 0 25px ${c.color}15` }}
            className="group rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-5 transition-all duration-300 hover:border-foreground/[0.18] hover:bg-foreground/[0.04]"
          >
            <c.icon
              className="h-5 w-5 mb-2 transition-transform duration-300 group-hover:scale-110"
              style={{ color: c.color }}
            />
            <div className="text-base font-semibold text-foreground">{c.title}</div>
            <div className="mt-1.5 text-base text-foreground/80 leading-relaxed">
              {c.desc}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
