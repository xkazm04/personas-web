import { Bot, ClipboardCheck, Mail, TrendingUp, Zap } from "lucide-react";

import StatBadge from "@/components/dashboard/StatBadge";

export function DashboardStatsBadges({
  labels,
  stats,
  pendingReviewCount,
  unreadMessages,
}: {
  labels: {
    pendingReviews: string;
    totalExecutions: string;
    successRate: string;
    activeAgents: string;
    unreadMessages: string;
  };
  stats: { total: number; successRate: number; activeAgents: number };
  pendingReviewCount: number;
  unreadMessages: number;
}) {
  return (
    <>
      <StatBadge
        icon={ClipboardCheck}
        label={labels.pendingReviews}
        value={pendingReviewCount}
        accent="amber"
        href="/dashboard/reviews"
        pulseOnIncrease
      />
      <StatBadge icon={Zap} label={labels.totalExecutions} value={stats.total} accent="cyan" href="/dashboard/executions" pulseOnIncrease />
      <StatBadge icon={TrendingUp} label={labels.successRate} value={`${stats.successRate}%`} accent="emerald" href="/dashboard/observability" />
      <StatBadge icon={Bot} label={labels.activeAgents} value={stats.activeAgents} accent="purple" href="/dashboard/agents" />
      <StatBadge icon={Mail} label={labels.unreadMessages} value={unreadMessages} accent="rose" href="/dashboard/messages" pulseOnIncrease />
    </>
  );
}
