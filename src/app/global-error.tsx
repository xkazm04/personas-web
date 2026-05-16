"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Compass, Home, Activity, RefreshCcw, Copy, Check } from "lucide-react";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Top-level errors carry the most leaky payloads (URLs with query/path
    // PII, file paths from server stacks, env-var names, third-party API
    // bodies). Route through the scrubber so message + stack are sanitized
    // before they ever reach Sentry — the global beforeSend hook still
    // runs on top of this for defense in depth.
    captureExceptionScrubbed(error, { tags: { scope: "GlobalError" } });
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
    <html lang="en" className="dark">
      <body className="relative min-h-screen overflow-hidden bg-[#09090b] text-foreground antialiased">
        {/* Ambient gradient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(6,182,212,0.10) 0%, rgba(6,182,212,0.04) 35%, transparent 70%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 80%, rgba(168,85,247,0.06) 0%, transparent 70%)",
          }}
        />

        <main className="relative z-10 mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-16">
          <div className="relative w-full">
            {/* Top shine */}
            <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent" />

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.4)] sm:p-10">
              {/* Inner accent ring */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-px rounded-2xl ring-1 ring-inset ring-brand-cyan/15"
              />

              {/* Soft breathing aura signals the system is still alive and
                  listening. Animation is automatically suppressed by the
                  global `prefers-reduced-motion` rule in globals.css. */}
              <div className="animate-breathe-glow flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-cyan/25 bg-brand-cyan/10">
                <Compass className="h-6 w-6 text-brand-cyan" />
              </div>

              {/* Heading */}
              <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
                We hit an unexpected turn
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-dark">
                Something on our side broke before this page could finish loading.
                Our team has been notified — try the page again, or pick up where
                you left off.
              </p>

              {/* Verbose error message — dev only.
                  In production we never expose error.message: it can leak file
                  paths, env var names, third-party stack hints, or upstream API
                  messages. Sentry already captured the full error above. */}
              {isDev && error.message && (
                <pre className="mt-5 max-h-32 overflow-auto rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] font-mono leading-relaxed text-amber-300/80 whitespace-pre-wrap break-all">
                  {error.message}
                </pre>
              )}

              {/* Digest — small copyable chip for support */}
              {digest && (
                <div className="mt-5 flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-dark/60">
                    Error reference
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDigest}
                    aria-label="Copy error reference"
                    className="group inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-muted-dark transition-colors hover:border-white/[0.18] hover:text-foreground"
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
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-5 py-2.5 text-sm font-semibold text-brand-cyan shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all duration-200 hover:border-brand-cyan/50 hover:bg-brand-cyan/15 hover:shadow-[0_0_28px_rgba(6,182,212,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
                >
                  <RefreshCcw className="h-4 w-4 transition-transform duration-300 group-hover:rotate-[-90deg]" />
                  Try again
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-muted transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
                >
                  <Home className="h-4 w-4" />
                  Go home
                </Link>
                <a
                  href="https://status.personas.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.06] bg-transparent px-5 py-2.5 text-sm font-medium text-muted-dark transition-all duration-200 hover:border-white/[0.16] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
                >
                  <Activity className="h-4 w-4" />
                  View status
                </a>
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
