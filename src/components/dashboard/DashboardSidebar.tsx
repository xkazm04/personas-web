"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  Zap,
  Radio,
  ClipboardCheck,
  Settings,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useDashboardStore } from "@/stores/dashboardStore";

const navItems = [
  { key: "agents", label: "Agents", icon: Bot, href: "/dashboard/agents" },
  { key: "executions", label: "Executions", icon: Zap, href: "/dashboard/executions" },
  { key: "events", label: "Events", icon: Radio, href: "/dashboard/events" },
  { key: "reviews", label: "Reviews", icon: ClipboardCheck, href: "/dashboard/reviews" },
  { key: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
] as const;

export default function DashboardSidebar() {
  const pathname = usePathname();
  const health = useDashboardStore((s) => s.health);
  const pendingReviewCount = useDashboardStore((s) => s.pendingReviewCount);
  const runningCount = useDashboardStore((s) =>
    s.executions.filter((e) => e.status === "running").length,
  );

  const isConnected = health?.status === "ok";

  return (
    <aside className="hidden w-56 flex-shrink-0 border-r border-white/[0.06] bg-white/[0.02] md:flex md:flex-col">
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/agents" &&
                pathname.startsWith(item.href));
            // Default to agents for /dashboard
            const isAgentsActive =
              item.key === "agents" &&
              (pathname === "/dashboard" || pathname === "/dashboard/agents");
            const active = isActive || isAgentsActive;

            const Icon = item.icon;
            const badge =
              item.key === "reviews" && pendingReviewCount > 0
                ? pendingReviewCount
                : item.key === "executions" && runningCount > 0
                  ? runningCount
                  : null;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-brand-cyan/8 text-brand-cyan border-l-2 border-brand-cyan -ml-px"
                    : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <Icon
                  className={`h-4 w-4 flex-shrink-0 ${
                    active ? "text-brand-cyan" : "text-muted-dark group-hover:text-muted"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {badge !== null && (
                  <span
                    className={`rounded-full px-1.5 py-px text-[10px] font-medium tabular-nums ${
                      active
                        ? "bg-brand-cyan/20 text-brand-cyan"
                        : "bg-white/[0.08] text-muted-dark"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Connection status */}
      <div className="border-t border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2 text-[11px]">
          {isConnected ? (
            <>
              <div className="relative flex h-3 w-3 items-center justify-center">
                <Wifi className="absolute h-3 w-3 text-emerald-400" />
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40"></span>
              </div>
              <span className="text-emerald-400">Connected</span>
              {health?.workers && (
                <span className="ml-auto text-muted-dark tabular-nums">
                  {health.workers.total}w
                </span>
              )}
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-red-400" />
              <span className="text-red-400">Disconnected</span>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
