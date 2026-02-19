"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";

const stats = [
  { value: "100x", label: "Faster than manual" },
  { value: "24/7", label: "Always running" },
  { value: "0", label: "Code required" },
];

export default function Vision() {
  return (
    <section className="relative overflow-hidden">
      {/* Fullwidth background image */}
      <div className="absolute inset-0">
        <Image
          src="/imgs/illustration_hd.jpg"
          alt="Futuristic command center with AI personality cards"
          fill
          className="object-cover object-center"
          sizes="100vw"
          quality={80}
          priority={false}
        />
        {/* Dark overlay mask — ensures text readability */}
        <div className="absolute inset-0 bg-black/65" />
        {/* Extra gradient overlays for smooth edge blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
      </div>

      {/* Content */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 mx-auto max-w-5xl px-6 py-32 md:py-44"
      >
        <div className="mx-auto max-w-2xl text-center">
          <motion.div variants={fadeUp}>
            <span className="inline-block rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3.5 py-1 text-[11px] font-medium tracking-wider uppercase text-brand-cyan/70 font-mono backdrop-blur-sm mb-6">
              The Vision
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold tracking-tight md:text-5xl lg:text-[3.5rem] leading-[1.1]"
          >
            Your personal army of{" "}
            <GradientText>AI specialists</GradientText>
          </motion.h2>

          {/* Decorative line */}
          <motion.div variants={fadeUp} className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-brand-cyan/25 to-transparent" />

          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg text-white/70 leading-relaxed"
          >
            Imagine a world where every repetitive task is handled by a
            purpose-built AI agent — designed by you in plain English,
            coordinated through an intelligent event bus, and running
            autonomously on your desktop or in the cloud.
          </motion.p>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            className="mt-12 flex items-center justify-center gap-8 md:gap-12"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold tracking-tight md:text-4xl bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-white/40 font-mono tracking-wider uppercase">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Decorative border bar at the bottom */}
          <motion.div
            variants={fadeUp}
            className="mt-12 mx-auto flex items-center justify-center gap-3"
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-brand-cyan/20" />
            <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan/30" />
            <div className="h-px w-24 bg-gradient-to-r from-brand-cyan/20 via-brand-purple/15 to-brand-cyan/20" />
            <div className="h-1.5 w-1.5 rounded-full bg-brand-purple/30" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-brand-purple/20" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
