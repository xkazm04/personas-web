"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCircle2, Users, Sparkles } from "lucide-react";

interface WaitlistModalProps {
  platform: string;
  platformIcon: React.ComponentType<{ className?: string }>;
  open: boolean;
  onClose: () => void;
}

export default function WaitlistModal({
  platform,
  platformIcon: PlatformIcon,
  open,
  onClose,
}: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [earlyBeta, setEarlyBeta] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/waitlist");
      if (res.ok) {
        const data = await res.json();
        const count = data.counts?.[platform] ?? 0;
        setWaitlistCount(count);
      }
    } catch {
      // Non-critical — just hide the count
    }
  }, [platform]);

  useEffect(() => {
    if (open) {
      fetchCount();
      setStatus("idle");
      setEmail("");
      setEarlyBeta(false);
      setErrorMsg("");
    }
  }, [open, fetchCount]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, platform, earlyBeta }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join waitlist");
      }

      setStatus("success");
      fetchCount();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0a0a0f] p-6 shadow-[0_0_80px_rgba(0,0,0,0.5)]"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-dark/60 transition-colors hover:text-muted-dark"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/15 ring-1 ring-brand-purple/20">
                <PlatformIcon className="h-5 w-5 text-brand-purple" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Personas for {platform}
                </h3>
                <p className="text-xs text-muted-dark">Coming soon</p>
              </div>
            </div>

            {/* Social proof */}
            {waitlistCount !== null && waitlistCount > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                <Users className="h-3.5 w-3.5 text-brand-cyan/60" />
                <span className="text-xs text-muted-dark">
                  Join <span className="font-medium text-brand-cyan">{waitlistCount}</span>{" "}
                  {waitlistCount === 1 ? "person" : "others"} waiting for {platform}
                </span>
              </div>
            )}

            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-emerald/15 ring-1 ring-brand-emerald/20">
                  <CheckCircle2 className="h-6 w-6 text-brand-emerald" />
                </div>
                <p className="text-sm font-medium text-foreground">You&apos;re on the list!</p>
                <p className="mt-1 text-xs text-muted-dark">
                  We&apos;ll notify you when Personas for {platform} is ready.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 w-full rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-white/[0.15] hover:text-foreground"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="waitlist-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-dark/40 focus:border-brand-cyan/30 focus:outline-none focus:ring-1 focus:ring-brand-cyan/20 transition-colors"
                  />
                  {errorMsg && (
                    <p className="mt-1.5 text-xs text-brand-rose/70">{errorMsg}</p>
                  )}
                </div>

                {/* Early beta checkbox */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] px-3.5 py-3 transition-colors hover:border-white/[0.08]">
                  <input
                    type="checkbox"
                    checked={earlyBeta}
                    onChange={(e) => setEarlyBeta(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/10 bg-white/[0.05] accent-brand-cyan"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-brand-purple/70" />
                      <span className="text-xs font-medium text-foreground/80">Early beta access</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-dark/60 leading-relaxed">
                      Get access to unstable builds before the public release
                    </p>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  <Bell className="h-4 w-4" />
                  {status === "loading" ? "Joining..." : "Notify me when available"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
