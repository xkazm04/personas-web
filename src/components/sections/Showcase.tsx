"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";

const highlights = [
  {
    label: "Design",
    desc: "Visually configure agent personas with natural language instructions",
    dotColor: "bg-brand-purple shadow-[0_0_6px_rgba(168,85,247,0.4)]",
  },
  {
    label: "Monitor",
    desc: "Real-time dashboards for every running agent",
    dotColor: "bg-brand-cyan shadow-[0_0_6px_rgba(6,182,212,0.4)]",
  },
  {
    label: "Scale",
    desc: "Deploy from desktop to cloud with a single click",
    dotColor: "bg-brand-emerald shadow-[0_0_6px_rgba(52,211,153,0.4)]",
  },
];

export default function Showcase() {
  return (
    <SectionWrapper id="showcase">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/3 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.04) 0%, rgba(6,182,212,0.02) 40%, transparent 70%)" }}
        />
      </div>

      <motion.div variants={fadeUp} className="text-center relative">
        <span className="inline-block rounded-full border border-brand-purple/20 bg-brand-purple/5 px-3.5 py-1 text-[11px] font-medium tracking-wider uppercase text-brand-purple/70 font-mono mb-6">
          In Action
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Meet your <GradientText>agent roster</GradientText>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted leading-relaxed">
          Each persona is a specialized AI agent with its own identity, tools, and mission —
          designed by you, orchestrated by Personas.
        </p>
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-brand-purple/15 to-transparent" />
      </motion.div>

      {/* Framed illustration */}
      <motion.div variants={fadeUp} className="relative mx-auto mt-16 max-w-4xl">
        {/* Outer decorative frame */}
        <div className="relative rounded-2xl p-px bg-gradient-to-br from-brand-cyan/20 via-brand-purple/10 to-brand-emerald/15">
          {/* Inner frame */}
          <div className="relative rounded-2xl overflow-hidden bg-background">
            {/* Corner accents */}
            <div className="pointer-events-none absolute top-0 left-0 z-10 w-12 h-12">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-brand-cyan/30 to-transparent" />
              <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-brand-cyan/30 to-transparent" />
            </div>
            <div className="pointer-events-none absolute top-0 right-0 z-10 w-12 h-12">
              <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-brand-purple/30 to-transparent" />
              <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-brand-purple/30 to-transparent" />
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 z-10 w-12 h-12">
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-brand-emerald/20 to-transparent" />
              <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-brand-emerald/20 to-transparent" />
            </div>
            <div className="pointer-events-none absolute bottom-0 right-0 z-10 w-12 h-12">
              <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-brand-cyan/20 to-transparent" />
              <div className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-brand-cyan/20 to-transparent" />
            </div>

            {/* Image */}
            <Image
              src="/imgs/illustration_photo.jpg"
              alt="Personas agent roster — holographic cards showing specialized AI agents"
              width={1920}
              height={1080}
              className="w-full h-auto"
              sizes="(max-width: 768px) 100vw, 896px"
              quality={85}
              priority={false}
            />

            {/* Bottom gradient overlay for text readability */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-background/60 to-transparent" />

            {/* Overlay caption bar */}
            <div className="absolute inset-x-0 bottom-0 z-10 px-8 pb-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.5)] animate-glow-border" />
                <span className="text-sm font-medium text-foreground/80">Agent Canvas</span>
                <span className="text-xs text-muted-dark font-mono">— Design & orchestrate your AI workforce</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative glow behind frame */}
        <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-brand-cyan/[0.03] via-transparent to-brand-purple/[0.03] blur-xl" />
      </motion.div>

      {/* Feature highlights below the image */}
      <motion.div variants={fadeUp} className="mt-12 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        {highlights.map((h, i) => (
          <motion.div
            key={h.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="group rounded-xl border border-white/[0.04] bg-white/[0.015] p-5 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-1.5 w-1.5 rounded-full ${h.dotColor}`} />
              <h4 className="text-sm font-semibold">{h.label}</h4>
            </div>
            <p className="text-xs leading-relaxed text-muted-dark">{h.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Section divider */}
      <div className="section-line mt-20 opacity-50" />
    </SectionWrapper>
  );
}
