"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  LayoutDashboard,
  Bot,
  Zap,
  Radio,
  ClipboardCheck,
  Activity,
  BarChart3,
  Brain,
  Settings,
  Mail,
  Shield,
  Trophy,
  Heart,
} from "lucide-react";
import { useSystemStore } from "@/stores/systemStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useExecutionStore } from "@/stores/executionStore";
import { MOCK_UNREAD_MESSAGES } from "@/lib/mock-dashboard-data";
import DesktopSidebar from "./DesktopSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { useTranslation } from "@/i18n/useTranslation";

export const navItemDefs = [
  { key: "home", labelKey: "overview" as const, icon: LayoutDashboard, href: "/dashboard/home" },
  { key: "agents", labelKey: "agents" as const, icon: Bot, href: "/dashboard/agents" },
  { key: "executions", labelKey: "executions" as const, icon: Zap, href: "/dashboard/executions" },
  { key: "events", labelKey: "events" as const, icon: Radio, href: "/dashboard/events" },
  { key: "reviews", labelKey: "reviews" as const, icon: ClipboardCheck, href: "/dashboard/reviews" },
  { key: "messages", labelKey: "messages" as const, icon: Mail, href: "/dashboard/messages" },
  { key: "observability", labelKey: "observability" as const, icon: Activity, href: "/dashboard/observability" },
  { key: "health", labelKey: "health" as const, icon: Heart, href: "/dashboard/health" },
  { key: "leaderboard", labelKey: "leaderboard" as const, icon: Trophy, href: "/dashboard/leaderboard" },
  { key: "sla", labelKey: "sla" as const, icon: Shield, href: "/dashboard/sla" },
  { key: "usage", labelKey: "usage" as const, icon: BarChart3, href: "/dashboard/usage" },
  { key: "knowledge", labelKey: "knowledge" as const, icon: Brain, href: "/dashboard/knowledge" },
  { key: "memories", labelKey: "memories" as const, icon: Brain, href: "/dashboard/memories" },
  { key: "settings", labelKey: "settings" as const, icon: Settings, href: "/dashboard/settings" },
] as const;

export type NavItemDef = (typeof navItemDefs)[number];
export type NavItem = NavItemDef & { label: string };

export function useNavItems(): NavItem[] {
  const { t } = useTranslation();
  return navItemDefs.map((item) => ({
    ...item,
    label: t.dashboard[item.labelKey],
  }));
}

export function useNavState() {
  const pathname = usePathname();
  const health = useSystemStore((s) => s.health);
  const pendingReviewCount = useReviewStore((s) => s.pendingReviewCount);
  const rawExecutions = useExecutionStore((s) => s.rawExecutions);

  const runningCount = useMemo(
    () => rawExecutions.filter((e) => e.status === "running").length,
    [rawExecutions],
  );

  const isConnected = health?.status === "ok";

  const getActive = (item: NavItem) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/dashboard/home" && pathname.startsWith(item.href));
    const isHomeActive =
      item.key === "home" &&
      (pathname === "/dashboard" || pathname === "/dashboard/home");
    return isActive || isHomeActive;
  };

  const getBadge = (item: NavItem) => {
    if (item.key === "reviews" && pendingReviewCount > 0) return pendingReviewCount;
    if (item.key === "executions" && runningCount > 0) return runningCount;
    if (item.key === "messages" && MOCK_UNREAD_MESSAGES > 0) return MOCK_UNREAD_MESSAGES;
    return null;
  };

  return { isConnected, health, getActive, getBadge };
}

export default function DashboardNavigation() {
  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
}
