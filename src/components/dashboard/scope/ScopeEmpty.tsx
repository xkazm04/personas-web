"use client";

import { CalendarX, Users } from "lucide-react";

import EmptyState from "@/components/dashboard/EmptyState";
import { useTranslation } from "@/i18n/useTranslation";
import { useDashboardFilterStore } from "@/stores/dashboardFilterStore";

/**
 * The scope bar's persona + window emptied a list that has rows: say so, and
 * offer the widest persona choice. Distinct from a list that is empty (the
 * view's own "none yet") and from one the plane does not serve
 * (`DesktopUnsupportedNote`), which outrank it.
 */
export default function ScopeEmpty({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const personaId = useDashboardFilterStore((s) => s.personaId);
  const setPersonaId = useDashboardFilterStore((s) => s.setPersonaId);

  const action =
    personaId !== null ? (
      <button
        type="button"
        onClick={() => setPersonaId(null)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-1.5 text-sm text-brand-cyan transition-colors hover:border-brand-cyan/30 hover:bg-brand-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50"
      >
        <Users className="h-3.5 w-3.5" aria-hidden />
        {t.dashboard.scope.allPersonas}
      </button>
    ) : undefined;

  if (compact) {
    return (
      <div role="status" data-scope-empty="" className="flex flex-col items-center gap-3 px-4 py-8 text-center">
        <p className="text-sm text-muted-dark">{t.dashboard.scope.emptyInScope}</p>
        {action}
      </div>
    );
  }
  return (
    <div role="status" data-scope-empty="">
      <EmptyState icon={CalendarX} title={t.dashboard.scope.emptyInScope} action={action} />
    </div>
  );
}
