"use client";

import { motion } from "framer-motion";
import { LogIn, FlaskConical } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import AuthLayout from "@/components/dashboard/AuthLayout";
import { useAuthStore } from "@/stores/authStore";
import { DEVELOPMENT } from "@/lib/dev";

export default function SignInPrompt() {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);

  return (
    <AuthLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 mx-auto w-full max-w-md px-6"
      >
        {/* Dev mode banner */}
        {DEVELOPMENT && (
          <motion.div
            variants={fadeUp}
            className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-400"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span>Development Mode — using mock data</span>
          </motion.div>
        )}

        {/* Card */}
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl"
        >
          {/* Top shine */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Animated conic border */}
          <div className="pointer-events-none absolute -inset-px -z-10 rounded-2xl opacity-40 animated-conic-border" />

          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-cyan/20 bg-brand-cyan/10">
              <LogIn className="h-6 w-6 text-brand-cyan" />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              Sign in to your{" "}
              <GradientText>Dashboard</GradientText>
            </h1>

            <p className="mt-3 text-sm text-muted-dark leading-relaxed">
              {DEVELOPMENT
                ? "Click below to enter the dashboard with example data and explore the UI."
                : "Monitor your cloud agents, review executions, and manage events from one place."}
            </p>

            {/* Sign-In Button */}
            <button
              onClick={signInWithGoogle}
              className="group relative mt-8 flex w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-brand-cyan/25 bg-brand-cyan/8 px-6 py-3.5 text-sm font-semibold text-brand-cyan transition-all duration-300 hover:border-brand-cyan/40 hover:bg-brand-cyan/15 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-cyan/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {DEVELOPMENT ? (
                <>
                  <FlaskConical className="relative h-5 w-5" />
                  <span className="relative">Enter Demo Dashboard</span>
                </>
              ) : (
                <>
                  <svg className="relative h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      opacity={0.7}
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      opacity={0.5}
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      opacity={0.8}
                    />
                  </svg>
                  <span className="relative">Continue with Google</span>
                </>
              )}
            </button>

            <p className="mt-4 text-[11px] text-muted-dark/60">
              {DEVELOPMENT
                ? "No authentication required in development mode"
                : "Secured by Supabase Authentication"}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
