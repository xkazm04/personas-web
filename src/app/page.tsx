import type { ComponentType } from "react";
import type { StageColor } from "@/lib/colors";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Footer from "@/components/sections/Footer";
import {
  LazyChangelog,
  LazyDownloadCTA,
  LazyFAQ,
  LazyMidPageCTA,
  LazyPricing,
  LazyUseCases,
  LazyVision,
  LazyPlaygroundSplit,
} from "@/components/sections/lazy";
import StageSection from "@/components/StageSection";
import SectionDivider from "@/components/SectionDivider";
import PageShell from "@/components/PageShell";
import { SCROLL_MAP_SECTIONS } from "@/lib/constants";
import { PRICING_TIERS } from "@/data/pricing";
import { SectionObserverProvider } from "@/contexts/SectionObserverContext";

const scrollMapItems = SCROLL_MAP_SECTIONS.map((s) => ({
  label: s.label.toUpperCase(),
  href: `#${s.id}`,
}));

const sectionIds = scrollMapItems.map((item) => item.href.replace("#", ""));

/* ── JSON-LD structured data for SEO ──────────────────────────────── */

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Claude CLI and why do I need it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Claude CLI is Anthropic's official command-line interface for interacting with Claude. Personas uses it under the hood to run your agents locally — it handles authentication, model access, and streaming responses. You'll need an active Claude Pro or Max subscription and the CLI installed before launching Personas.",
      },
    },
    {
      "@type": "Question",
      name: "Does Personas collect any telemetry or usage data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Personas runs entirely on your machine with zero telemetry. We don't collect analytics, usage metrics, or any personal data. Your prompts, agent configurations, and execution logs never leave your device unless you explicitly enable cloud execution.",
      },
    },
    {
      "@type": "Question",
      name: "How does the pricing model work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The desktop app is free forever with unlimited local agents. Cloud plans (Starter, Pro, Team) add 24/7 execution, remote workers, and team features on top. You always need your own Claude subscription — we never touch your Anthropic bill.",
      },
    },
    {
      "@type": "Question",
      name: "What is Bring Your Own Infrastructure (BYOI)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BYOI lets you connect your own cloud provider credentials instead of using our managed infrastructure. Personas provisions and manages the workers on your account, giving you unlimited execution without per-month caps.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between local and cloud execution?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Local execution runs agents on your machine using Claude CLI — it's instant, free, and private, but stops when your computer sleeps. Cloud execution runs agents on remote workers 24/7, supports event-bus bridging across environments, and enables team collaboration.",
      },
    },
    {
      "@type": "Question",
      name: "Are there any limits on the number of agents?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Locally, there are no limits — create as many agents as you want. Cloud plans have worker limits (1–5 depending on tier) and monthly execution caps. Pro and Team plans include burst auto-scaling for traffic spikes. BYOI removes all caps entirely.",
      },
    },
  ],
};

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: PRICING_TIERS.map((tier, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: `Personas ${tier.name}`,
        description: tier.bestFor,
        offers: {
          "@type": "Offer",
          price: tier.price === "Custom" ? undefined : tier.price.replace("$", ""),
          priceCurrency: tier.price === "Custom" ? undefined : "USD",
          ...(tier.price === "Custom" ? { priceSpecification: { "@type": "PriceSpecification", name: "Custom pricing" } } : {}),
        },
      },
    })),
  },
};

interface SectionConfig {
  Component: ComponentType;
  glow: "cyan" | "purple" | "emerald";
  fromColor: StageColor;
  toColor?: StageColor;
  dividerFrom: StageColor;
  dividerTo: StageColor;
  wrapperId?: string;
}

const sections: SectionConfig[] = [
  { Component: LazyUseCases,        glow: "emerald", fromColor: "cyan",    toColor: "emerald", dividerFrom: "cyan",    dividerTo: "emerald" },
  { Component: LazyPlaygroundSplit, glow: "cyan",    fromColor: "emerald", toColor: "cyan",    dividerFrom: "emerald", dividerTo: "cyan" },
  { Component: LazyVision,         glow: "purple",  fromColor: "cyan",    toColor: "purple",  dividerFrom: "cyan",    dividerTo: "purple", wrapperId: "vision" },
  { Component: LazyPricing,        glow: "purple",  fromColor: "purple",  toColor: "purple",  dividerFrom: "purple",  dividerTo: "purple" },
  { Component: LazyFAQ,            glow: "cyan",    fromColor: "purple",  toColor: "cyan",    dividerFrom: "purple",  dividerTo: "cyan" },
  { Component: LazyDownloadCTA,    glow: "cyan",    fromColor: "cyan",                        dividerFrom: "cyan",    dividerTo: "cyan" },
];

export default function Home() {
  return (
    <SectionObserverProvider sectionIds={sectionIds}>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <PageShell scrollMapItems={scrollMapItems}>

        <div id="hero">
          <Hero />
        </div>

        {sections.map(({ Component, glow, fromColor, toColor, dividerFrom, dividerTo, wrapperId }, i) => {
          const stage = (
            <StageSection key={i} glow={glow} fromColor={fromColor} toColor={toColor}>
              <Component />
            </StageSection>
          );

          return (
            <div key={i}>
              <SectionDivider from={dividerFrom} to={dividerTo} />
              {wrapperId ? <div id={wrapperId}>{stage}</div> : stage}
            </div>
          );
        })}

        <LazyMidPageCTA />
        <LazyChangelog />
      </PageShell>
      <Footer />
    </SectionObserverProvider>
  );
}
