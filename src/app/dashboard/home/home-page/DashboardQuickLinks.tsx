import { Activity, ArrowUpRight, Bot, TrendingUp } from "lucide-react";
import Link from "next/link";

import GlowCard from "@/components/GlowCard";

type Accent = "cyan" | "emerald" | "purple" | "amber";

// Each tile's accent maps to a thin colored left rail so the four
// destinations are scannable at a glance — currently the only color
// cue is the faint GlowCard hover glow.
const railClass: Record<Accent, string> = {
  cyan: "bg-cyan-400/70",
  emerald: "bg-emerald-400/70",
  purple: "bg-purple-400/70",
  amber: "bg-amber-400/70",
};

const iconTintClass: Record<Accent, string> = {
  cyan: "text-cyan-400",
  emerald: "text-emerald-400",
  purple: "text-purple-400",
  amber: "text-amber-400",
};

export function DashboardQuickLinks({
  labels,
  personasCount,
  workersTotal,
}: {
  labels: {
    agents: string;
    deployed: string;
    observability: string;
    metricsHealth: string;
    usageAnalytics: string;
    toolUtilization: string;
    settings: string;
    workers: string;
  };
  personasCount: number;
  workersTotal: number;
}) {
  const links: Array<{
    label: string;
    desc: string;
    icon: typeof Bot;
    href: string;
    accent: Accent;
  }> = [
    { label: labels.agents, desc: `${personasCount} ${labels.deployed}`, icon: Bot, href: "/dashboard/agents", accent: "cyan" },
    { label: labels.observability, desc: labels.metricsHealth, icon: Activity, href: "/dashboard/observability", accent: "emerald" },
    { label: labels.usageAnalytics, desc: labels.toolUtilization, icon: TrendingUp, href: "/dashboard/observability", accent: "purple" },
    { label: labels.settings, desc: `${workersTotal} ${labels.workers}`, icon: Activity, href: "/dashboard/settings", accent: "amber" },
  ];

  return (
    <>
      {links.map((link) => (
        <Link key={`${link.href}-${link.label}`} href={link.href}>
          <GlowCard accent={link.accent} className="relative overflow-hidden p-4 cursor-pointer group">
            <span aria-hidden className={`absolute inset-y-2 left-0 w-[3px] rounded-r ${railClass[link.accent]}`} />
            <div className="flex items-center gap-3 pl-1.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] transition-colors group-hover:bg-white/[0.08]">
                <link.icon className={`h-4 w-4 ${iconTintClass[link.accent]}`} />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">
                  {link.label}
                </p>
                <p className="text-sm text-muted-dark">{link.desc}</p>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 text-muted-dark opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </GlowCard>
        </Link>
      ))}
    </>
  );
}
