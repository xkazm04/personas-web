export type PricingAccent = "cyan" | "purple" | "amber";

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  accent: PricingAccent;
  cta: string;
  bestFor: string;
  capacity: number;
  features: string[];
  highlighted?: boolean;
  comingSoon?: boolean;
  href?: string;
  ctaStyle: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Local",
    price: "$0",
    period: "forever",
    accent: "cyan",
    cta: "Download Local",
    href: "#download",
    bestFor: "Solo builders getting started",
    capacity: 10,
    ctaStyle:
      "border border-white/[0.08] text-muted hover:border-white/[0.15] hover:text-foreground hover:bg-white/[0.02]",
    features: [
      "Unlimited local agents",
      "Local event bus & scheduler",
      "Full observability dashboard",
      "Design engine",
      "Team canvas (local)",
    ],
  },
  {
    name: "Cloud",
    price: "$29",
    period: "/mo",
    accent: "purple",
    highlighted: true,
    cta: "Go Cloud",
    href: "/dashboard",
    bestFor: "Fast-moving individual teams",
    capacity: 65,
    ctaStyle:
      "bg-brand-purple text-white hover:bg-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.15)]",
    features: [
      "Everything in Free",
      "3 cloud workers",
      "1,000 executions/mo",
      "10,000 events/mo",
      "Burst auto-scaling",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    accent: "amber",
    cta: "Contact Sales",
    comingSoon: true,
    bestFor: "Organizations with compliance & scale needs",
    capacity: 100,
    ctaStyle:
      "border border-brand-amber/25 text-brand-amber hover:bg-brand-amber/10 shadow-[0_0_25px_rgba(251,191,36,0.08)]",
    features: [
      "Everything in Pro",
      "SSO via SAML & OIDC",
      "Multi-tenant workspaces with RBAC",
      "Execution audit trail export",
      "Dedicated cloud workers & SLA",
      "Priority support",
    ],
  },
];

export interface ComparisonFeature {
  label: string;
  free: boolean;
  pro: boolean;
  enterprise: boolean;
}

export const COMPARISON_FEATURES: ComparisonFeature[] = [
  { label: "Unlimited local agents", free: true, pro: true, enterprise: true },
  { label: "Local event bus & scheduler", free: true, pro: true, enterprise: true },
  { label: "Full observability dashboard", free: true, pro: true, enterprise: true },
  { label: "Design engine", free: true, pro: true, enterprise: true },
  { label: "Team canvas (local)", free: true, pro: true, enterprise: true },
  { label: "3 cloud workers", free: false, pro: true, enterprise: true },
  { label: "1,000 executions/mo", free: false, pro: true, enterprise: true },
  { label: "10,000 events/mo", free: false, pro: true, enterprise: true },
  { label: "Burst auto-scaling", free: false, pro: true, enterprise: true },
  { label: "SSO via SAML & OIDC", free: false, pro: false, enterprise: true },
  { label: "Multi-tenant workspaces with RBAC", free: false, pro: false, enterprise: true },
  { label: "Execution audit trail export", free: false, pro: false, enterprise: true },
  { label: "Dedicated cloud workers & SLA", free: false, pro: false, enterprise: true },
  { label: "Priority support", free: false, pro: false, enterprise: true },
];

export interface TierColumn {
  key: "free" | "pro" | "enterprise";
  name: string;
  price: string;
  period: string;
  accent: string;
}

export const TIER_COLUMNS: TierColumn[] = [
  { key: "free", name: "Local", price: "$0", period: "forever", accent: "text-brand-cyan" },
  { key: "pro", name: "Cloud", price: "$29", period: "/mo", accent: "text-brand-purple" },
  { key: "enterprise", name: "Enterprise", price: "Custom", period: "", accent: "text-brand-amber" },
];
