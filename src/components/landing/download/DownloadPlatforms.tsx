import type { Platform } from "@/components/sections/download-cta/downloadCtaTypes";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * The honest platform list, straight from the release plan: a platform that
 * downloads shows a lit lamp, one that does not is a "notify me" button that
 * opens the waitlist.
 */
export default function DownloadPlatforms({
  platforms,
  onWaitlist,
}: {
  platforms: Platform[];
  onWaitlist: (platform: Platform) => void;
}) {
  const { t } = useTranslation();
  return (
    <ul className="ln-plats" aria-label={t.landingNext.download.platformsLabel}>
      {platforms.map((p) => (
        <li key={p.key}>
          {p.available ? (
            <span className="ln-plat ln-plat-on">
              <i className="ln-led ln-on" aria-hidden="true" />
              {p.label}
            </span>
          ) : (
            <button type="button" className="ln-plat" onClick={() => onWaitlist(p)}>
              {p.label}
              <small>{t.common.notifyMe}</small>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
