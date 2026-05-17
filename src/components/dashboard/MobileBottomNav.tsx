"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useNavItems, useNavState, type NavItem } from "./DashboardNavigation";
import { useTranslation } from "@/i18n/useTranslation";

const MotionLink = motion.create(Link);

export default function MobileBottomNav() {
  const navItems = useNavItems();
  const { getActive, getBadge } = useNavState();
  const reducedMotion = useReducedMotion();
  const tapProps = reducedMotion ? undefined : { whileTap: { scale: 0.95 } };

  return (
    // z-50 so the nav buttons sit above the More-menu overlay (z-30) — without
    // this, taps on bottom-nav links while the More menu is open hit the
    // overlay instead, the menu closes silently and the user has to tap twice.
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-glass bg-background/95 backdrop-blur-xl md:hidden safe-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.slice(0, 5).map((item) => {
          const active = getActive(item);
          const Icon = item.icon;
          const badge = getBadge(item);

          return (
            <MotionLink
              key={item.key}
              href={item.href}
              {...tapProps}
              className={`relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "text-brand-cyan"
                  : "text-muted-dark"
              }`}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-brand-cyan"
                />
              )}
              <Icon className="h-5 w-5" />
              <span className="max-w-[3.75rem] truncate leading-none">{item.label}</span>
              {badge !== null && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-cyan/20 px-1 text-sm font-bold text-brand-cyan">
                  {badge}
                </span>
              )}
            </MotionLink>
          );
        })}
        <MobileMoreMenu items={navItems.slice(5)} getActive={getActive} tapProps={tapProps} />
      </div>
    </nav>
  );
}

function MobileMoreMenu({
  items,
  getActive,
  tapProps,
}: {
  items: readonly NavItem[];
  getActive: (item: NavItem) => boolean;
  tapProps: { whileTap: { scale: number } } | undefined;
}) {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ open: false, pathname });
  const open = menuState.pathname === pathname && menuState.open;
  const setOpen = (nextOpen: boolean) => setMenuState({ open: nextOpen, pathname });
  const moreActive = items.some(getActive);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        {...tapProps}
        className={`relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-sm font-medium transition-colors ${
          moreActive ? "text-brand-cyan" : "text-muted-dark"
        }`}
      >
        {moreActive && (
          <span
            aria-hidden
            className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-brand-cyan"
          />
        )}
        <MoreHorizontalIcon className="h-5 w-5" />
        <MoreLabel />
      </motion.button>

      {open && (
        <>
          {/* z-30 — sits below the bottom-nav (z-50) so taps on other nav
              buttons dismiss the menu *and* fire navigation, not just one. */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute bottom-full right-0 z-50 mb-2 w-48 rounded-xl border border-glass-hover bg-background/95 backdrop-blur-xl p-1.5 shadow-2xl">
            {items.map((item) => {
              const active = getActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
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

function MoreLabel() {
  const { t } = useTranslation();
  return <span className="max-w-[3.75rem] truncate leading-none">{t.dashboard.more}</span>;
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
