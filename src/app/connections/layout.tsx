import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { connectors } from "@/data/connectors";

export const dynamic = "force-static";
export const revalidate = 3600;

// Round down to the nearest 5 so the marketing count stays honest as the
// catalogue grows, matching the OG image (opengraph-image.tsx). Previously
// hardcoded "50+", which undersold the real catalogue by ~2.5x.
const INTEGRATION_COUNT = Math.floor(connectors.length / 5) * 5;

export const metadata: Metadata = {
  title: "Connections",
  description:
    `Explore ${INTEGRATION_COUNT}+ integrations and connectors for Personas agents. Connect to Slack, GitHub, AWS, databases, and more.`,
  openGraph: {
    title: "Connections Catalog — Personas",
    description:
      `${INTEGRATION_COUNT}+ integrations and connectors for your AI agents. Slack, GitHub, AWS, databases, and more.`,
    url: `${SITE_URL}/connections`,
  },
  alternates: {
    canonical: `${SITE_URL}/connections`,
  },
};

export default function ConnectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
