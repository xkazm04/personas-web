"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

import GradientText from "@/components/GradientText";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import Footer from "@/components/sections/Footer";
import { TerminalPanel } from "@/components/primitives";
import { COMPLIANCE_POINTS, SECURITY_FAQS } from "@/data/security";
import { fadeUp } from "@/lib/animations";

import ArchitectureFlow from "./ArchitectureFlow";
import { ComplianceRow, STATUS_STYLES } from "./security-page/ComplianceRow";
import { SecurityFAQItem } from "./security-page/SecurityFAQItem";
import { SecurityPillarsGrid } from "./security-page/SecurityPillarsGrid";

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
          <SecurityPillarsGrid />
        </SectionWrapper>

        <SectionWrapper id="architecture" aria-label="Security architecture">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <SectionHeading>
              How it <GradientText className="drop-shadow-lg">works</GradientText>
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              No middleman. Your machine talks directly to your AI provider.
              Personas is the orchestration layer in between - running locally.
            </p>
          </motion.div>
          <ArchitectureFlow />
        </SectionWrapper>

        <SectionWrapper id="compliance" aria-label="Compliance">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <SectionHeading>
              Compliance,{" "}
              <GradientText className="drop-shadow-lg">simplified</GradientText>
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              When your data doesn&apos;t leave your machine, most compliance
              requirements become dramatically simpler - or disappear entirely.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mx-auto max-w-3xl mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {Object.values(STATUS_STYLES).map((status) => (
              <div key={status.label} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                <span className="font-medium text-foreground">{status.label}</span>
                <span className="text-muted">{status.meaning}</span>
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

        <SectionWrapper id="security-faq" aria-label="Security FAQ">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <SectionHeading>
              Common <GradientText className="drop-shadow-lg">questions</GradientText>
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              Direct answers to the security and privacy questions we hear most often.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto max-w-2xl">
            <TerminalPanel bg={40} shadow="none">
              <div className="px-6">
                {SECURITY_FAQS.map((faq, index) => (
                  <SecurityFAQItem key={faq.question} idx={index} {...faq} />
                ))}
              </div>
            </TerminalPanel>
          </motion.div>
        </SectionWrapper>

        <SectionWrapper id="security-cta" aria-label="Get started">
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
            <SectionHeading>
              Privacy by{" "}
              <GradientText className="drop-shadow-lg">default</GradientText>
            </SectionHeading>
            <p className="mt-6 text-base text-muted leading-relaxed font-light">
              No signup. No cloud account. No data processing agreement.
              Download and run - your agents are private from the first second.
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
