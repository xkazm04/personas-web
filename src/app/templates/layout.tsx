import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Agent Templates",
  description:
    "Browse ready-made AI agent templates for DevOps, data pipelines, monitoring, and more. Each one is a reference configuration you set up in the Personas desktop app.",
  openGraph: {
    title: "Agent Template Gallery — Personas",
    description:
      "Ready-made AI agent templates. Read the config, then set it up in the Personas desktop app.",
    url: `${SITE_URL}/templates`,
  },
  alternates: {
    canonical: `${SITE_URL}/templates`,
  },
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
