"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Clock,
  Bell,
  GitBranch,
  Calendar,
  Settings,
  X,
  ArrowUpRight,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_MEMORY_ACTIONS,
  type MemoryAction,
} from "@/lib/mock-dashboard-data";
import StalenessIndicator from "./StalenessIndicator";
import { useTranslation } from "@/i18n/useTranslation";

/** Map action type to icon + color badge classes. */
const typeConfig: Record<
  MemoryAction["type"],
  { Icon: React.ElementType; badge: string; dot: string }
> = {
  throttle: {
    Icon: Clock,
    badge: "border-amber-500/20 bg-amber-500/8 text-amber-400",
    dot: "bg-amber-400",
  },
  alert: {
    Icon: Bell,
    badge: "border-rose-500/20 bg-rose-500/8 text-rose-400",
    dot: "bg-rose-400",
  },
  routing: {
    Icon: GitBranch,
    badge: "border-cyan-500/20 bg-cyan-500/8 text-cyan-400",
    dot: "bg-cyan-400",
  },
  schedule: {
    Icon: Calendar,
    badge: "border-purple-500/20 bg-purple-500/8 text-purple-400",
    dot: "bg-purple-400",
  },
  config: {
    Icon: Settings,
    badge: "border-emerald-500/20 bg-emerald-500/8 text-emerald-400",
    dot: "bg-emerald-400",
  },
};

/** Render filled/empty dots for score indicator (max 10). */
function ScoreDots({ score, type }: { score: number; type: MemoryAction["type"] }) {
  const maxDots = 5;
  // Map 1-10 score into 1-5 filled dots
  const filled = Math.max(1, Math.round((score / 10) * maxDots));
  const { dot } = typeConfig[type];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxDots }, (_, i) => (
        <span
          key={i}
          className={`h-1 w-1 rounded-full ${i < filled ? dot : "bg-white/10"}`}
        />
      ))}
    </div>
  );
}

export default function MemoryActionsPanel() {
  const { t } = useTranslation();
  const [actions, setActions] = useState<MemoryAction[]>(MOCK_MEMORY_ACTIONS);
  const [fetchedAt] = useState(() => Date.now());

  const dismiss = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-2 mb-4"
      >
        <Brain className="h-4 w-4 text-brand-purple" />
        <h2 className="text-base font-semibold text-foreground">
          Memory Insights
        </h2>
        {actions.length > 0 && (
          <span className="ml-auto flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/8 px-2 py-0.5 text-sm font-medium text-purple-400">
            {actions.length} suggestion{actions.length !== 1 ? "s" : ""}
          </span>
        )}
        <StalenessIndicator
          fetchedAt={fetchedAt}
          className={actions.length > 0 ? "" : "ml-auto"}
        />
      </motion.div>

      {/* Action Cards */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {actions.map((action) => {
            const { Icon, badge } = typeConfig[action.type];

            return (
              <motion.div
                key={action.id}
                variants={fadeUp}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                layout
                className="group relative rounded-xl border border-glass bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex items-start gap-2.5">
                  {/* Type icon */}
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border ${badge}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title + dismiss button */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {action.title}
                      </span>
                      <button
                        onClick={() => dismiss(action.id)}
                        className="ml-auto flex-shrink-0 rounded-md p-0.5 text-muted-dark opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                        aria-label={`Dismiss: ${action.title}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-dark line-clamp-2">
                      {action.description}
                    </p>

                    {/* Bottom row: persona badge + score dots */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 text-sm font-medium text-muted-dark">
                        {action.persona}
                      </span>
                      <ScoreDots score={action.score} type={action.type} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {actions.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center text-sm text-muted-dark"
          >
            All suggestions dismissed. Check back later.
          </motion.p>
        )}
      </div>

      <Link
        href="/dashboard/memories"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-purple transition-colors hover:text-purple-300"
      >
        {t.memoriesPage.seeAll}
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    </motion.div>
  );
}
