import type { ComponentType } from "react";
import type { StageColor } from "@/lib/colors";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Footer from "@/components/sections/Footer";
import {
  LazyDownloadCTA,
  LazyFAQ,
  LazyMidPageCTA,
  LazyPipelineShowcase,
  LazyPricing,
  LazyUseCases,
  LazyVision,
  LazyPlaygroundSplit,
  LazyGetStarted,
} from "@/components/sections/lazy";
import StageSection from "@/components/StageSection";
import SectionDivider from "@/components/SectionDivider";
import PageShell from "@/components/PageShell";
import { SCROLL_MAP_SECTIONS } from "@/lib/constants";
import { SectionObserverProvider } from "@/contexts/SectionObserverContext";

const scrollMapItems = SCROLL_MAP_SECTIONS.map((s) => ({
  label: s.label.toUpperCase(),
  href: `#${s.id}`,
}));

const sectionIds = scrollMapItems.map((item) => item.href.replace("#", ""));

/* ── JSON-LD structured data for SEO ──────────────────────────────── */

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Personas",
  url: "https://personas.ai",
  logo: "https://personas.ai/imgs/logo.png",
  description:
    "Build intelligent AI agents in natural language. Orchestrate them locally or in the cloud.",
  sameAs: [],
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Personas",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Windows, Linux",
  description:
    "Build and orchestrate multi-agent AI pipelines locally or in the cloud. Multi-provider AI, AES-256 encrypted credential vault, self-healing execution, and 40+ integrations — no code required.",
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
  { Component: LazyUseCases,           glow: "emerald", fromColor: "cyan",    toColor: "emerald", dividerFrom: "cyan",    dividerTo: "emerald" },
  { Component: LazyPlaygroundSplit,    glow: "cyan",    fromColor: "emerald", toColor: "cyan",    dividerFrom: "emerald", dividerTo: "cyan" },
  { Component: LazyGetStarted,         glow: "emerald", fromColor: "cyan",    toColor: "emerald", dividerFrom: "cyan",    dividerTo: "emerald", wrapperId: "get-started" },
  { Component: LazyPipelineShowcase,   glow: "cyan",    fromColor: "emerald", toColor: "cyan",    dividerFrom: "emerald", dividerTo: "cyan",    wrapperId: "pipelines" },
  { Component: LazyVision,            glow: "purple",  fromColor: "cyan",    toColor: "purple",  dividerFrom: "cyan",    dividerTo: "purple", wrapperId: "vision" },
  { Component: LazyPricing,           glow: "purple",  fromColor: "purple",  toColor: "purple",  dividerFrom: "purple",  dividerTo: "purple", wrapperId: "pricing" },
  { Component: LazyFAQ,               glow: "cyan",    fromColor: "purple",  toColor: "cyan",    dividerFrom: "purple",  dividerTo: "cyan" },
  { Component: LazyDownloadCTA,        glow: "cyan",    fromColor: "cyan",                        dividerFrom: "cyan",    dividerTo: "cyan" },
];

export default function Home() {
  return (
    <SectionObserverProvider sectionIds={sectionIds}>
      {/* Decorative cinematic illustration — top-left ambient layer */}
      <div className="pointer-events-none absolute top-0 left-0 z-0 w-[560px] h-[420px] md:w-[720px] md:h-[540px]">
        <Image
          src="/imgs/illustration_cyber_cinematic.png"
          alt=""
          width={720}
          height={540}
          className="h-full w-full object-cover opacity-[0.98] mix-blend-lighten"
          style={{
            maskImage: "radial-gradient(ellipse 90% 85% at 15% 25%, black 0%, rgba(0,0,0,0.5) 35%, transparent 65%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 85% at 15% 25%, black 0%, rgba(0,0,0,0.5) 35%, transparent 65%)",
          }}
          priority
          aria-hidden="true"
        />
      </div>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
      </PageShell>
      <Footer />
    </SectionObserverProvider>
  );
}
