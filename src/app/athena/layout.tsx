import type { Metadata } from "next";
import { preload } from "react-dom";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 3600;

/*
 * NOINDEX ON PURPOSE — remove `robots` (and add the page to the navbar) when
 * the page is ready to be found.
 *
 * Section copy and the scroll-map labels now live in `src/i18n` under
 * `athenaPage.*`, translated into all 14 locales. What is still outstanding is
 * the page's own hero CTAs, which are `href="#"` placeholders — a page that
 * invites you to act and then does nothing is worse than one nobody can find.
 *
 * The `metadata` below is hardcoded English, which convention #1 forbids. That
 * is a SITE-WIDE gap, not one this page introduced: no layout in `src/app`
 * localizes its metadata, because doing so needs a server-side locale the app
 * does not resolve today. Fixing it here alone would not make the site correct
 * and would hide the real shape of the problem — it belongs to whoever takes
 * on localized metadata across every route.
 */
export const metadata: Metadata = {
  title: "Athena",
  description:
    "Athena is the assistant inside Personas: she sets your workspace up with you, turns a sentence into work, keeps your whole portfolio in view, and remembers what matters.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Athena — Personas",
    description:
      "The assistant inside Personas: she sets up with you, turns a sentence into work, and remembers what matters.",
    url: `${SITE_URL}/athena`,
  },
  alternates: {
    canonical: `${SITE_URL}/athena`,
  },
};

/*
 * The hero is a client-only chunk (`ssr: false`, see sections/athena-lazy.tsx), so
 * the avatar poster it paints is named nowhere in the served markup and the
 * look-ahead scanner cannot find it: the request would start only after the page
 * script and the hero chunk have run. The reference cannot move into markup
 * without server-rendering the hero, so it is declared here - one preload, for the
 * one image the first screen is built around. Both Orb branches use this exact
 * address (the `poster` of the clip, the `<img>` under reduced motion), so the
 * preload is always consumed.
 */
const HERO_POSTER = "/athena/athena_baseline.jpg";

export default function AthenaLayout({ children }: { children: React.ReactNode }) {
  preload(HERO_POSTER, { as: "image", fetchPriority: "high" });
  return children;
}
