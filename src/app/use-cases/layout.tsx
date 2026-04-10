import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Use Cases",
  description:
    "Discover how teams use Personas for development automation, content pipelines, research, DevOps, and customer communication. Real workflow examples with agent configurations.",
  openGraph: {
    title: "Use Cases — Personas",
    description:
      "Real workflow examples: development, content, research, DevOps, and communication automation with AI agents.",
    url: `${SITE_URL}/use-cases`,
  },
  alternates: { canonical: `${SITE_URL}/use-cases` },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Use Cases — Personas",
  description: "How teams use Personas for development, content, research, DevOps, and communication automation.",
  url: `${SITE_URL}/use-cases`,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Development Automation", url: `${SITE_URL}/use-cases/development` },
      { "@type": "ListItem", position: 2, name: "Content Pipelines", url: `${SITE_URL}/use-cases/content` },
      { "@type": "ListItem", position: 3, name: "Research & Analysis", url: `${SITE_URL}/use-cases/research` },
      { "@type": "ListItem", position: 4, name: "DevOps Integration", url: `${SITE_URL}/use-cases/devops` },
      { "@type": "ListItem", position: 5, name: "Customer Communication", url: `${SITE_URL}/use-cases/communication` },
    ],
  },
};

export default function UseCasesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
