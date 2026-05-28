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
  const tapProps = reducedMotion ? undefined : { whileTap: { scale: 0.94 } };

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
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-glass bg-background/95 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1">
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
              className={`relative flex min-h-[48px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-sm font-medium transition-colors ${
                active ? "text-brand-cyan" : "text-muted-dark"
              }`}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-brand-cyan"
                />
              )}
              <Icon className="h-5 w-5" />
              <span className="leading-none">{tab.label}</span>
              {tab.badge !== null && (
                <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-cyan/20 px-1 text-sm font-bold text-brand-cyan tabular-nums">
                  {tab.badge}
                </span>
              )}
            </MotionLink>
          );
        })}
      </div>
    </nav>
  );
}
