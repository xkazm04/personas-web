"use client";

import { useState } from "react";
import Link from "next/link";
import { navItems, useNavState, type NavItem } from "./DashboardNavigation";

export default function MobileBottomNav() {
  const { getActive, getBadge } = useNavState();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-background/95 backdrop-blur-xl md:hidden safe-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.slice(0, 5).map((item) => {
          const active = getActive(item);
          const Icon = item.icon;
          const badge = getBadge(item);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors ${
                active
                  ? "text-brand-cyan"
                  : "text-muted-dark"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="leading-none">{item.label}</span>
              {badge !== null && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-cyan/20 px-1 text-[9px] font-bold text-brand-cyan">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
        <MobileMoreMenu items={navItems.slice(5)} getActive={getActive} />
      </div>
    </nav>
  );
}

function MobileMoreMenu({
  items,
  getActive,
}: {
  items: readonly NavItem[];
  getActive: (item: NavItem) => boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors ${
          items.some(getActive) ? "text-brand-cyan" : "text-muted-dark"
        }`}
      >
        <MoreHorizontalIcon className="h-5 w-5" />
        <span className="leading-none">More</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full right-0 z-50 mb-2 w-48 rounded-xl border border-white/[0.08] bg-[#0a0a0f]/95 backdrop-blur-xl p-1.5 shadow-2xl">
            {items.map((item) => {
              const active = getActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-cyan/8 text-brand-cyan"
                      : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function MoreHorizontalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  );
}
