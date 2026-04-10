import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Agent Templates",
  description:
    "Browse ready-made AI agent templates for DevOps, data pipelines, monitoring, and more. Copy a config and start automating in seconds.",
  openGraph: {
    title: "Agent Template Gallery — Personas",
    description:
      "Ready-made AI agent templates. Pick one, copy the config, and start automating.",
    url: `${SITE_URL}/templates`,
  },
  alternates: {
    canonical: `${SITE_URL}/templates`,
  },
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
