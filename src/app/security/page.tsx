"use client";

import { motion } from "framer-motion";
import { Monitor, Shield, EyeOff, Wifi, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { TerminalPanel } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import {
  SECURITY_PILLARS,
  COMPLIANCE_POINTS,
  ARCHITECTURE_LAYERS,
} from "@/data/security";

const PILLAR_ICONS = { Monitor, Shield, EyeOff, Wifi } as Record<string, typeof Monitor>;

const STATUS_STYLES = {
  simplified: { label: "Simplified", color: "#34d399" },
  "not-applicable": { label: "N/A", color: "#fbbf24" },
  "built-in": { label: "Built-in", color: "#06b6d4" },
};

const scrollMapItems = [
  { label: "SECURITY", href: "#security" },
  { label: "ARCHITECTURE", href: "#architecture" },
  { label: "COMPLIANCE", href: "#compliance" },
  { label: "CTA", href: "#security-cta" },
];

export default function SecurityPage() {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        <div className="h-24" />

        {/* ── Hero + Pillars ─────────────────────────────────────── */}
        <SectionWrapper id="security" aria-label="Security overview">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="mb-4 text-base font-medium uppercase tracking-widest text-brand-emerald/70">
              Security & Privacy
            </p>
            <SectionHeading>
              Your data{" "}
              <GradientText className="drop-shadow-lg">never leaves</GradientText>
              {" "}your machine
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              Unlike cloud AI platforms, Personas runs entirely on your desktop.
              AES-256 encryption, OS-native keyring, zero telemetry, air-gap
              capable. Privacy by architecture, not by policy.
            </p>
          </motion.div>

          {/* Pillars */}
          <div className="grid gap-6 sm:grid-cols-2">
            {SECURITY_PILLARS.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.icon] ?? Shield;
              return (
                <motion.div
                  key={pillar.title}
                  variants={fadeUp}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8"
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${pillar.color}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: pillar.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-base text-muted leading-relaxed mb-4">
                    {pillar.description}
                  </p>
                  <ul className="space-y-2">
                    {pillar.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted">
                        <Check
                          className="h-3.5 w-3.5 shrink-0 mt-0.5"
                          style={{ color: pillar.color }}
                        />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </SectionWrapper>

        {/* ── Architecture Diagram ──────────────────────────────── */}
        <SectionWrapper id="architecture" aria-label="Security architecture">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <SectionHeading>
              How it{" "}
              <GradientText className="drop-shadow-lg">works</GradientText>
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              No middleman. Your machine talks directly to your AI provider.
              Personas is the orchestration layer in between — running locally.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto max-w-2xl space-y-0">
            {ARCHITECTURE_LAYERS.map((layer, i) => (
              <div key={layer.name} className="relative">
                {/* Connector line */}
                {i > 0 && (
                  <div className="mx-auto h-8 w-px bg-gradient-to-b from-white/10 to-white/5" />
                )}
                <div
                  className="rounded-xl border bg-white/[0.02] backdrop-blur-sm px-6 py-5 flex items-center gap-4"
                  style={{ borderColor: `${layer.color}20` }}
                >
                  <div
                    className="shrink-0 h-3 w-3 rounded-full"
                    style={{ backgroundColor: layer.color }}
                  />
                  <div>
                    <h4
                      className="text-base font-semibold"
                      style={{ color: layer.color }}
                    >
                      {layer.name}
                    </h4>
                    <p className="text-sm text-muted mt-0.5">{layer.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </SectionWrapper>

        {/* ── Compliance ────────────────────────────────────────── */}
        <SectionWrapper id="compliance" aria-label="Compliance">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <SectionHeading>
              Compliance,{" "}
              <GradientText className="drop-shadow-lg">simplified</GradientText>
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              When your data doesn&apos;t leave your machine, most compliance
              requirements become dramatically simpler — or disappear entirely.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto max-w-3xl">
            <TerminalPanel bg={40} shadow="none">
            {COMPLIANCE_POINTS.map((point) => {
              const status = STATUS_STYLES[point.status];
              return (
                <div
                  key={point.label}
                  className="flex items-start gap-4 px-6 py-5 border-b border-white/5 last:border-b-0"
                >
                  <span
                    className="shrink-0 mt-0.5 rounded px-2 py-0.5 text-sm font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${status.color}15`,
                      color: status.color,
                    }}
                  >
                    {status.label}
                  </span>
                  <div>
                    <h4 className="text-base font-semibold text-foreground">
                      {point.label}
                    </h4>
                    <p className="text-sm text-muted leading-relaxed mt-1">
                      {point.description}
                    </p>
                  </div>
                </div>
              );
            })}
            </TerminalPanel>
          </motion.div>
        </SectionWrapper>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <SectionWrapper id="security-cta" aria-label="Get started">
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
            <SectionHeading>
              Privacy by{" "}
              <GradientText className="drop-shadow-lg">default</GradientText>
            </SectionHeading>
            <p className="mt-6 text-base text-muted leading-relaxed font-light">
              No signup. No cloud account. No data processing agreement.
              Download and run — your agents are private from the first second.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#download"
                className="inline-flex items-center gap-2 rounded-full bg-brand-emerald/15 border border-brand-emerald/30 px-8 py-3 text-base font-semibold text-brand-emerald transition-colors hover:bg-brand-emerald/25"
              >
                <Shield className="h-4 w-4" />
                Download Free
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-8 py-3 text-base font-medium text-muted transition-colors hover:border-white/20 hover:text-foreground"
              >
                Compare Security
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}
