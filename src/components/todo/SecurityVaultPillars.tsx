"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Lock,
  Fingerprint,
  CloudOff,
  Shield,
  type LucideIcon,
} from "lucide-react";

/* ── Pillar definitions ──────────────────────────────────────────── */

interface Pillar {
  icon: LucideIcon;
  title: string;
  kicker: string;
  detail: string;
  color: string;
  illustration: string;
}

const pillars: Pillar[] = [
  {
    icon: Lock,
    title: "Device-Only Encryption",
    kicker: "AES-256-GCM",
    detail:
      "The gold standard used by governments and financial institutions — applied to every credential on your device.",
    color: "#f43f5e",
    illustration: "/imgs/features/security/vault-door.png",
  },
  {
    icon: Fingerprint,
    title: "OS-Native Protection",
    kicker: "Your system's secure vault",
    detail:
      "Credentials are stored in Windows Credential Manager, macOS Keychain, or Linux Secret Service — the same place your OS already trusts.",
    color: "#ec4899",
    illustration: "/imgs/features/security/os-keyring.png",
  },
  {
    icon: CloudOff,
    title: "Zero Cloud Storage",
    kicker: "Nothing leaves your machine",
    detail:
      "No cloud sync, no telemetry, no third-party access. Your secrets exist only on your device — there is no remote copy to compromise.",
    color: "#a855f7",
    illustration: "/imgs/features/security/local-shield.png",
  },
];

/* ── Pillar card ─────────────────────────────────────────────────── */

function PillarCard({ p, i }: { p: Pillar; i: number }) {
  const Icon = p.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.12, duration: 0.55, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="force-dark group relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        height: 400,
        background:
          "linear-gradient(180deg, rgba(12,14,22,0.7) 0%, rgba(8,10,16,0.92) 100%)",
        border: `1px solid ${p.color}33`,
        boxShadow: `0 24px 60px -20px rgba(0,0,0,0.7), 0 0 0 1px ${p.color}12 inset`,
      }}
    >
      {/* ── Illustration hero zone ─────────────────────────────── */}
      <div className="relative h-[230px] overflow-hidden">
        <Image
          src={p.illustration}
          alt=""
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
          aria-hidden="true"
        />

        {/* Top-left accent tag */}
        <div
          className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-md"
          style={{
            borderColor: `${p.color}60`,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <Icon className="h-4 w-4" style={{ color: p.color }} />
          <span
            className="text-base font-mono uppercase tracking-widest font-bold"
            style={{ color: p.color }}
          >
            {p.kicker}
          </span>
        </div>

        {/* Bottom fade into body — strong so text that follows never fights the art */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(8,10,16,0.75) 55%, rgba(8,10,16,1) 100%)",
          }}
        />

        {/* Color spotlight on hover */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `radial-gradient(ellipse 60% 80% at 50% 40%, ${p.color}20, transparent 70%)`,
          }}
        />
      </div>

      {/* ── Body zone — typography anchored in one block ───────── */}
      <div className="relative flex flex-1 flex-col gap-3 px-6 pt-4 pb-6">
        {/* Title */}
        <h3 className="text-2xl font-bold leading-tight text-foreground">
          {p.title}
        </h3>

        {/* Detail */}
        <p className="text-base leading-relaxed text-foreground/75 flex-1">
          {p.detail}
        </p>
      </div>

      {/* Left accent rail — strong color signature */}
      <div
        className="absolute left-0 top-[230px] bottom-0 w-[3px] rounded-r-full"
        style={{
          background: `linear-gradient(180deg, ${p.color} 0%, transparent 100%)`,
          boxShadow: `0 0 16px ${p.color}60`,
        }}
      />
    </motion.div>
  );
}

/* ── Section body ────────────────────────────────────────────────── */

export default function SecurityVaultPillars() {
  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3 mx-auto max-w-6xl">
        {pillars.map((p, i) => (
          <PillarCard key={p.title} p={p} i={i} />
        ))}
      </div>

      {/* Shield accent */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-12 flex justify-center"
      >
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-rose-500/10" />
          <div className="absolute inset-0 rounded-full bg-rose-500/5" />
          <Shield className="relative h-7 w-7 text-rose-500/70" />
        </div>
      </motion.div>
    </div>
  );
}
