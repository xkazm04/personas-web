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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Get Started with Personas",
  description: "From download to running AI agents in 5 minutes.",
  url: `${SITE_URL}/tour`,
  step: [
    { "@type": "HowToStep", name: "Download & Launch", text: "Download for your platform — no account needed." },
    { "@type": "HowToStep", name: "Create Your First Agent", text: "Describe what you want in natural language." },
    { "@type": "HowToStep", name: "Connect Your Tools", text: "Authenticate with 40+ integrations." },
    { "@type": "HowToStep", name: "Set a Trigger", text: "Schedule, webhook, clipboard, or file watcher." },
    { "@type": "HowToStep", name: "Watch It Execute", text: "Real-time observability and cost tracking." },
    { "@type": "HowToStep", name: "Scale to Pipelines", text: "Chain agents together on a visual canvas." },
  ],
};

export default function TourLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
