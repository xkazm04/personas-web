"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useSystemStore } from "@/stores/systemStore";
import { usePolling } from "@/hooks/usePolling";
import DashboardSkeleton from "./DashboardSkeleton";
import SignInPrompt from "./SignInPrompt";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
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
  if (!isAuthenticated) return <SignInPrompt />;

  return <>{children}</>;
}
