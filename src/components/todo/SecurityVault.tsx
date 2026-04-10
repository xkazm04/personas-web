"use client";

import { motion } from "framer-motion";
import { Lock, Fingerprint, CloudOff, Shield } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";

const pillars = [
  {
    icon: Lock,
    title: "Device-Only Encryption",
    label: "AES-256-GCM encryption",
    detail:
      "The gold standard used by governments and financial institutions \u2014 applied to every credential on your device.",
    color: "#f43f5e",
  },
  {
    icon: Fingerprint,
    title: "OS-Native Protection",
    label: "Your system\u2019s secure vault",
    detail:
      "Credentials are stored in Windows Credential Manager, macOS Keychain, or Linux Secret Service \u2014 the same place your OS stores its own passwords.",
    color: "#e11d48",
  },
  {
    icon: CloudOff,
    title: "Zero Cloud Storage",
    label: "Nothing leaves your machine",
    detail:
      "No cloud sync, no telemetry, no third-party access. Your secrets exist only on your device, period.",
    color: "#be123c",
  },
];

const badges = ["Zero telemetry", "Open source", "Local-first"];

export default function SecurityVault() {
  return (
    <SectionWrapper id="security">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center"
      >
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Your data never{" "}
            <GradientText className="drop-shadow-lg">leaves</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-muted-dark font-light leading-relaxed"
        >
          Every password, API key, and access token is encrypted on your device
          using the same security standard banks rely on. Your credentials are
          stored in your operating system&apos;s own secure vault &mdash;{" "}
          <span className="text-foreground/80 font-medium">
            nothing is sent to the cloud, ever.
          </span>
        </motion.p>
      </motion.div>

      {/* Security pillar cards */}
      <div className="mt-16 grid gap-6 sm:grid-cols-1 lg:grid-cols-3 mx-auto max-w-4xl">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.03, boxShadow: `0 0 30px ${p.color}12` }}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04]"
          >
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-full transition-shadow duration-500 group-hover:shadow-[0_0_20px_var(--glow)]"
              style={{ backgroundColor: `${p.color}18`, "--glow": `${p.color}30` } as React.CSSProperties}
            >
              <p.icon className="h-5 w-5" style={{ color: p.color }} />
            </div>
            <div className="text-sm font-semibold text-foreground">{p.title}</div>
            <div className="mt-1 text-xs font-mono text-muted-dark">{p.label}</div>
            <div className="mt-3 text-sm text-muted-dark leading-relaxed">{p.detail}</div>
          </motion.div>
        ))}
      </div>

      {/* Animated shield accent */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-12 flex justify-center"
      >
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-rose-500/10" />
          <div className="absolute inset-0 rounded-full bg-rose-500/5" />
          <Shield className="relative h-6 w-6 text-rose-500/60" />
        </div>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        {badges.map((b) => (
          <span
            key={b}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-mono tracking-wide text-muted-dark"
          >
            {b}
          </span>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
