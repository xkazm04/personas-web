import { SITE_URL } from "@/lib/seo";
import { CONNECTOR_FEATURE_LINE, SOFTWARE_DESCRIPTION } from "@/lib/public-claims";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Personas",
  url: SITE_URL,
  logo: `${SITE_URL}/imgs/logo-mark.png`,
  description: "Build intelligent AI agents in natural language. Orchestrate them locally or in the cloud.",
  sameAs: [],
};

export const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Personas",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Windows, Linux",
  description: SOFTWARE_DESCRIPTION,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Multi-agent visual pipeline builder",
    "AES-256-GCM encrypted credential vault with OS keyring",
    "Multi-provider AI: Claude and Ollama",
    "Self-healing execution with automatic recovery",
    "Evolutionary prompt optimization (Genome system)",
    CONNECTOR_FEATURE_LINE,
    "6 trigger types: schedule, webhook, clipboard, file watcher, chain, event",
    "Real-time event bus and observability dashboard",
    "Local-first architecture: agents run on your machine",
  ],
};
