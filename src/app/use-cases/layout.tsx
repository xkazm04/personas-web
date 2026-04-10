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

export default function UseCasesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
