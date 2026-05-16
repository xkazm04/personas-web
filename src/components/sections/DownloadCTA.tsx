"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

import GradientText from "@/components/GradientText";
import PrimaryCTA from "@/components/PrimaryCTA";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import WaitlistModal from "@/components/WaitlistModal";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import { trackDownloadClick } from "@/lib/analytics";

import { DownloadStepGrid } from "./download-cta/DownloadStepGrid";
import { DownloadTrustSignals } from "./download-cta/DownloadTrustSignals";
import { PlatformPills } from "./download-cta/PlatformPills";
import type { Platform } from "./download-cta/downloadCtaTypes";
import { useDownloadPlatforms } from "./download-cta/useDownloadPlatforms";
import { useFreshRelease } from "./download-cta/useFreshRelease";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
const RELEASE_TITLE = process.env.NEXT_PUBLIC_RELEASE_TITLE || "Latest";
const RELEASE_DATE = process.env.NEXT_PUBLIC_RELEASE_DATE ?? "";
const DOWNLOAD_URL = process.env.NEXT_PUBLIC_DOWNLOAD_URL;

export default function DownloadCTA() {
  const { t } = useTranslation();
  const platforms = useDownloadPlatforms(DOWNLOAD_URL);
  const [waitlistPlatform, setWaitlistPlatform] = useState<Platform | null>(null);
  const isFresh = useFreshRelease(RELEASE_DATE);
  const downloadSteps = [
    DOWNLOAD_URL ? t.downloadSection.downloadInstaller : t.downloadSection.joinWaitlist,
    t.downloadSection.connectCli,
    t.downloadSection.launchAgent,
  ];

  return (
    <SectionWrapper id="download" aria-labelledby="download-heading" className="noise py-40 md:py-48">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-spin-slow h-[min(500px,86vw)] w-[min(500px,86vw)]" style={{ animationDuration: "40s" }}>
          <svg viewBox="0 0 500 500" className="h-full w-full">
            <circle cx="250" cy="250" r="240" fill="none" stroke="rgba(6,182,212,0.025)" strokeWidth="0.5" strokeDasharray="4 16" />
            <circle cx="250" cy="10" r="2" fill="rgba(6,182,212,0.12)" />
          </svg>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 section-line" />

      <div className="mx-auto max-w-2xl text-center">
        <motion.div variants={fadeUp}>
          <span className={`inline-block rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3.5 py-1 text-base font-medium tracking-wider uppercase text-brand-cyan/70 font-mono mb-6${isFresh ? " animate-badge-pulse" : ""}`}>
            v{APP_VERSION} - {RELEASE_TITLE}
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

        <DownloadStepGrid steps={downloadSteps} stepLabel={t.common.step} />

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

        <PlatformPills
          platforms={platforms}
          notifyLabel={t.common.notifyMe}
          onWaitlist={setWaitlistPlatform}
        />

        {DOWNLOAD_URL && (
          <DownloadTrustSignals
            requiresCli={t.downloadSection.requiresCli}
            installerSize={t.downloadSection.installerSize}
          />
        )}
      </div>

      {waitlistPlatform && (
        <WaitlistModal
          platformKey={waitlistPlatform.key}
          platformLabel={waitlistPlatform.label}
          platformIcon={waitlistPlatform.icon}
          open={!!waitlistPlatform}
          onClose={() => setWaitlistPlatform(null)}
        />
      )}
    </SectionWrapper>
  );
}
