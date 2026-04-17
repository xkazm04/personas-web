"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Cloud,
  Activity,
  Wifi,
  WifiOff,
  LogOut,
  Loader2,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import GlowCard from "@/components/GlowCard";
import { useAuthStore } from "@/stores/authStore";
import { useSystemStore } from "@/stores/systemStore";
import { useTranslation } from "@/i18n/useTranslation";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const isDemo = useAuthStore((s) => s.isDemo);
  const isSigningOut = useAuthStore((s) => s.isSigningOut);
  const health = useSystemStore((s) => s.health);
  const status = useSystemStore((s) => s.status);
  const fetchStatus = useSystemStore((s) => s.fetchStatus);
  const fetchHealth = useSystemStore((s) => s.fetchHealth);
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
      {/* Background illustration */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
        <Image
          src="/gen/backgrounds/bg-settings.png"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover opacity-[0.12]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
      </div>

      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">{t.settingsPage.title}</GradientText>
        </h1>
        <p className="mt-1 text-base text-muted-dark">
          {t.settingsPage.subtitle}
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account */}
        <GlowCard accent="cyan" variants={fadeUp} className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-5 w-5 text-brand-cyan" />
            <h2 className="text-base font-semibold text-foreground">{t.settingsPage.account}</h2>
          </div>

          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 rounded-2xl border border-glass-hover object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-glass-hover bg-brand-cyan/10 text-lg font-bold text-brand-cyan">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-base font-medium text-foreground">{displayName}</p>
              <p className="text-sm text-muted-dark">{email}</p>
            </div>
          </div>

          <button
            onClick={signOut}
            disabled={isSigningOut}
            className="mt-6 flex items-center gap-2 rounded-xl border border-glass-hover bg-white/[0.03] px-4 py-2.5 text-base text-muted transition-all hover:bg-white/[0.06] hover:text-foreground disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {isSigningOut ? "Signing out…" : t.common.signOut}
          </button>
        </GlowCard>

        {/* Cloud Connection */}
        <GlowCard accent={isConnected ? "emerald" : "amber"} variants={fadeUp} className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Cloud className="h-5 w-5 text-brand-cyan" />
            <h2 className="text-base font-semibold text-foreground">
              {t.settingsPage.cloudConnection}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base text-muted">{t.common.status}</span>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-emerald-400" />
                    <span className="text-base text-emerald-400">{t.common.connected}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-400" />
                    <span className="text-base text-red-400">{t.common.disconnected}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base text-muted">{t.settingsPage.orchestrator}</span>
              <code className="text-sm text-muted-dark font-mono">
                {isDemo ? "mock://demo-data" : (process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ?? t.settingsPage.notConfigured)}
              </code>
            </div>

            {health && (
              <div className="flex items-center justify-between">
                <span className="text-base text-muted">{t.settingsPage.totalWorkers}</span>
                <span className="text-base text-foreground tabular-nums">
                  {health.workers.executing} {t.common.active} / {health.workers.idle} {t.common.idle} /{" "}
                  {health.workers.total} {t.common.total}
                </span>
              </div>
            )}
          </div>
        </GlowCard>

        {/* System Status */}
        <GlowCard accent="purple" variants={fadeUp} className="p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-5 w-5 text-brand-purple" />
            <h2 className="text-base font-semibold text-foreground">
              {t.settingsPage.systemStatus}
            </h2>
          </div>

          {status ? (
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-glass bg-white/[0.02] p-4 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <p className="text-4xl font-bold tracking-tight tabular-nums">
                  <GradientText>{status.workerCounts.total}</GradientText>
                </p>
                <p className="mt-2 text-sm font-medium uppercase tracking-wider text-muted-dark">{t.settingsPage.totalWorkers}</p>
              </div>
              <div className="rounded-xl border border-glass bg-white/[0.02] p-4 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <p className="text-4xl font-bold tracking-tight tabular-nums">
                  <GradientText>{status.queueLength}</GradientText>
                </p>
                <p className="mt-2 text-sm font-medium uppercase tracking-wider text-muted-dark">{t.settingsPage.queueLength}</p>
              </div>
              <div className="rounded-xl border border-glass bg-white/[0.02] p-4 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <p className="text-4xl font-bold tracking-tight tabular-nums">
                  <GradientText>{status.activeExecutions.length}</GradientText>
                </p>
                <p className="mt-2 text-sm font-medium uppercase tracking-wider text-muted-dark">
                  {t.settingsPage.activeExecutions}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-base text-muted-dark">
              <Settings className="h-4 w-4 animate-spin" />
              {t.settingsPage.loadingStatus}
            </div>
          )}
        </GlowCard>
      </div>
    </motion.div>
  );
}
