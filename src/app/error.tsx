"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Compass, RefreshCcw, Home, Copy, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";
  const digest = error.digest;

  const handleCopyDigest = async () => {
    if (!digest) return;
    try {
      await navigator.clipboard.writeText(digest);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="relative flex min-h-[70vh] items-center justify-center px-6 py-32"
      >
        {/* Subtle ambient glow — quieter than global-error since the layout
            chrome is still rendered around us. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(6,182,212,0.08) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)",
          }}
        />

        <div className="relative w-full max-w-2xl">
          {/* Top shine */}
          <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent" />

          <div className="relative overflow-hidden rounded-2xl border border-glass bg-white/[0.03] p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.4)] sm:p-10">
            {/* Inner accent ring */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-2xl ring-1 ring-inset ring-brand-cyan/15"
            />

            {/* Breathing compass — globals.css honors prefers-reduced-motion. */}
            <div className="animate-breathe-glow flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-cyan/25 bg-brand-cyan/10">
              <Compass className="h-6 w-6 text-brand-cyan" />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
              This page hit an unexpected turn
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-dark">
              Something went wrong while loading this page. Our team has been
              notified — try again, or head back to home.
            </p>

            {/* Verbose error message — dev only. Production hides error.message
                to avoid leaking file paths, env-var names, or upstream API
                bodies. Sentry already captured the full error above. */}
            {isDev && error.message && (
              <pre className="mt-5 max-h-32 overflow-auto rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs font-mono leading-relaxed text-amber-300/80 whitespace-pre-wrap break-all">
                {error.message}
              </pre>
            )}

            {/* Digest — small copyable chip for support */}
            {digest && (
              <div className="mt-5 flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-dark/60">
                  Error reference
                </span>
                <button
                  type="button"
                  onClick={handleCopyDigest}
                  aria-label="Copy error reference"
                  className="group inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-xs text-muted-dark transition-colors hover:border-white/[0.18] hover:text-foreground"
                >
                  <code className="select-all">{digest}</code>
                  {copied ? (
                    <Check className="h-3 w-3 text-brand-emerald" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                  )}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={reset}
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-5 py-2.5 text-sm font-semibold text-brand-cyan shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all duration-200 hover:border-brand-cyan/50 hover:bg-brand-cyan/15 hover:shadow-[0_0_28px_rgba(6,182,212,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-2"
              >
                <RefreshCcw className="h-4 w-4 transition-transform duration-300 group-hover:rotate-[-90deg]" />
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-muted transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:ring-offset-2"
              >
                <Home className="h-4 w-4" />
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
