import { Activity, ArrowUpRight, Bot, TrendingUp } from "lucide-react";
import Link from "next/link";

import GlowCard from "@/components/GlowCard";

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
  const links = [
    { label: labels.agents, desc: `${personasCount} ${labels.deployed}`, icon: Bot, href: "/dashboard/agents", accent: "cyan" as const },
    { label: labels.observability, desc: labels.metricsHealth, icon: Activity, href: "/dashboard/observability", accent: "emerald" as const },
    { label: labels.usageAnalytics, desc: labels.toolUtilization, icon: TrendingUp, href: "/dashboard/observability", accent: "purple" as const },
    { label: labels.settings, desc: `${workersTotal} ${labels.workers}`, icon: Activity, href: "/dashboard/settings", accent: "amber" as const },
  ];

  return (
    <>
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          <GlowCard accent={link.accent} className="p-4 cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] transition-colors group-hover:bg-white/[0.08]">
                <link.icon className="h-4 w-4 text-muted" />
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
