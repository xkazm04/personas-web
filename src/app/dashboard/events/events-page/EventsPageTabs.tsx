import { GanttChart, Orbit, Radio, Zap } from "lucide-react";

export type PageTab = "events" | "subscriptions" | "visualization" | "swimlane";

const TAB_ICONS = {
  events: Radio,
  subscriptions: Zap,
  visualization: Orbit,
  swimlane: GanttChart,
} satisfies Record<PageTab, typeof Radio>;

export function EventsPageTabs({
  activeTab,
  eventCount,
  subscriptionCount,
  labels,
  onTabChange,
}: {
  activeTab: PageTab;
  eventCount: number;
  subscriptionCount: number;
  labels: Record<PageTab, string>;
  onTabChange: (tab: PageTab) => void;
}) {
  const tabs: { key: PageTab; count?: number }[] = [
    { key: "events", count: eventCount },
    { key: "subscriptions", count: subscriptionCount },
    { key: "visualization" },
    { key: "swimlane" },
  ];

  return (
    <div className="mt-4 flex overflow-x-auto rounded-lg border border-glass bg-white/[0.02] p-0.5 w-fit max-w-full scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = TAB_ICONS[tab.key];
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white/[0.08] text-foreground shadow-sm"
                : "text-muted-dark hover:text-muted"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {labels[tab.key]}
            {tab.count !== undefined && (
              <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-sm tabular-nums">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
