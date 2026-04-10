"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Monitor,
  Apple,
  Terminal,
  Check,
  ChevronDown,
  ArrowRight,
  Shield,
  Bell,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import WaitlistModal from "@/components/WaitlistModal";
import { fadeUp } from "@/lib/animations";
import { trackDownloadClick } from "@/lib/analytics";
import {
  PLATFORMS,
  DOWNLOAD_FAQS,
  APP_VERSION,
  type PlatformId,
  type PlatformInfo,
} from "@/data/download";

const ICONS = { Monitor, Apple, Terminal } as Record<string, typeof Monitor>;

function detectOS(): PlatformId {
  if (typeof navigator === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux")) return "linux";
  return "windows";
}

const scrollMapItems = [
  { label: "DOWNLOAD", href: "#download-hero" },
  { label: "INSTALL", href: "#install" },
  { label: "FAQ", href: "#download-faq" },
];

function PlatformCard({
  platform,
  selected,
  onSelect,
}: {
  platform: PlatformInfo;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = ICONS[platform.icon] ?? Monitor;

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center gap-3 rounded-xl border p-6 transition-all duration-200 text-center ${
        selected
          ? "border-brand-cyan/30 bg-brand-cyan/5 shadow-[0_0_30px_rgba(6,182,212,0.08)]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
      }`}
    >
      <Icon
        className={`h-8 w-8 ${selected ? "text-brand-cyan" : "text-muted"}`}
      />
      <span
        className={`text-lg font-semibold ${selected ? "text-foreground" : "text-muted"}`}
      >
        {platform.name}
      </span>
      <span className="text-xs text-muted">{platform.fileType}</span>
      {platform.available ? (
        <span className="flex items-center gap-1.5 text-xs text-brand-emerald">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-emerald shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
          Available
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-xs text-brand-purple">
          <Bell className="h-3 w-3" />
          Coming soon
        </span>
      )}
    </button>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium text-foreground pr-4">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

export default function DownloadPage() {
  const [selectedOS, setSelectedOS] = useState<PlatformId>(detectOS);
  const [waitlistPlatform, setWaitlistPlatform] = useState<string | null>(null);

  const platform = PLATFORMS.find((p) => p.id === selectedOS) ?? PLATFORMS[0];

  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        <div className="h-24" />

        {/* ── Hero ───────────────────────────────────────────── */}
        <SectionWrapper id="download-hero" aria-label="Download Personas">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="inline-block rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3.5 py-1 text-xs font-medium tracking-wider uppercase text-brand-cyan/70 font-mono mb-6">
              v{APP_VERSION}
            </span>
            <SectionHeading>
              Download{" "}
              <GradientText className="drop-shadow-lg">Personas</GradientText>
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              Free AI agent orchestration for your desktop. No signup, no cloud
              account, no credit card. Just download and build.
            </p>
          </motion.div>

          {/* Platform selector */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10"
          >
            {PLATFORMS.map((p) => (
              <PlatformCard
                key={p.id}
                platform={p}
                selected={p.id === selectedOS}
                onSelect={() => setSelectedOS(p.id)}
              />
            ))}
          </motion.div>

          {/* Download button or waitlist */}
          <motion.div variants={fadeUp} className="text-center mb-8">
            {platform.available && platform.downloadUrl ? (
              <a
                href={platform.downloadUrl}
                onClick={() => trackDownloadClick(platform.id)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 px-10 py-4 text-base font-semibold text-brand-cyan transition-colors hover:bg-brand-cyan/25"
              >
                <Download className="h-5 w-5" />
                Download for {platform.name}
              </a>
            ) : (
              <button
                onClick={() => setWaitlistPlatform(platform.name)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-purple/15 border border-brand-purple/30 px-10 py-4 text-base font-semibold text-brand-purple transition-colors hover:bg-brand-purple/25"
              >
                <Bell className="h-5 w-5" />
                Join {platform.name} Waitlist
              </button>
            )}
            <p className="mt-3 text-xs text-muted">
              {platform.fileSize} &middot; {platform.fileType}
            </p>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-brand-emerald/60" />
              AES-256 encrypted
            </span>
            <span className="text-white/10">&bull;</span>
            <span>Zero telemetry</span>
            <span className="text-white/10">&bull;</span>
            <span>Free forever</span>
            <span className="text-white/10">&bull;</span>
            <Link
              href="/changelog"
              className="text-brand-cyan/60 hover:text-brand-cyan transition-colors"
            >
              Changelog &rarr;
            </Link>
          </motion.div>
        </SectionWrapper>

        {/* ── Installation Guide ─────────────────────────────── */}
        <SectionWrapper id="install" aria-label="Installation guide">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Requirements */}
            <motion.div variants={fadeUp}>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                System Requirements — {platform.name}
              </h3>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
                <ul className="space-y-3">
                  {platform.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
                      <Check className="h-4 w-4 shrink-0 mt-0.5 text-brand-cyan/60" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Install steps */}
            <motion.div variants={fadeUp}>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Installation Steps
              </h3>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
                <ol className="space-y-4">
                  {platform.installSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-cyan/10 text-brand-cyan text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* After install links */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/tour"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-muted hover:border-white/[0.1] hover:text-foreground transition-colors"
                >
                  Take the product tour
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href="/guide/getting-started"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-muted hover:border-white/[0.1] hover:text-foreground transition-colors"
                >
                  Getting started guide
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href="/security"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-muted hover:border-white/[0.1] hover:text-foreground transition-colors"
                >
                  Security & Privacy
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        </SectionWrapper>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <SectionWrapper id="download-faq" aria-label="Download FAQ">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <SectionHeading>
              Frequently{" "}
              <GradientText className="drop-shadow-lg">asked</GradientText>
            </SectionHeading>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mx-auto max-w-2xl rounded-2xl border border-white/8 bg-black/40 backdrop-blur-xl overflow-hidden px-6"
          >
            {DOWNLOAD_FAQS.map((faq) => (
              <FAQItem key={faq.question} {...faq} />
            ))}
          </motion.div>
        </SectionWrapper>
      </PageShell>
      <Footer />

      {/* Waitlist modal */}
      {waitlistPlatform && (
        <WaitlistModal
          platform={waitlistPlatform}
          platformIcon={waitlistPlatform === "macOS" ? Apple : Terminal}
          open={!!waitlistPlatform}
          onClose={() => setWaitlistPlatform(null)}
        />
      )}
    </>
  );
}
