"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wifi, WifiOff } from "lucide-react";
import { useNavItems, useNavState } from "./DashboardNavigation";

export default function DesktopSidebar() {
  const navItems = useNavItems();
  const { isConnected, health, getActive, getBadge } = useNavState();
  const router = useRouter();

  const prefetchAdjacent = (index: number) => {
    const current = navItems[index];
    const previous = navItems[index - 1];
    const next = navItems[index + 1];

    if (current) router.prefetch(current.href);
    if (previous) router.prefetch(previous.href);
    if (next) router.prefetch(next.href);
  };

  return (
    <aside className="hidden w-56 flex-shrink-0 border-r border-glass bg-white/[0.02] md:flex md:flex-col">
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-0.5">
          {navItems.map((item, index) => {
            const active = getActive(item);
            const Icon = item.icon;
            const badge = getBadge(item);

            return (
              <Link
                key={item.key}
                href={item.href}
                onMouseEnter={() => prefetchAdjacent(index)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition-all duration-200 ${
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
                    className={`rounded-full px-1.5 py-px text-sm font-medium tabular-nums ${
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
      <div className="border-t border-glass px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
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
