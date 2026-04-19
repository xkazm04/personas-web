"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Monitor, Shield, EyeOff, Wifi, Check, ArrowRight, ChevronDown, CircleCheck } from "lucide-react";
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
  SECURITY_FAQS,
} from "@/data/security";
import ArchitectureFlow from "./ArchitectureFlow";

const PILLAR_ICONS = { Monitor, Shield, EyeOff, Wifi } as Record<string, typeof Monitor>;

function SecurityFAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-glass last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left cursor-pointer"
      >
        <span className="text-base font-medium text-foreground pr-4">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="pb-4 text-base text-muted leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

const STATUS_STYLES = {
  simplified: { label: "Simplified", color: "#34d399", meaning: "Requirement exists but is dramatically easier to meet" },
  "not-applicable": { label: "N/A", color: "#fbbf24", meaning: "Requirement does not apply to local-first software" },
  "built-in": { label: "Built-in", color: "#06b6d4", meaning: "Handled automatically by the local architecture" },
};

function ComplianceRow({ point }: { point: (typeof COMPLIANCE_POINTS)[number] }) {
  const [open, setOpen] = useState(false);
  const status = STATUS_STYLES[point.status];
  return (
    <div className="border-b border-glass last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-4 px-6 py-5 text-left cursor-pointer group"
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
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-foreground">
            {point.label}
          </h4>
          <p className="text-sm text-muted leading-relaxed mt-1">
            {point.description}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted shrink-0 mt-1.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-0">
              <div
                className="rounded-lg border px-5 py-4"
                style={{
                  borderColor: `${status.color}20`,
                  backgroundColor: `${status.color}08`,
                }}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
                  What you don&apos;t need to worry about
                </p>
                <ul className="space-y-2">
                  {point.checklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
                      <CircleCheck
                        className="h-4 w-4 shrink-0 mt-0.5"
                        style={{ color: status.color }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const scrollMapItems = [
  { label: "SECURITY", href: "#security" },
  { label: "ARCHITECTURE", href: "#architecture" },
  { label: "COMPLIANCE", href: "#compliance" },
  { label: "FAQ", href: "#security-faq" },
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
                  className="rounded-xl border border-glass bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8"
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

          <ArchitectureFlow />
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

          {/* Status legend */}
          <motion.div
            variants={fadeUp}
            className="mx-auto max-w-3xl mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {Object.values(STATUS_STYLES).map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-medium text-foreground">{s.label}</span>
                <span className="text-muted">{s.meaning}</span>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto max-w-3xl">
            <TerminalPanel bg={40} shadow="none">
              {COMPLIANCE_POINTS.map((point) => (
                <ComplianceRow key={point.label} point={point} />
              ))}
            </TerminalPanel>
          </motion.div>
        </SectionWrapper>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <SectionWrapper id="security-faq" aria-label="Security FAQ">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <SectionHeading>
              Common{" "}
              <GradientText className="drop-shadow-lg">questions</GradientText>
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              Direct answers to the security and privacy questions we hear most often.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto max-w-2xl">
            <TerminalPanel bg={40} shadow="none">
              <div className="px-6">
                {SECURITY_FAQS.map((faq) => (
                  <SecurityFAQItem key={faq.question} {...faq} />
                ))}
              </div>
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
                className="inline-flex items-center gap-2 rounded-full border border-glass-hover px-8 py-3 text-base font-medium text-muted transition-colors hover:border-white/20 hover:text-foreground"
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
