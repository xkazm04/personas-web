"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "11", suffix: "/15", label: "Phases Shipped" },
  { value: "228", suffix: "+", label: "Rust Tests Passing" },
  { value: "34", suffix: "K", label: "Lines of Code" },
  { value: "24", suffix: "", label: "Database Tables" },
  { value: "70", suffix: "+", label: "CLI Commands" },
  { value: "<2", suffix: "s", label: "Cold Start" },
];

export default function SocialProof() {
  return (
    <section className="relative border-y border-white/[0.03] overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/[0.02] via-transparent to-brand-purple/[0.02]" />

      <div className="relative mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-3 gap-6 md:grid-cols-6 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="group text-center"
            >
              <div className="text-3xl font-extrabold tracking-tight md:text-4xl drop-shadow-sm">
                <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                  {stat.value}
                </span>
                <span className="text-brand-cyan/80 text-xl ml-0.5">{stat.suffix}</span>
              </div>
              <div className="mt-2 text-[11px] font-mono tracking-widest uppercase text-muted-dark/70 transition-colors duration-300 group-hover:text-white/80 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
