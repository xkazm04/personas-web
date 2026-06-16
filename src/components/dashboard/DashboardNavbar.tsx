"use client";

import { motion } from "framer-motion";
import { LogOut, ChevronRight, FlaskConical, Loader2, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GradientText from "@/components/GradientText";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/i18n/useTranslation";

export default function DashboardNavbar() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const isDemo = useAuthStore((s) => s.isDemo);
  const isSigningOut = useAuthStore((s) => s.isSigningOut);
  const isSigningIn = useAuthStore((s) => s.isSigningIn);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName =
    user?.user_metadata?.full_name ?? user?.email ?? "User";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-glass bg-background/30 backdrop-blur-3xl"
    >
      <nav className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Logo + breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            {/* width/height mirror the source's 1344×768 (1.75:1) ratio; the
                square h-7 w-7 slot object-contains it (both dims set, so no
                browser aspect-ratio warning). */}
            <Image
              src="/imgs/logo.png"
              alt={t.dashboardUi.brandName}
              width={42}
              height={24}
              className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]"
            />
            <span className="text-base font-semibold tracking-tight text-foreground">
              {t.dashboardUi.brandName}
            </span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-dark" />
          <GradientText variant="silver" className="text-base font-medium">
            {t.dashboard.title}
          </GradientText>
          {isDemo && (
            <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-0.5 text-sm font-medium text-amber-400">
              <FlaskConical className="h-3 w-3" />
              {t.common.demo}
            </span>
          )}
        </div>

        {/* Right: identity + auth controls (available on every dashboard page) */}
        <div className="flex items-center gap-3">
          {/* Real account: show the signed-in identity. */}
          {!isDemo && (
            <div className="flex items-center gap-2.5">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={28}
                  height={28}
                  unoptimized
                  className="h-7 w-7 rounded-full border border-glass-hover object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-glass-hover bg-brand-cyan/10 text-sm font-medium text-brand-cyan">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden text-base text-muted sm:inline">
                {displayName}
              </span>
            </div>
          )}

          {/* Demo: offer a one-click upgrade to a real account from any page. */}
          {isDemo && (
            <button
              onClick={signInWithGoogle}
              disabled={isSigningIn}
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-brand-cyan/25 bg-brand-cyan/8 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all duration-200 hover:border-brand-cyan/40 hover:bg-brand-cyan/15 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isSigningIn ? (
                <Loader2 className="h-4 w-4 animate-spin sm:h-3 sm:w-3" />
              ) : (
                <LogIn className="h-4 w-4 sm:h-3 sm:w-3" />
              )}
              <span>{isSigningIn ? t.dashboardUi.signingIn : t.common.signIn}</span>
            </button>
          )}

          {/* Sign out is only meaningful for a real account — a demo session
              has nothing to sign out of. Demo users leave via "Sign in" (which
              upgrades to a real account) or by navigating away. */}
          {!isDemo && (
            <button
              onClick={signOut}
              disabled={isSigningOut}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-glass bg-white/[0.03] px-2 py-1.5 text-sm text-muted transition-all duration-200 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-60 disabled:pointer-events-none sm:px-3"
            >
              {isSigningOut ? (
                <Loader2 className="h-4 w-4 animate-spin sm:h-3 sm:w-3" />
              ) : (
                <LogOut className="h-4 w-4 sm:h-3 sm:w-3" />
              )}
              <span className="hidden sm:inline">
                {isSigningOut ? t.common.signingOut : t.common.signOut}
              </span>
            </button>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
