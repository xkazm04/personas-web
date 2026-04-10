import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Connections",
  description:
    "Explore 50+ integrations and connectors for Personas agents. Connect to Slack, GitHub, AWS, databases, and more.",
  openGraph: {
    title: "Connections Catalog — Personas",
    description:
      "50+ integrations and connectors for your AI agents. Slack, GitHub, AWS, databases, and more.",
    url: `${SITE_URL}/connections`,
  },
  alternates: {
    canonical: `${SITE_URL}/connections`,
  },
};

export default function ConnectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
