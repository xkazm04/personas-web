import { SITE_URL } from "@/lib/seo";
import { en } from "@/i18n/en";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Personas",
  url: SITE_URL,
  logo: `${SITE_URL}/imgs/logo.png`,
  description: "Build intelligent AI agents in natural language. Orchestrate them locally or in the cloud.",
  sameAs: [],
};

export const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Personas",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Windows, Linux",
  description:
    "Build and orchestrate multi-agent AI pipelines locally or in the cloud. Multi-provider AI, AES-256 encrypted credential vault, self-healing execution, and 40+ integrations - no code required.",
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
    "40+ built-in integrations (Slack, GitHub, Jira, Notion, etc.)",
    "6 trigger types: schedule, webhook, clipboard, file watcher, chain, event",
    "Real-time event bus and observability dashboard",
    "Local-first architecture with optional cloud deployment",
  ],
};

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  /**
   * Derived from the same `faqSection.questions` the visible FAQ renders
   * (`src/components/sections/FAQ.tsx` -> `t.faqSection.questions`), so the
   * two can no longer drift - the hand-copied version here had already gone
   * stale against several answers. The `en` locale is read directly because
   * structured data is crawled at the canonical (English) URL and must be a
   * plain server-side constant, while the rendered FAQ keeps translating
   * through `useTranslation()` across all 14 locales.
   */
  mainEntity: en.faqSection.questions.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: {
      "@type": "Answer",
      text: a,
    },
  })),
};
