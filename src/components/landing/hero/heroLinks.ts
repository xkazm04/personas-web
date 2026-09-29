import { DOWNLOAD_PLAN, ctaHref } from "@/lib/release";
import { trackDownloadClick } from "@/lib/analytics";
import { detectPlatformKey } from "@/components/waitlist-modal/waitlistUtils";

/** Same href, tracking and GitHub fallback as the site hero (`sections/HeroClient.tsx`). */
export const DOWNLOAD_HREF = ctaHref(DOWNLOAD_PLAN);
export const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/personas-ai";
export const TOUR_SEEN_KEY = "personas-tour-seen";
export const TOUR_BRIDGE_HREF = "/features?tour=1";

/** Platform is read at click time, never in render. */
export const trackHeroDownload = () => trackDownloadClick(DOWNLOAD_PLAN, "hero", detectPlatformKey());
