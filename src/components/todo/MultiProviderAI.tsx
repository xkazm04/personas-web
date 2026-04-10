"use client";

import { motion } from "framer-motion";
import { RefreshCw, DollarSign, HardDrive, Cpu } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer, revealFromBelow } from "@/lib/animations";

const providers = [
  { name: "Claude", org: "Anthropic", desc: "Best for reasoning and analysis", color: "#D97706", active: true },
  { name: "OpenAI", org: "OpenAI", desc: "Fastest for simple tasks", color: "#10B981", active: false },
  { name: "Gemini", org: "Google", desc: "Great for multimodal work", color: "#3B82F6", active: false },
  { name: "Ollama", org: "Local", desc: "Run AI on your own machine — free and private", color: "#8B5CF6", active: false },
  { name: "Custom", org: "Any endpoint", desc: "Connect any API endpoint", color: "#6B7280", active: false },
];

const benefits = [
  {
    icon: RefreshCw,
    title: "Automatic Failover",
    desc: "If one AI goes down, your agents seamlessly switch to another. No interruption, no manual intervention.",
    color: "#06b6d4",
  },
  {
    icon: DollarSign,
    title: "Cost Optimization",
    desc: "Use powerful models for complex tasks and lighter models for simple ones. Track costs per agent, per model, per execution.",
    color: "#fbbf24",
  },
  {
    icon: HardDrive,
    title: "Local Models",
    desc: "Run Ollama or any local model for complete privacy. Your data never touches an external server.",
    color: "#a855f7",
  },
];

export default function MultiProviderAI() {
  return (
    <SectionWrapper id="multi-provider">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Not locked to <GradientText className="drop-shadow-lg">one AI</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-2xl text-muted-dark font-light">
          Use Claude, OpenAI, Gemini, or run models locally with Ollama. Switch between them
          freely, set different models for different agents, and if one provider goes down —{" "}
          <span className="text-foreground/80 font-medium">your agents automatically switch to another.</span>
        </motion.p>
      </motion.div>

      {/* Provider cards */}
      <motion.div
        variants={revealFromBelow}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-14 flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:justify-center"
      >
        {providers.map((p) => (
          <motion.div
            key={p.name}
            whileHover={{ scale: 1.05, boxShadow: `0 0 25px ${p.color}15` }}
            className={`relative min-w-[150px] flex-shrink-0 rounded-xl border bg-white/[0.02] backdrop-blur-sm p-5 transition-all duration-300 hover:border-white/15 hover:bg-white/5 ${
              p.active
                ? "border-white/15"
                : "border-white/[0.06]"
            }`}
            style={p.active ? { boxShadow: `0 0 30px ${p.color}20, inset 0 1px 0 ${p.color}40` } : {}}
          >
            <div className="h-0.5 absolute top-0 left-3 right-3 rounded-full" style={{ backgroundColor: p.color }} />
            <div className="text-sm font-semibold text-foreground">{p.name}</div>
            <div className="text-xs text-muted-dark mt-0.5">{p.org}</div>
            <div className="text-xs text-muted-dark/70 mt-2 leading-relaxed">{p.desc}</div>
            {p.active && (
              <div className="absolute top-2.5 right-3 h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: p.color }} />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Benefits grid */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3 mx-auto max-w-4xl">
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            whileHover={{ scale: 1.03, boxShadow: `0 0 25px ${b.color}15` }}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/15 hover:bg-white/5"
          >
            <b.icon className="h-5 w-5 mb-2 transition-transform duration-300 group-hover:scale-110" style={{ color: b.color }} />
            <div className="text-sm font-medium text-foreground">{b.title}</div>
            <div className="mt-1.5 text-sm text-muted-dark leading-relaxed">{b.desc}</div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
