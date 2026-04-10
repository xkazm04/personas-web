import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Product Tour",
  description:
    "See Personas in action. Step-by-step walkthrough: download, create agents, connect tools, set triggers, and build multi-agent pipelines — all on your desktop.",
  openGraph: {
    title: "Product Tour — Personas",
    description:
      "From download to running agents in 5 minutes. Interactive walkthrough of Personas desktop AI agent orchestration.",
    url: `${SITE_URL}/tour`,
  },
  alternates: { canonical: `${SITE_URL}/tour` },
};

export default function TourLayout({ children }: { children: React.ReactNode }) {
  return children;
}
