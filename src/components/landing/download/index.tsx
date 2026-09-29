"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useHydrated } from "@/hooks/useHydrated";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import { trackDownloadClick, type WaitlistEntryPoint } from "@/lib/analytics";
import { pickWaitlistPlatform } from "@/lib/landing-address";
import { DOWNLOAD_PLAN, RELEASE_DATE_ENV, RELEASE_TITLE, SITE_VERSION, latestRelease, releasePulseDate } from "@/lib/release";
import { RELEASES } from "@/data/changelog";
import { detectPlatformKey } from "@/components/waitlist-modal/waitlistUtils";
import type { Platform } from "@/components/sections/download-cta/downloadCtaTypes";
import { useDownloadPlatforms } from "@/components/sections/download-cta/useDownloadPlatforms";
import { useFreshRelease } from "@/components/sections/download-cta/useFreshRelease";
import { useSeenOnce } from "../shared/useSeenOnce";
import { LnKeyButton, LnKeyLink } from "../shared/LnKey";
import DownloadBox from "./DownloadBox";
import DownloadPlatforms from "./DownloadPlatforms";
import "./download.css";

// Opened only on click, as the navbar and the classic section already do.
const WaitlistModal = dynamic(() => import("@/components/WaitlistModal"), { ssr: false });

// Same authority as /api/download and the classic DownloadCTA: a download is
// offered only when the release plan says it is live.
const PRIMARY = DOWNLOAD_PLAN.primary.kind === "download" ? DOWNLOAD_PLAN.primary : null;
const PULSE_DATE = releasePulseDate(RELEASE_DATE_ENV, latestRelease(RELEASES));
const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/personas-ai";

/** The final call to action: what you get, the real download and the honest platform list. */
export default function LandingDownload() {
  const { t } = useTranslation();
  const n = t.landingNext.download;
  const d = t.downloadSection;
  const platforms = useDownloadPlatforms(DOWNLOAD_PLAN);
  const hydrated = useHydrated();
  const fresh = useFreshRelease(PULSE_DATE) && hydrated;

  const [waitlist, setWaitlist] = useState<{ platform: Platform; entryPoint: WaitlistEntryPoint } | null>(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const openWaitlist = (platform: Platform, entryPoint: WaitlistEntryPoint) => {
    setWaitlist({ platform, entryPoint });
    setWaitlistOpen(true);
  };

  // The lid lifts once, when the box is half in view (never in a hidden tab);
  // under reduced motion it starts open.
  const boxRef = useRef<HTMLElement>(null);
  const seen = useSeenOnce(boxRef, 0.5);
  const still = useStillMotion();

  const meta = n.installerMeta.replace("{version}", SITE_VERSION).replace("{title}", RELEASE_TITLE);

  return (
    <section id="download" className="ln-sec ln-box-sec" aria-labelledby="download-h">
      <div className="ln-wrap ln-boxwrap">
        <div>
          <p className="ln-idx">{n.kicker}</p>
          <h2 className="ln-dl-h" id="download-h">
            {n.heading}
            <em>.</em>
          </h2>
          <p className="ln-lead">{n.lede}</p>
          <p className="ln-dl-meta">
            <i className={`ln-led${fresh ? " ln-on" : ""}`} aria-hidden="true" style={{ marginRight: "0.8em" }} />
            {meta}
          </p>
          <div className="ln-dl-cta">
            {PRIMARY ? (
              <LnKeyLink
                tone="signal"
                size="lg"
                icon="i-dl"
                href={PRIMARY.href}
                onClick={() => trackDownloadClick(DOWNLOAD_PLAN, "download-cta", detectPlatformKey())}
              >
                {d.downloadFor.replace("{platform}", d.windows)}
              </LnKeyLink>
            ) : (
              <LnKeyButton
                tone="signal"
                size="lg"
                icon="i-dl"
                onClick={() => openWaitlist(pickWaitlistPlatform(detectPlatformKey(), platforms), "download-cta")}
              >
                {d.joinWaitlist}
              </LnKeyButton>
            )}
            <LnKeyLink icon="i-gh" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              {n.github}
            </LnKeyLink>
          </div>
          <DownloadPlatforms platforms={platforms} onWaitlist={(p) => openWaitlist(p, "platform-pill")} />
          <p className="ln-dl-trust">
            <i className="ln-led ln-ok" aria-hidden="true" />
            {d.noSignupLine}
          </p>
          {PRIMARY ? (
            <p className="ln-dl-facts">
              {d.requiresCli} <span aria-hidden="true">/</span> {d.installerSize}
            </p>
          ) : null}
        </div>
        <DownloadBox open={seen || still} figureRef={boxRef} />
      </div>
      {waitlist ? (
        <WaitlistModal
          platformKey={waitlist.platform.key}
          platformLabel={waitlist.platform.label}
          platformIcon={waitlist.platform.icon}
          open={waitlistOpen}
          onClose={() => setWaitlistOpen(false)}
          entryPoint={waitlist.entryPoint}
        />
      ) : null}
    </section>
  );
}
