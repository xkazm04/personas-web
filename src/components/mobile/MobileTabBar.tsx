"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard, ClipboardCheck, Mail, type LucideIcon } from "lucide-react";

import { useReviewStore } from "@/stores/reviewStore";
import { MOCK_UNREAD_MESSAGES } from "@/lib/mock-dashboard-data";
import { useTranslation } from "@/i18n/useTranslation";

const MotionLink = motion.create(Link);

interface Tab {
  key: string;
  href: string;
  icon: LucideIcon;
  label: string;
  badge: number | null;
}

export default function MobileTabBar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const pendingReviews = useReviewStore((s) => s.pendingReviewCount);
  const tapProps = reducedMotion ? undefined : { whileTap: { scale: 0.92 } };

  const tabs: Tab[] = [
    {
      key: "overview",
      href: "/m/overview",
      icon: LayoutDashboard,
      label: t.dashboard.overview,
      badge: null,
    },
    {
      key: "reviews",
      href: "/m/reviews",
      icon: ClipboardCheck,
      label: t.dashboard.reviews,
      badge: pendingReviews > 0 ? pendingReviews : null,
    },
    {
      key: "messages",
      href: "/m/messages",
      icon: Mail,
      label: t.dashboard.messages,
      badge: MOCK_UNREAD_MESSAGES > 0 ? MOCK_UNREAD_MESSAGES : null,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 safe-bottom border-t border-white/[0.06] bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 pb-1 pt-1.5">
        {tabs.map((tab) => {
          // The Alerts subpage is a drill-in from Overview, so it keeps the
          // Overview tab highlighted.
          const active =
            pathname === tab.href ||
            pathname.startsWith(`${tab.href}/`) ||
            (tab.key === "overview" &&
              (pathname === "/m" || pathname.startsWith("/m/alerts")));
          const Icon = tab.icon;

          return (
            <MotionLink
              key={tab.key}
              href={tab.href}
              {...tapProps}
              aria-current={active ? "page" : undefined}
              className="relative flex min-h-[52px] flex-1 flex-col items-center justify-center rounded-2xl px-1 py-1"
            >
              {active && !reducedMotion && (
                <motion.span
                  layoutId="mobileTabActivePill"
                  aria-hidden
                  className="absolute inset-0 rounded-2xl bg-brand-cyan/10 ring-1 ring-inset ring-brand-cyan/20"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span
                className={`relative flex flex-col items-center gap-0.5 transition-colors ${
                  active ? "text-brand-cyan" : "text-muted-dark"
                }`}
              >
                <span className="relative">
                  <Icon
                    className="h-[22px] w-[22px]"
                    strokeWidth={active ? 2.4 : 2}
                  />
                  {tab.badge !== null && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-brand-cyan px-1 text-[10px] font-bold leading-none text-background tabular-nums shadow-[0_0_0_2px_var(--background)]">
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium leading-none">
                  {tab.label}
                </span>
              </span>
            </MotionLink>
          );
        })}
      </div>
    </nav>
  );
}
