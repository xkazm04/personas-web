export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Personas",
  url: "https://personas.ai",
  logo: "https://personas.ai/imgs/logo.png",
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
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Claude CLI and why do I need it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Claude CLI is Anthropic's official command-line interface for interacting with Claude. Personas uses it under the hood to run your agents locally - it handles authentication, model access, and streaming responses. You'll need an active Claude Pro or Max subscription and the CLI installed before launching Personas.",
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
        text: "The desktop app is free forever with unlimited local agents. Cloud plans (Starter, Pro, Team) add 24/7 execution, remote workers, and team features on top. You always need your own Claude subscription - we never touch your Anthropic bill.",
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
        text: "Local execution runs agents on your machine using Claude CLI - it's instant, free, and private, but stops when your computer sleeps. Cloud execution runs agents on remote workers 24/7, supports event-bus bridging across environments, and enables team collaboration.",
      },
    },
    {
      "@type": "Question",
      name: "Are there any limits on the number of agents?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Locally, there are no limits - create as many agents as you want. Cloud plans have worker limits (1-5 depending on tier) and monthly execution caps. Pro and Team plans include burst auto-scaling for traffic spikes. BYOI removes all caps entirely.",
      },
    },
  ],
};
