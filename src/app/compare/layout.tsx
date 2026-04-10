import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "See how Personas compares to CrewAI, LangChain, n8n, and AutoGen. Feature-by-feature comparison of AI agent platforms — pricing, security, triggers, observability, and more.",
  openGraph: {
    title: "Personas vs CrewAI vs LangChain vs n8n vs AutoGen — Feature Comparison",
    description:
      "Desktop-first AI agent orchestration, free forever. Compare features, pricing, and capabilities side by side.",
    url: `${SITE_URL}/compare`,
  },
  alternates: {
    canonical: `${SITE_URL}/compare`,
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
