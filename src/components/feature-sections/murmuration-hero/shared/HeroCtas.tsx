"use client";

import { Download } from "lucide-react";
import { GithubIcon } from "@/components/icons/brand-icons";
import PrimaryCTA from "@/components/PrimaryCTA";
import TourLauncher from "@/components/tour/TourLauncher";
import { useTranslation } from "@/i18n/useTranslation";
import { DOWNLOAD_PLAN, ctaHref } from "@/lib/release";
import { trackDownloadClick } from "@/lib/analytics";
import { detectPlatformKey } from "@/components/waitlist-modal/waitlistUtils";

// The download CTA reports itself (placement per hero),
// reading the platform at click time, never in render.
const trackHeroDownload = () => trackDownloadClick(DOWNLOAD_PLAN, "features-hero", detectPlatformKey());
const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/personas-ai";

/**
 * The hero's three real calls to action - Download, View on GitHub and the
 * guided-tour launcher - plus the trust line, shared by the landing and /features heroes.
 */
export default function HeroCtas({
  align = "start",
  trust = true,
  tour = true,
}: {
  align?: "start" | "center";
  trust?: boolean;
  /** The home tour launcher; off where the page offers its own tour. */
  tour?: boolean;
}) {
  const { t } = useTranslation();
  const justify = align === "center" ? "justify-center" : "justify-center lg:justify-start";
  const textAlign = align === "center" ? "text-center" : "text-center lg:text-left";
  return (
    <div className="flex flex-col gap-4">
      <div className={`flex flex-wrap items-center gap-4 ${justify}`}>
        <PrimaryCTA href={ctaHref(DOWNLOAD_PLAN)} onClick={trackHeroDownload} icon={Download} label={t.hero.downloadCta} />
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-full border border-glass-hover bg-background/60 px-7 py-4 text-base font-medium text-foreground backdrop-blur-md transition-colors duration-300 hover:border-glass-strong hover:bg-background/80 focus-ring"
        >
          <GithubIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          <span>{t.hero.viewOnGithub}</span>
        </a>
        {tour && <TourLauncher tourId="home" bridgeHref="/features?tour=1" intro />}
      </div>
      {trust && <p className={`text-base text-muted-dark ${textAlign}`}>{t.hero.trustLine}</p>}
    </div>
  );
}
