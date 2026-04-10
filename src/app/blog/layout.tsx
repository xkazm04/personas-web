import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Product updates, tutorials, and engineering deep-dives from the Personas team. Learn how to build and orchestrate AI agent pipelines.",
  openGraph: {
    title: "Blog — Personas",
    description:
      "Product updates, tutorials, and engineering deep-dives on AI agent orchestration.",
    url: `${SITE_URL}/blog`,
  },
  alternates: { canonical: `${SITE_URL}/blog` },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Personas Blog",
  description: "Product updates, tutorials, and engineering deep-dives on AI agent orchestration.",
  url: `${SITE_URL}/blog`,
  publisher: { "@type": "Organization", name: "Personas", url: SITE_URL },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
