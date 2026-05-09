"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Monitor, Apple, Terminal } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { trackDownloadClick } from "@/lib/analytics";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import PrimaryCTA from "@/components/PrimaryCTA";
import SectionWrapper from "@/components/SectionWrapper";
import WaitlistModal from "@/components/WaitlistModal";
import { useTranslation } from "@/i18n/useTranslation";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
const RELEASE_TITLE = process.env.NEXT_PUBLIC_RELEASE_TITLE || "Latest";
const RELEASE_DATE = process.env.NEXT_PUBLIC_RELEASE_DATE ?? "";
const DOWNLOAD_URL = process.env.NEXT_PUBLIC_DOWNLOAD_URL;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type Platform = { icon: typeof Monitor; label: string; available: boolean };

function usePlatforms(): Platform[] {
  const { t } = useTranslation();
  return [
    { icon: Monitor, label: t.downloadSection.windows, available: !!DOWNLOAD_URL },
    { icon: Apple, label: t.downloadSection.macos, available: false },
    { icon: Terminal, label: t.downloadSection.linux, available: false },
  ];
}

export default function DownloadCTA() {
  const { t } = useTranslation();
  const platforms = usePlatforms();
  const [waitlistPlatform, setWaitlistPlatform] = useState<Platform | null>(null);

  const [isFresh] = useState(() => {
    if (!RELEASE_DATE) return false;
    const released = new Date(RELEASE_DATE).getTime();
    return !isNaN(released) && Date.now() - released < SEVEN_DAYS_MS;
  });

  return (
    <SectionWrapper id="download" aria-labelledby="download-heading" className="noise py-40 md:py-48">
      {/* Decorative orbital ring */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-spin-slow" style={{ width: 500, height: 500, animationDuration: "40s" }}>
          <svg viewBox="0 0 500 500" className="h-full w-full">
            <circle cx="250" cy="250" r="240" fill="none" stroke="rgba(6,182,212,0.025)" strokeWidth="0.5" strokeDasharray="4 16" />
            <circle cx="250" cy="10" r="2" fill="rgba(6,182,212,0.12)" />
          </svg>
        </div>
      </div>

      {/* Top section line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 section-line" />

      <div className="mx-auto max-w-2xl text-center">
        <motion.div variants={fadeUp}>
          <span className={`inline-block rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3.5 py-1 text-base font-medium tracking-wider uppercase text-brand-cyan/70 font-mono mb-6${isFresh ? " animate-badge-pulse" : ""}`}>
            v{APP_VERSION} — {RELEASE_TITLE}
          </span>
        </motion.div>

        <motion.div variants={fadeUp}>
          <SectionHeading id="download-heading">
            {t.downloadSection.heading}
            <br />
            <GradientText className="drop-shadow-lg">{t.downloadSection.headingGradient}</GradientText>
          </SectionHeading>
        </motion.div>

        <motion.p variants={fadeUp} className="mt-8 text-lg text-muted-dark leading-relaxed sm:text-xl font-light">
          {t.downloadSection.subtitle}
        </motion.p>

        <motion.div
          className="mt-6 mx-auto grid max-w-xl grid-cols-1 gap-2 text-left sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.4 }}
          variants={{
            hidden: { transition: { staggerChildren: 0.1 } },
            visible: { transition: { staggerChildren: 0.6 } },
          }}
        >
          {[
            DOWNLOAD_URL ? t.downloadSection.downloadInstaller : t.downloadSection.joinWaitlist,
            t.downloadSection.connectCli,
            t.downloadSection.launchAgent,
          ].map((step, index) => {
            const glowColor = index === 0
              ? "rgba(6,182,212,0.5)"
              : index === 1
                ? "rgba(109,133,224,0.5)"
                : "rgba(168,85,247,0.5)";
            return (
              <motion.div
                key={step}
                className="rounded-xl border border-glass bg-white/[0.015] px-3 py-2"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 12,
                    transition: { duration: 0.3, ease: "easeOut" },
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    boxShadow: [
                      `0 0 0px ${glowColor.replace("0.5", "0")}`,
                      `0 0 20px ${glowColor}, inset 0 0 12px ${glowColor.replace("0.5", "0.08")}`,
                      `0 0 0px ${glowColor.replace("0.5", "0")}`,
                    ],
                    borderColor: [
                      "rgba(255,255,255,0.05)",
                      glowColor.replace("0.5", "0.4"),
                      "rgba(255,255,255,0.05)",
                    ],
                    transition: {
                      opacity: { duration: 0.3 },
                      y: { duration: 0.3 },
                      boxShadow: { duration: 0.8, ease: "easeInOut" },
                      borderColor: { duration: 0.8, ease: "easeInOut" },
                    },
                  },
                }}
              >
                <p className="text-base font-mono uppercase tracking-wider text-muted-dark">{t.common.step} {index + 1}</p>
                <p className="mt-1 text-base text-muted">{step}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main CTA */}
        <motion.div variants={fadeUp} className="mt-10">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {DOWNLOAD_URL ? (
              <PrimaryCTA
                href="/api/download"
                onClick={() => trackDownloadClick("windows")}
                icon={Download}
                label="Download for Windows"
                variant="solid"
              />
            ) : (
              <PrimaryCTA
                onClick={() => setWaitlistPlatform(platforms[0])}
                icon={Download}
                label="Download for Windows"
                variant="solid"
              />
            )}
            <a
              href="#features"
              className="inline-flex w-[min(100%,20rem)] items-center justify-center rounded-full border border-glass-hover bg-white/[0.015] px-6 py-3 text-base font-medium text-muted transition-colors duration-300 hover:border-glass-strong hover:text-foreground sm:w-auto focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none"
            >
              {t.downloadSection.exploreFirst}
            </a>
          </div>
        </motion.div>

        {/* Platform pills */}
        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {platforms.map((p) =>
            p.available ? (
              <div
                key={p.label}
                className="flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-2 text-base font-medium text-brand-cyan shadow-[0_0_15px_rgba(6,182,212,0.06)] transition-all duration-300"
              >
                <p.icon className="h-3.5 w-3.5" />
                {p.label}
                <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
              </div>
            ) : (
              <button
                key={p.label}
                onClick={() => setWaitlistPlatform(p)}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-glass bg-white/[0.01] px-4 py-2 text-base font-medium text-muted-dark transition-all duration-300 hover:border-brand-purple/20 hover:bg-brand-purple/5 hover:text-brand-purple/80 focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none"
              >
                <p.icon className="h-3.5 w-3.5" />
                {p.label}
                <span className="text-base">{t.common.notifyMe}</span>
              </button>
            )
          )}
        </motion.div>

        {/* Trust signals */}
        {DOWNLOAD_URL && (
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3 text-base text-muted-dark sm:gap-6">
            <span className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-brand-cyan/40" />
              {t.downloadSection.requiresCli}
            </span>
            <span className="hidden h-3 w-px bg-white/[0.06] sm:inline-block" />
            <span className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-brand-cyan/40" />
              {t.downloadSection.installerSize}
            </span>
          </motion.div>
        )}
      </div>

      {/* Waitlist modal */}
      {waitlistPlatform && (
        <WaitlistModal
          platform={waitlistPlatform.label}
          platformIcon={waitlistPlatform.icon}
          open={!!waitlistPlatform}
          onClose={() => setWaitlistPlatform(null)}
        />
      )}
    </SectionWrapper>
  );
}
