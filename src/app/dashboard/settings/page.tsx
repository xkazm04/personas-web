"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Cloud,
  Activity,
  Wifi,
  WifiOff,
  LogOut,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import GlowCard from "@/components/GlowCard";
import { useAuthStore } from "@/stores/authStore";
import { useSystemStore } from "@/stores/systemStore";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const health = useSystemStore((s) => s.health);
  const status = useSystemStore((s) => s.status);
  const fetchStatus = useSystemStore((s) => s.fetchStatus);
  const fetchHealth = useSystemStore((s) => s.fetchHealth);

  useEffect(() => {
    void fetchStatus();
    void fetchHealth();
  }, [fetchStatus, fetchHealth]);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.full_name ?? "User";
  const email = user?.email ?? "-";
  const isConnected = health?.status === "ok";

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText>Settings</GradientText>
        </h1>
        <p className="mt-1 text-sm text-muted-dark">
          Account and cloud connection configuration
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account */}
        <GlowCard accent="cyan" variants={fadeUp} className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-5 w-5 text-brand-cyan" />
            <h2 className="text-base font-semibold text-foreground">Account</h2>
          </div>

          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-14 w-14 rounded-2xl border border-white/[0.1]"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-brand-cyan/10 text-lg font-bold text-brand-cyan">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-dark">{email}</p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="mt-6 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-muted transition-all hover:bg-white/[0.06] hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </GlowCard>

        {/* Cloud Connection */}
        <GlowCard accent={isConnected ? "emerald" : "amber"} variants={fadeUp} className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Cloud className="h-5 w-5 text-brand-cyan" />
            <h2 className="text-base font-semibold text-foreground">
              Cloud Connection
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Status</span>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-red-400">Disconnected</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Orchestrator</span>
              <code className="text-xs text-muted-dark font-mono">
                {process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ?? "Not configured"}
              </code>
            </div>

            {health && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Workers</span>
                <span className="text-sm text-foreground tabular-nums">
                  {health.workers.executing} active / {health.workers.idle} idle /{" "}
                  {health.workers.total} total
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
              System Status
            </h2>
          </div>

          {status ? (
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <p className="text-4xl font-bold tracking-tight tabular-nums">
                  <GradientText>{status.workerCounts.total}</GradientText>
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-dark">Total Workers</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <p className="text-4xl font-bold tracking-tight tabular-nums">
                  <GradientText>{status.queueLength}</GradientText>
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-dark">Queue Length</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <p className="text-4xl font-bold tracking-tight tabular-nums">
                  <GradientText>{status.activeExecutions.length}</GradientText>
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-dark">
                  Active Executions
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-dark">
              <Settings className="h-4 w-4 animate-spin" />
              Loading system status...
            </div>
          )}
        </GlowCard>
      </div>
    </motion.div>
  );
}
