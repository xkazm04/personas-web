/* ── Social proof / testimonial data ────────────────────────────────── */

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  color: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We replaced 3 Zapier workflows and a custom Python script with 2 Personas agents. They self-heal when APIs go down — we haven't touched them in 6 weeks.",
    name: "Marcus Chen",
    role: "Platform Engineer",
    company: "Series B SaaS",
    color: "#06b6d4",
  },
  {
    quote:
      "The credential vault is what sold me. My API keys stay in my OS keyring, not on some vendor's cloud. For a fintech company, that's non-negotiable.",
    name: "Priya Sharma",
    role: "Security Lead",
    company: "Fintech Startup",
    color: "#34d399",
  },
  {
    quote:
      "I went from 'what is an AI agent' to running a 4-agent content pipeline in one afternoon. The natural language creation is absurdly good.",
    name: "Alex Rivera",
    role: "Content Director",
    company: "Digital Agency",
    color: "#a855f7",
  },
  {
    quote:
      "The cost tracking alone saves us $200/month. We can see exactly which agent uses which model and how many tokens. No more surprise bills.",
    name: "Tomoko Nakamura",
    role: "Engineering Manager",
    company: "AI Consultancy",
    color: "#fbbf24",
  },
  {
    quote:
      "We run Personas on an air-gapped network with Ollama. Zero internet, zero telemetry, full agent orchestration. Nothing else can do this.",
    name: "David Kowalski",
    role: "DevOps Architect",
    company: "Defense Contractor",
    color: "#f43f5e",
  },
  {
    quote:
      "The pipeline canvas is like Figma for AI workflows. Drag agents, connect outputs to inputs, hit run. My non-technical PM builds her own agents now.",
    name: "Sarah Okonkwo",
    role: "CTO",
    company: "Automation Studio",
    color: "#06b6d4",
  },
];

export interface UsageStat {
  value: string;
  label: string;
  color: string;
}

export const USAGE_STATS: UsageStat[] = [
  { value: "40+", label: "Built-in connectors", color: "#06b6d4" },
  { value: "6", label: "Trigger types", color: "#a855f7" },
  { value: "4", label: "AI providers supported", color: "#34d399" },
  { value: "0", label: "Telemetry collected", color: "#fbbf24" },
];

export interface TrustBadge {
  label: string;
  description: string;
  color: string;
}

export const TRUST_BADGES: TrustBadge[] = [
  { label: "AES-256", description: "Encryption at rest", color: "#34d399" },
  { label: "Zero telemetry", description: "No data collected", color: "#a855f7" },
  { label: "Air-gap ready", description: "Works offline", color: "#fbbf24" },
  { label: "OS keyring", description: "Native credential storage", color: "#06b6d4" },
  { label: "Free forever", description: "No orchestration markup", color: "#f43f5e" },
  { label: "Open source", description: "Verify everything", color: "#34d399" },
];
