"use client";

import { Download } from "lucide-react";
import PrimaryCTA from "@/components/PrimaryCTA";
import TourLauncher from "@/components/tour/TourLauncher";
import { useTranslation } from "@/i18n/useTranslation";
import { DOWNLOAD_PLAN, ctaHref } from "@/lib/release";
import { trackDownloadClick } from "@/lib/analytics";
import { detectPlatformKey } from "@/components/waitlist-modal/waitlistUtils";

// The download CTA reports itself (placement per hero),
// reading the platform at click time, never in render.
const trackHeroDownload = () => trackDownloadClick(DOWNLOAD_PLAN, "hero", detectPlatformKey());

/**
 * The landing hero's two calls to action - Download and the guided-tour launcher -
 * plus the trust line. GitHub lives in the footer (FooterBrand); the /features hero
 * keeps its own copy of this component with the GitHub link.
 */
export default function HeroCtas({ align = "start", trust = true }: { align?: "start" | "center"; trust?: boolean }) {
  const { t } = useTranslation();
  const justify = align === "center" ? "justify-center" : "justify-center lg:justify-start";
  const textAlign = align === "center" ? "text-center" : "text-center lg:text-left";
  return (
    <div className="flex flex-col gap-4">
      <div className={`flex flex-wrap items-center gap-4 ${justify}`}>
        <PrimaryCTA href={ctaHref(DOWNLOAD_PLAN)} onClick={trackHeroDownload} icon={Download} label={t.hero.downloadCta} />
        <TourLauncher tourId="home" bridgeHref="/features?tour=1" intro />
      </div>
      {trust && <p className={`text-base text-muted-dark ${textAlign}`}>{t.hero.trustLine}</p>}
    </div>
  );
}
