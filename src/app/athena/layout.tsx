import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 3600;

/*
 * NOINDEX ON PURPOSE — remove `robots` (and add the page to the navbar) when
 * the page is ready to be found.
 *
 * Two things are still outstanding. The section copy lives in per-section
 * `copy.ts` / `data.ts` files under a `PROTOTYPE COPY — extract to src/i18n at
 * assembly` header, so this route currently ships hardcoded English against a
 * 14-locale site. And the copy is still moving section to section. Indexing a
 * page in that state costs more than it earns, so it stays reachable by URL
 * for review and invisible to crawlers until both are settled.
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

export default function AthenaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
