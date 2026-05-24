"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { Cloud, Loader2, LogOut, User, Wifi, WifiOff } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useAuthStore } from "@/stores/authStore";
import { useSystemStore } from "@/stores/systemStore";
import { useTranslation } from "@/i18n/useTranslation";
import { SettingsHeader } from "./SettingsHeader";
import { ApiKeysCard } from "./settings-sections/ApiKeysCard";
import { ModelProvidersCard } from "./settings-sections/ModelProvidersCard";
import { NotificationsCard } from "./settings-sections/NotificationsCard";

export default function SettingsPage() {
  const { user, signOut, isDemo, isSigningOut } = useAuthStore(
    useShallow((s) => ({
      user: s.user,
      signOut: s.signOut,
      isDemo: s.isDemo,
      isSigningOut: s.isSigningOut,
    })),
  );
  const { health, status, fetchStatus, fetchHealth } = useSystemStore(
    useShallow((s) => ({
      health: s.health,
      status: s.status,
      fetchStatus: s.fetchStatus,
      fetchHealth: s.fetchHealth,
    })),
  );
  const { t } = useTranslation();

  useEffect(() => {
    void fetchStatus();
    void fetchHealth();
  }, [fetchStatus, fetchHealth]);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.full_name ?? "User";
  const email = user?.email ?? "-";
  const isConnected = health?.status === "ok";

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
        <Image src="/gen/backgrounds/bg-settings.png" alt="" fill sizes="100vw" loading="lazy" className="object-cover opacity-[0.12]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
      </div>

      <SettingsHeader title={t.settingsPage.title} subtitle={t.settingsPage.subtitle} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account */}
        <GlowCard accent="cyan" variants={fadeUp} className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-brand-cyan" />
            <h2 className="text-base font-semibold text-foreground">{t.settingsPage.account}</h2>
          </div>
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={56} height={56} unoptimized className="h-14 w-14 rounded-2xl border border-glass-hover object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-glass-hover bg-brand-cyan/10 text-lg font-bold text-brand-cyan">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-base font-medium text-foreground">{displayName}</p>
              <p className="truncate text-sm text-muted-dark">{email}</p>
            </div>
            <button
              onClick={signOut}
              disabled={isSigningOut}
              className="ml-auto flex items-center gap-2 rounded-xl border border-glass-hover bg-white/[0.03] px-3.5 py-2 text-sm text-muted transition-all hover:bg-white/[0.06] hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
            >
              {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              {t.common.signOut}
            </button>
          </div>
        </GlowCard>

        {/* Cloud connection + system status */}
        <GlowCard accent={isConnected ? "emerald" : "amber"} variants={fadeUp} className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Cloud className="h-4 w-4 text-brand-cyan" />
            <h2 className="text-base font-semibold text-foreground">{t.settingsPage.cloudConnection}</h2>
            <span className="ml-auto flex items-center gap-1.5 text-sm">
              {isConnected ? <Wifi className="h-4 w-4 text-emerald-400" /> : <WifiOff className="h-4 w-4 text-red-400" />}
              <span className={isConnected ? "text-emerald-400" : "text-red-400"}>
                {isConnected ? t.common.connected : t.common.disconnected}
              </span>
            </span>
          </div>
          <div className="divide-y divide-glass text-sm">
            <Row label={t.settingsPage.orchestrator}>
              <code className="font-mono text-sm text-muted-dark">
                {isDemo ? "mock://demo-data" : (process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ?? t.settingsPage.notConfigured)}
              </code>
            </Row>
            {health && (
              <Row label={t.settingsPage.totalWorkers}>
                <span className="tabular-nums text-foreground">
                  {health.workers.executing} {t.common.active} / {health.workers.idle} {t.common.idle} / {health.workers.total} {t.common.total}
                </span>
              </Row>
            )}
            {status && (
              <Row label={t.settingsPage.queueLength}>
                <span className="tabular-nums text-foreground">{status.queueLength}</span>
              </Row>
            )}
            {status && (
              <Row label={t.settingsPage.activeExecutions}>
                <span className="tabular-nums text-foreground">{status.activeExecutions.length}</span>
              </Row>
            )}
          </div>
        </GlowCard>

        <NotificationsCard />
        <ModelProvidersCard />
        <ApiKeysCard />
      </div>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-muted">{label}</span>
      {children}
    </div>
  );
}
