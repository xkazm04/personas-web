"use client";

import {
  Brain,
  FileText,
  HeartPulse,
  KeyRound,
  MessageSquareQuote,
  Target,
  Zap,
} from "lucide-react";

import GlowCard from "@/components/GlowCard";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import type { DirectorCategory, DirectorSeverity, DirectorVerdict } from "@/lib/mock-dashboard-data";

const CATEGORY_META: Record<DirectorCategory, { Icon: React.ElementType; chip: string }> = {
  prompt: { Icon: FileText, chip: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" },
  health: { Icon: HeartPulse, chip: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
  triggers: { Icon: Zap, chip: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  credentials: { Icon: KeyRound, chip: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  memory: { Icon: Brain, chip: "border-purple-500/30 bg-purple-500/10 text-purple-300" },
  usefulness: { Icon: Target, chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
};

const SEVERITY_ACCENT: Record<DirectorSeverity, string> = {
  error: "bg-rose-400",
  warning: "bg-amber-400",
  info: "bg-cyan-400",
};

/**
 * Recent coaching verdicts — the Director's latest prose coaching notes across
 * the scope, newest first, each carrying a severity accent and a category
 * chip. Desktop parity: the coaching-history verdict list (feed form).
 */
export function VerdictFeedCard({ verdicts }: { verdicts: DirectorVerdict[] }) {
  const { t } = useTranslation();
  const lp = t.directorPage.verdictFeed;

  return (
    <GlowCard accent="cyan" className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquareQuote className="h-4 w-4 text-brand-cyan" />
        <h2 className="text-base font-semibold text-foreground">{lp.title}</h2>
        {verdicts.length > 0 && (
          <span className="ml-auto rounded-full border border-cyan-500/20 bg-cyan-500/8 px-2 py-0.5 text-sm font-medium tabular-nums text-cyan-300">
            {verdicts.length}
          </span>
        )}
      </div>

      {verdicts.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-8 text-sm text-muted-dark">
          {lp.empty}
        </p>
      ) : (
        <div className="-mx-1 space-y-1">
          {verdicts.map((verdict) => {
            const meta = CATEGORY_META[verdict.category];
            return (
              <div
                key={verdict.id}
                className="flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className={`mt-1 h-8 w-1 flex-shrink-0 rounded-full ${SEVERITY_ACCENT[verdict.severity]}`}
                  aria-hidden
                />
                <PersonaAvatar color={verdict.personaColor} name={verdict.personaName} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {verdict.personaName}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${meta.chip}`}
                    >
                      <meta.Icon className="h-3 w-3" />
                      {lp.categories[verdict.category]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-dark">{verdict.title}</p>
                </div>
                <span className="flex-shrink-0 text-xs tabular-nums text-muted-dark">
                  {relativeTime(verdict.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </GlowCard>
  );
}
