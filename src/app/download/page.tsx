"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Apple, Terminal, Bell, Shield } from "lucide-react";
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
import { PLATFORMS, APP_VERSION, type PlatformId } from "@/data/download";
import PlatformCard from "./PlatformCard";
import InstallGuide from "./InstallGuide";
import DownloadFaq from "./DownloadFaq";

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
            <span className="inline-block rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3.5 py-1 text-base font-medium tracking-wider uppercase text-brand-cyan/70 font-mono mb-6">
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
            <p className="mt-3 text-base text-muted">
              {platform.fileSize} · {platform.fileType}
            </p>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-4 text-base text-muted"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-brand-emerald/60" />
              AES-256 encrypted
            </span>
            <span className="text-white/60">·</span>
            <span>Zero telemetry</span>
            <span className="text-white/60">·</span>
            <span>Free forever</span>
            <span className="text-white/60">·</span>
            <Link
              href="/changelog"
              className="text-brand-cyan/60 hover:text-brand-cyan transition-colors"
            >
              Changelog →
            </Link>
          </motion.div>
        </SectionWrapper>

        <InstallGuide platform={platform} />
        <DownloadFaq />
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
