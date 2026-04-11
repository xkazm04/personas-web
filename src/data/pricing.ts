/* ── Tier + comparison data ───────────────────────────────────────── */

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
    cta: "Download Free",
    href: "/#download",
    bestFor: "Solo builders getting started",
    capacity: 10,
    ctaStyle:
      "border border-white/[0.08] text-muted hover:border-white/[0.15] hover:text-foreground hover:bg-white/[0.02]",
    features: [
      "Unlimited local agents",
      "Local event bus & scheduler",
      "Full observability dashboard",
      "Design engine & testing lab",
      "Team canvas (local)",
    ],
  },
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    accent: "cyan",
    cta: "Get Started",
    bestFor: "Individuals running agents 24/7",
    capacity: 30,
    comingSoon: true,
    ctaStyle:
      "border border-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/10",
    features: [
      "Everything in Local",
      "1 cloud worker (always-on)",
      "500 cloud executions/month",
      "Webhook & event bridging",
      "Email notifications",
    ],
  },
  {
    name: "Team",
    price: "$29",
    period: "/month per seat",
    accent: "purple",
    cta: "Start Team Trial",
    bestFor: "Teams sharing agents & pipelines",
    capacity: 60,
    highlighted: true,
    comingSoon: true,
    ctaStyle:
      "bg-brand-purple text-white hover:bg-brand-purple/90",
    features: [
      "Everything in Starter",
      "3 cloud workers",
      "Unlimited cloud executions",
      "Shared agent library",
      "Team pipelines & roles",
      "Priority support",
    ],
  },
  {
    name: "Builder",
    price: "Custom",
    period: "",
    accent: "amber",
    cta: "Contact Sales",
    bestFor: "Orgs with custom infrastructure needs",
    capacity: 100,
    comingSoon: true,
    ctaStyle:
      "border border-amber-400/20 text-amber-400 hover:bg-amber-400/10",
    features: [
      "Everything in Team",
      "Unlimited workers (BYOI)",
      "Genome evolution engine",
      "SSO & audit logs",
      "Dedicated support & SLA",
      "Custom model endpoints",
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
  { label: "Observability dashboard", free: true, pro: true, enterprise: true },
  { label: "Design engine & testing lab", free: true, pro: true, enterprise: true },
  { label: "Team canvas (local)", free: true, pro: true, enterprise: true },
  { label: "Cloud workers (always-on)", free: false, pro: true, enterprise: true },
  { label: "Webhook & event bridging", free: false, pro: true, enterprise: true },
  { label: "Shared agent library", free: false, pro: false, enterprise: true },
  { label: "Team pipelines & roles", free: false, pro: false, enterprise: true },
  { label: "Genome evolution engine", free: false, pro: false, enterprise: true },
  { label: "BYOI (Bring Your Own Infra)", free: false, pro: false, enterprise: true },
  { label: "SSO & audit logs", free: false, pro: false, enterprise: true },
  { label: "Priority / dedicated support", free: false, pro: true, enterprise: true },
];

export interface TierColumn {
  key: "free" | "pro" | "enterprise";
  name: string;
  price: string;
  period: string;
  accent: string;
}

export const TIER_COLUMNS: TierColumn[] = [
  { key: "free", name: "Local", price: "$0", period: "forever", accent: "#06b6d4" },
  { key: "pro", name: "Team", price: "$29", period: "/mo per seat", accent: "#a855f7" },
  { key: "enterprise", name: "Builder", price: "Custom", period: "", accent: "#fbbf24" },
];
