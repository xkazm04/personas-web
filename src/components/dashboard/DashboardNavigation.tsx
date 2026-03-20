"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  LayoutDashboard,
  Bot,
  Zap,
  Radio,
  ClipboardCheck,
  Terminal,
  Activity,
  BarChart3,
  Brain,
  Settings,
} from "lucide-react";
import { useSystemStore } from "@/stores/systemStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useExecutionStore } from "@/stores/executionStore";
import DesktopSidebar from "./DesktopSidebar";
import MobileBottomNav from "./MobileBottomNav";

export const navItems = [
  { key: "home", label: "Overview", icon: LayoutDashboard, href: "/dashboard/home" },
  { key: "agents", label: "Agents", icon: Bot, href: "/dashboard/agents" },
  { key: "executions", label: "Executions", icon: Zap, href: "/dashboard/executions" },
  { key: "events", label: "Events", icon: Radio, href: "/dashboard/events" },
  { key: "reviews", label: "Reviews", icon: ClipboardCheck, href: "/dashboard/reviews" },
  { key: "playground", label: "Playground", icon: Terminal, href: "/dashboard/playground" },
  { key: "observability", label: "Observability", icon: Activity, href: "/dashboard/observability" },
  { key: "usage", label: "Usage", icon: BarChart3, href: "/dashboard/usage" },
  { key: "knowledge", label: "Knowledge", icon: Brain, href: "/dashboard/knowledge" },
  { key: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
] as const;

export type NavItem = (typeof navItems)[number];

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
