"use client";

import { Download } from "lucide-react";
import { GithubIcon } from "@/components/icons/brand-icons";
import PrimaryCTA from "@/components/PrimaryCTA";
import TourLauncher from "@/components/tour/TourLauncher";
import { useTranslation } from "@/i18n/useTranslation";
import { DOWNLOAD_PLAN, ctaHref } from "@/lib/release";
import { trackDownloadClick } from "@/lib/analytics";
import { detectPlatformKey } from "@/components/waitlist-modal/waitlistUtils";

// Same reporting as the live hero: platform is read at click time, never in render.
const trackHeroDownload = () => trackDownloadClick(DOWNLOAD_PLAN, "hero", detectPlatformKey());

/** The live hero's three calls to action, unchanged: download, GitHub, guided tour. */
export default function HeroCtas({ align = "start" }: { align?: "start" | "center" }) {
  const { t } = useTranslation();
  const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/personas-ai";
  const justify = align === "center" ? "justify-center" : "justify-center lg:justify-start";
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 ${justify}`}>
      <PrimaryCTA href={ctaHref(DOWNLOAD_PLAN)} onClick={trackHeroDownload} icon={Download} label={t.hero.downloadCta} />
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center gap-3 rounded-full border border-glass-hover bg-surface/60 px-7 py-3.5 text-base font-medium text-foreground backdrop-blur-sm transition-colors duration-300 hover:border-glass-strong hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-cyan/60 focus-visible:outline-none"
      >
        <GithubIcon className="h-5 w-5" />
        {t.hero.viewOnGithub}
      </a>
      <TourLauncher tourId="home" bridgeHref="/features?tour=1" intro />
    </div>
  );
}
