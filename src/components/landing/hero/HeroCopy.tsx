"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { LnKeyLink } from "../shared/LnKey";
import LnLed from "../shared/LnLed";
import HeroTour from "./HeroTour";
import { DOWNLOAD_HREF, GITHUB_URL, trackHeroDownload } from "./heroLinks";

/** Kicker, headline, promise, calls to action and the trust line. */
export default function HeroCopy() {
  const { t } = useTranslation();
  const h = t.landingNext.hero;
  return (
    <div className="ln-hero-copy">
      <p className="ln-idx ln-hero-kick">{h.kicker}</p>
      <h1 className="ln-hero-h" id="hero-h">
        {h.headlineA}
        <br />
        {h.headlineB}
        <em>{h.headlineEnd}</em>
      </h1>
      <p className="ln-hero-sub">
        {h.sub} <b>{h.subBold}</b>
      </p>
      <div className="ln-cta">
        <LnKeyLink tone="signal" size="lg" icon="i-dl" href={DOWNLOAD_HREF} onClick={trackHeroDownload}>
          {t.hero.downloadCta}
        </LnKeyLink>
        <LnKeyLink icon="i-gh" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          {t.hero.viewOnGithub}
        </LnKeyLink>
        <HeroTour />
      </div>
      <ul className="ln-hero-chips">
        {[t.hero.mode2, t.hero.mode3, t.hero.mode5].map((label) => (
          <li key={label}>
            <LnLed state="on" />
            {label}
          </li>
        ))}
      </ul>
      <p className="ln-trust">
        <LnLed state="ok" />
        {t.hero.trustLine}
      </p>
    </div>
  );
}
