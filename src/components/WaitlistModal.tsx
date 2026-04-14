"use client";

import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCircle2, Users, Sparkles, Share2, AlertCircle, Info } from "lucide-react";
import { TRANSITION_FAST, TRANSITION_NORMAL } from "@/lib/animations";
import * as Sentry from "@sentry/nextjs";

const FETCH_TIMEOUT_MS = 15_000;

/** Basic RFC 5322 email pattern — intentionally simple to avoid ReDoS */
const EMAIL_RE = /^[^\s@<>'"`;(){}[\]\\]+@[^\s@<>'"`;(){}[\]\\]+\.[a-zA-Z]{2,}$/;

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
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const submitAbortRef = useRef<AbortController | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const fetchCount = useCallback(async (signal: AbortSignal) => {
    try {
      const res = await fetch("/api/waitlist", { signal });
      if (res.ok) {
        const data = await res.json();
        const count = data.counts?.[platform] ?? 0;
        setWaitlistCount(count);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Non-critical — just hide the count
    }
  }, [platform]);

  useEffect(() => {
    if (!open) {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    const controller = new AbortController();
    fetchCount(controller.signal);
    setStatus("idle");
    setEmail("");
    setEarlyBeta(false);
    setErrorMsg("");
    return () => controller.abort();
  }, [open, fetchCount]);

  // Handle keys: Escape to close, Tab for focus trap
  useEffect(() => {
    if (!open) return;
    
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Abort any in-flight submit when the modal closes
  useEffect(() => {
    if (!open) {
      submitAbortRef.current?.abort();
      submitAbortRef.current = null;
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    // Capture previous state for potential revert
    const prevCount = waitlistCount;
    
    // Optimistic update: show success and increment count immediately
    setStatus("success");
    setWaitlistCount(prev => (prev !== null ? prev + 1 : 1));
    setErrorMsg("");

    // Abort any previous in-flight submit
    submitAbortRef.current?.abort();
    const controller = new AbortController();
    submitAbortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, platform, earlyBeta }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      // If it was a duplicate, revert the optimistic increment and show duplicate state
      if (data.duplicate) {
        setWaitlistCount(prevCount);
        setStatus("duplicate");
      }
      
      // We explicitly DON'T call fetchCount() here anymore because we've 
      // already updated the UI optimistically.
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      
      Sentry.captureException(err, { tags: { component: "WaitlistModal" } });
      
      // Revert optimistic update on error
      setStatus("error");
      setWaitlistCount(prevCount);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      clearTimeout(timeout);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}?ref=waitlist&platform=${platform.toLowerCase()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={TRANSITION_FAST}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={TRANSITION_NORMAL}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] rounded-2xl border border-white/[0.06] bg-background p-6 shadow-[0_0_80px_rgba(0,0,0,0.5)]"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 rounded-lg p-2 text-muted-dark transition-colors hover:text-muted focus-ring outline-none"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/15 ring-1 ring-brand-purple/20">
                <PlatformIcon className="h-5 w-5 text-brand-purple" />
              </div>
              <div>
                <h3 id="waitlist-modal-title" className="text-base font-semibold text-foreground">
                  Personas for {platform}
                </h3>
                <p className="text-sm text-muted-dark">Coming soon</p>
              </div>
            </div>

            {/* Social proof */}
            {waitlistCount !== null && waitlistCount > 0 && (
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                <Users className="h-3.5 w-3.5 text-brand-cyan/60" />
                <span className="text-sm text-muted-dark">
                  Join <span className="font-medium text-brand-cyan">{waitlistCount}</span>{" "}
                  {waitlistCount === 1 ? "person" : "others"} waiting for {platform}
                </span>
              </div>
            )}

            {/* Separator */}
            <div className="mt-5 h-px bg-white/[0.04]" />

            {status === "success" || status === "duplicate" ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ring-1 ${
                  status === "duplicate" 
                    ? "bg-brand-cyan/15 ring-brand-cyan/20" 
                    : "bg-brand-emerald/15 ring-brand-emerald/20"
                }`}>
                  {status === "duplicate" ? (
                    <Info className="h-6 w-6 text-brand-cyan" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-brand-emerald" />
                  )}
                </div>
                <p className="text-base font-medium text-foreground">
                  {status === "duplicate" ? "Already on the list!" : "You're on the list!"}
                </p>
                <p className="mt-1 text-sm text-muted-dark">
                  {status === "duplicate" 
                    ? `No action needed — we already have your request for Personas for ${platform}.`
                    : `We'll notify you when Personas for ${platform} is ready.`}
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 w-full rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-base font-medium text-muted transition-colors hover:border-white/[0.15] hover:text-foreground"
                >
                  Close
                </button>

                <button
                  onClick={handleShare}
                  className="mt-2 group relative flex w-full items-center justify-center gap-2 rounded-full bg-white/[0.04] px-4 py-2.5 text-base font-medium text-brand-cyan transition-colors hover:bg-white/[0.08]"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share with a friend</span>
                  
                  <AnimatePresence>
                    {copied && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute -top-10 rounded-lg bg-brand-cyan px-2 py-1 text-sm font-bold uppercase tracking-wider text-black shadow-lg shadow-brand-cyan/20"
                      >
                        Copied!
                        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-brand-cyan" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
                    autoFocus
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-base text-foreground placeholder:text-muted-dark focus:border-brand-cyan/30 focus:outline-none focus:ring-1 focus:ring-brand-cyan/20 transition-colors"
                  />
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={TRANSITION_FAST}
                        role="alert"
                        className="mt-2 flex items-center gap-1.5 text-sm font-medium text-brand-rose"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errorMsg}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Early beta checkbox */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] px-3.5 py-3 transition-all hover:border-white/[0.08] focus-within:ring-1 focus-within:ring-white/[0.04]">
                  <input
                    type="checkbox"
                    checked={earlyBeta}
                    onChange={(e) => setEarlyBeta(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/10 bg-white/[0.05] accent-brand-cyan"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-brand-purple/70" />
                      <span className="text-sm font-medium text-foreground/80">Early beta access</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-dark leading-relaxed">
                      Get access to unstable builds before the public release
                    </p>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-3.5 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
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
