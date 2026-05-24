"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useSystemStore } from "@/stores/systemStore";
import { usePolling } from "@/hooks/usePolling";
import AuthLayout from "./AuthLayout";
import DashboardSkeleton from "./DashboardSkeleton";
import SignInPrompt from "./SignInPrompt";
import { useTranslation } from "@/i18n/useTranslation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, error, retry } = useAuthStore(
    useShallow((s) => ({
      isAuthenticated: s.isAuthenticated,
      isLoading: s.isLoading,
      error: s.error,
      retry: s.retry,
    })),
  );
  const fetchPersonas = usePersonaStore((s) => s.fetchPersonas);
  const fetchHealth = useSystemStore((s) => s.fetchHealth);

  // Bootstrap data once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      void fetchPersonas();
    }
  }, [isAuthenticated, fetchPersonas]);

  // Poll health every 30s
  usePolling(fetchHealth, 30_000, isAuthenticated);

  if (isLoading) return <DashboardSkeleton />;
  if (error && !isAuthenticated) return <SessionErrorPrompt error={error} onRetry={retry} />;
  if (!isAuthenticated) return <SignInPrompt />;

  return <>{children}</>;
}

function SessionErrorPrompt({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AuthLayout>
      <div
        role="alert"
        aria-live="assertive"
        className="relative z-10 mx-auto w-full max-w-md px-6"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10">
              <AlertTriangle className="h-6 w-6 text-amber-400" aria-hidden="true" />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              {t.dashboardUi.sessionVerifyFailed}
            </h1>

            <p className="mt-3 text-sm text-muted-dark leading-relaxed">
              {error}
            </p>

            <button
              onClick={onRetry}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-brand-cyan/25 bg-brand-cyan/8 px-6 py-3.5 text-sm font-semibold text-brand-cyan transition-all duration-200 hover:border-brand-cyan/40 hover:bg-brand-cyan/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              {t.dashboard.errorBoundary.retry}
            </button>

            <p className="mt-4 text-[11px] text-muted-dark/60">
              {t.dashboardUi.sessionHelp}
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
