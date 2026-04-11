"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";

const MODES = [
  {
    id: "simple",
    title: "Simple Mode",
    subtitle: "For everyday office use",
    description:
      "Create agents, connect services, and see results — without the complexity. Designed for non-technical users who want AI assistants that just work.",
    features: ["Create & run agents", "Connect services", "See results clearly", "Guided onboarding"],
    icon: Sparkles,
    color: "#F59E0B",
    gradient: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20 hover:border-amber-400/40",
    badge: "bg-amber-500/15 text-amber-400",
    image: "/imgs/mode-simple.png",
    href: "/guide?mode=simple",
    cta: "Explore Simple Guides",
  },
  {
    id: "power",
    title: "Power Mode",
    subtitle: "Full control over everything",
    description:
      "Pipelines, triggers, event bus, monitoring, testing, and deployment. The complete toolkit for teams building production AI workflows.",
    features: ["Multi-agent pipelines", "6 trigger types", "Real-time monitoring", "Cloud deployment"],
    icon: Zap,
    color: "#06b6d4",
    gradient: "from-cyan-500/10 to-blue-500/5",
    border: "border-cyan-500/20 hover:border-cyan-400/40",
    badge: "bg-cyan-500/15 text-cyan-400",
    image: "/imgs/mode-power.png",
    href: "/guide?mode=power",
    cta: "Explore Power Guides",
  },
] as const;

export default function ModeSelector() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerContainer}
        className="text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Two ways to <GradientText>use Personas</GradientText>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-3 max-w-xl text-base text-muted-dark leading-relaxed"
        >
          Switch between modes anytime in Settings. Start simple, upgrade when
          you&rsquo;re ready.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={staggerContainer}
        className="mt-10 grid gap-6 sm:grid-cols-2"
      >
        {MODES.map((mode) => {
          const Icon = mode.icon;
          return (
            <motion.div key={mode.id} variants={fadeUp}>
              <Link
                href={mode.href}
                className={`group block overflow-hidden rounded-2xl border bg-gradient-to-br ${mode.gradient} ${mode.border} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,0,0,0.15)]`}
              >
                {/* Illustration */}
                <div className="relative aspect-[2/1] w-full overflow-hidden">
                  <Image
                    src={mode.image}
                    alt={mode.title}
                    width={1200}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${mode.color}20`, border: `1px solid ${mode.color}40` }}
                    >
                      <Icon className="h-4.5 w-4.5" style={{ color: mode.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white drop-shadow-md">
                        {mode.title}
                      </h3>
                      <p className="text-xs text-white/70">{mode.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <p className="text-sm text-muted-dark leading-relaxed">
                    {mode.description}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {mode.features.map((f) => (
                      <li
                        key={f}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${mode.badge}`}
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                    style={{ color: mode.color }}
                  >
                    {mode.cta}
                    <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
