"use client";

import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Users, Sparkles, Share2, AlertCircle, Info, Mail } from "lucide-react";
import { TRANSITION_FAST, TRANSITION_NORMAL } from "@/lib/animations";
import * as Sentry from "@sentry/nextjs";

const FETCH_TIMEOUT_MS = 15_000;

/** Basic RFC 5322 email pattern — intentionally simple to avoid ReDoS */
const EMAIL_RE = /^[^\s@<>'"`;(){}[\]\\]+@[^\s@<>'"`;(){}[\]\\]+\.[a-zA-Z]{2,}$/;

type PlatformKey = "windows" | "macos" | "linux";

// Legacy textarea + execCommand fallback for clipboard.writeText() rejections
// (HTTP previews, sandboxed iframes, Safari without an active gesture chain).
function legacyCopyToClipboard(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function AnimatedCheckmark() {
  return (
    <motion.svg
      viewBox="0 0 52 52"
      className="h-12 w-12"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-brand-emerald/60"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <motion.path
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 27l7 7 13-13"
        className="text-brand-emerald"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.35, delay: 0.3, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

interface WaitlistModalProps {
  platformKey: PlatformKey;
  platformLabel: string;
  platformIcon: React.ComponentType<{ className?: string }>;
  open: boolean;
  onClose: () => void;
}

export default function WaitlistModal({
  platformKey,
  platformLabel,
  platformIcon: PlatformIcon,
  open,
  onClose,
}: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [earlyBeta, setEarlyBeta] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied" | "manual">("idle");
  const [shareFallbackUrl, setShareFallbackUrl] = useState("");

  const submitAbortRef = useRef<AbortController | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const fetchCount = useCallback(async (signal: AbortSignal) => {
    try {
      const res = await fetch("/api/waitlist", { signal });
      if (res.ok) {
        const data = await res.json();
        const count = data.counts?.[platformKey] ?? 0;
        setWaitlistCount(count);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Non-critical — just hide the count
    }
  }, [platformKey]);

  // Reset form state on open transition — render-phase prev-state pattern
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setStatus("idle");
      setEmail("");
      setSubmittedEmail("");
      setEarlyBeta(false);
      setErrorMsg("");
      setShareState("idle");
      setShareFallbackUrl("");
    }
  }

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
    queueMicrotask(() => fetchCount(controller.signal));
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

    // Show the loading spinner branch (the existing disabled+spinner UI is
    // already wired to status === "loading"). Don't set submittedEmail or
    // increment the count until the server confirms — otherwise a 4xx /
    // 429 / network failure would leave the user with a "You're on the
    // list" panel they can screenshot/share even though no row was written.
    setStatus("loading");
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
        body: JSON.stringify({ email, platform: platformKey, earlyBeta }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          (typeof data.error === "string" && data.error) ||
            "Failed to join waitlist",
        );
      }

      // Server confirmed — only now flip to the success/duplicate panel.
      setSubmittedEmail(email.trim());
      if (data.duplicate) {
        setStatus("duplicate");
      } else {
        setStatus("success");
        setWaitlistCount((prev) => (prev !== null ? prev + 1 : 1));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      Sentry.captureException(err, { tags: { component: "WaitlistModal" } });

      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      clearTimeout(timeout);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}?ref=waitlist&platform=${platformKey}`;

    // 1) Modern async Clipboard API (https + secure context).
    try {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      setShareFallbackUrl("");
      setTimeout(
        () => setShareState((s) => (s === "copied" ? "idle" : s)),
        2000,
      );
      return;
    } catch {
      // Fall through — insecure context, denied permission, or Safari without
      // an active gesture chain. Try the legacy path before giving up.
    }

    // 2) Legacy textarea + execCommand("copy").
    if (legacyCopyToClipboard(url)) {
      setShareState("copied");
      setShareFallbackUrl("");
      setTimeout(
        () => setShareState((s) => (s === "copied" ? "idle" : s)),
        2000,
      );
      return;
    }

    // 3) Both failed — surface the URL so the user can copy it manually.
    setShareFallbackUrl(url);
    setShareState("manual");
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
            className="relative w-full max-w-[440px] rounded-2xl border border-glass bg-background p-6 shadow-[0_0_80px_rgba(0,0,0,0.5)]"
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
                  Personas for {platformLabel}
                </h3>
                <p className="text-sm text-muted-dark">Coming soon</p>
              </div>
            </div>

            {/* Social proof */}
            {waitlistCount !== null && waitlistCount > 0 && (
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-glass bg-white/[0.02] px-3 py-2">
                <Users className="h-3.5 w-3.5 text-brand-cyan/60" />
                <span className="text-sm text-muted-dark">
                  Join <span className="font-medium text-brand-cyan">{waitlistCount}</span>{" "}
                  {waitlistCount === 1 ? "person" : "others"} waiting for {platformLabel}
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
                {status === "duplicate" ? (
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-cyan/15 ring-1 ring-brand-cyan/20">
                    <Info className="h-6 w-6 text-brand-cyan" />
                  </div>
                ) : (
                  <div className="mx-auto mb-3">
                    <AnimatedCheckmark />
                  </div>
                )}
                <p className="text-base font-medium text-foreground">
                  {status === "duplicate" ? "Already on the list!" : "You\u2019re on the list!"}
                </p>

                {/* Email echo */}
                <div className="mx-auto mt-3 flex items-center justify-center gap-2 rounded-lg border border-glass bg-white/[0.02] px-3 py-2">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-dark" />
                  <span className="truncate text-sm font-medium text-foreground/80">{submittedEmail}</span>
                  <span className="shrink-0 rounded-md bg-brand-purple/15 px-1.5 py-0.5 text-xs font-medium text-brand-purple">
                    {platformLabel}
                  </span>
                </div>

                {/* What happens next */}
                <div className="mt-4 space-y-2.5 text-left">
                  <p className="text-sm font-medium text-foreground/70">What happens next</p>
                  <div className="space-y-2">
                    {[
                      status === "duplicate"
                        ? `We already have your spot saved for ${platformLabel}.`
                        : `We\u2019ll email you at this address when the ${platformLabel} beta is ready.`,
                      earlyBeta
                        ? "You opted into early beta \u2014 you\u2019ll be among the first to get access."
                        : "No spam, just one email when it\u2019s time.",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-muted-dark">
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed text-muted-dark">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="mt-5 w-full rounded-full border border-glass-hover bg-white/[0.02] px-4 py-2.5 text-base font-medium text-muted transition-colors hover:border-glass-strong hover:text-foreground"
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
                    {shareState === "copied" && (
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

                <AnimatePresence>
                  {shareState === "manual" && shareFallbackUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      role="alert"
                      className="mt-2 flex flex-col gap-1.5 rounded-xl border border-brand-amber/40 bg-brand-amber/10 px-3 py-2 text-left"
                    >
                      <span className="flex items-center gap-1.5 text-sm font-medium text-brand-amber">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        Couldn’t copy automatically — copy this link
                      </span>
                      <input
                        readOnly
                        value={shareFallbackUrl}
                        autoFocus
                        onFocus={(e) => e.currentTarget.select()}
                        onClick={(e) => e.currentTarget.select()}
                        className="w-full truncate rounded-md border border-glass bg-background/60 px-2 py-1 text-sm font-mono text-foreground outline-none focus:border-brand-amber"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
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
                    className="w-full rounded-xl border border-glass bg-white/[0.03] px-4 py-3 text-base text-foreground placeholder:text-muted-dark focus:border-brand-cyan/30 focus:outline-none focus:ring-1 focus:ring-brand-cyan/20 transition-colors"
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
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-glass bg-white/[0.015] px-3.5 py-3 transition-all hover:border-glass-hover focus-within:ring-1 focus-within:ring-white/[0.04]">
                  <input
                    type="checkbox"
                    checked={earlyBeta}
                    onChange={(e) => setEarlyBeta(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-glass-hover bg-white/[0.05] accent-brand-cyan"
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
