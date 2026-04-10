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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Personas vs CrewAI vs LangChain vs n8n vs AutoGen",
  description: "Feature-by-feature comparison of AI agent platforms.",
  url: `${SITE_URL}/compare`,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Personas", url: SITE_URL },
      { "@type": "ListItem", position: 2, name: "CrewAI", url: "https://crewai.com" },
      { "@type": "ListItem", position: 3, name: "LangChain", url: "https://langchain.com" },
      { "@type": "ListItem", position: 4, name: "n8n", url: "https://n8n.io" },
      { "@type": "ListItem", position: 5, name: "AutoGen", url: "https://github.com/microsoft/autogen" },
    ],
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
