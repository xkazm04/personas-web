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

const competitors = [
  { name: "Personas", url: SITE_URL, category: "Desktop-first AI agent orchestration" },
  { name: "CrewAI", url: "https://crewai.com", category: "Python AI agent framework" },
  { name: "LangChain", url: "https://langchain.com", category: "LLM application framework" },
  { name: "n8n", url: "https://n8n.io", category: "Workflow automation platform" },
  { name: "AutoGen", url: "https://github.com/microsoft/autogen", category: "Multi-agent conversation framework" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Personas vs CrewAI vs LangChain vs n8n vs AutoGen — AI Agent Platform Comparison",
  description:
    "Feature-by-feature comparison of AI agent platforms covering pricing, security, triggers, observability, and developer experience.",
  url: `${SITE_URL}/compare`,
  about: {
    "@type": "Thing",
    name: "AI Agent Orchestration Platforms",
    description: "Software platforms for building, orchestrating, and deploying AI agents.",
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: competitors.length,
    itemListElement: competitors.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: c.name,
        url: c.url,
        applicationCategory: c.category,
      },
    })),
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
