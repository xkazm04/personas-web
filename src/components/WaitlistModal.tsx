"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Sentry from "@sentry/nextjs";
import { TRANSITION_FAST, TRANSITION_NORMAL } from "@/lib/animations";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/bodyScrollLock";
import { useTranslation } from "@/i18n/useTranslation";
import { WaitlistForm } from "./waitlist-modal/WaitlistForm";
import { WaitlistHeader } from "./waitlist-modal/WaitlistHeader";
import { WaitlistSuccessPanel } from "./waitlist-modal/WaitlistSuccessPanel";
import { EMAIL_RE, FETCH_TIMEOUT_MS, legacyCopyToClipboard, type PlatformKey, type ShareState, type WaitlistStatus } from "./waitlist-modal/waitlistUtils";

interface WaitlistModalProps {
  platformKey: PlatformKey;
  platformLabel: string;
  platformIcon: React.ComponentType<{ className?: string }>;
  open: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ platformKey, platformLabel, platformIcon, open, onClose }: WaitlistModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [earlyBeta, setEarlyBeta] = useState(false);
  const [status, setStatus] = useState<WaitlistStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [shareFallbackUrl, setShareFallbackUrl] = useState("");
  const submitAbortRef = useRef<AbortController | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const fetchCount = useCallback(async (signal: AbortSignal) => {
    try {
      const res = await fetch("/api/waitlist", { signal });
      if (res.ok) {
        const data = await res.json();
        setWaitlistCount(data.counts?.[platformKey] ?? 0);
      }
    } catch (err) {
      // Swallow aborts (close/re-open); report genuine failures. The header
      // degrades gracefully by leaving `waitlistCount` null.
      if (err instanceof DOMException && err.name === "AbortError") return;
      Sentry.captureException(err, { tags: { component: "WaitlistModal" } });
    }
  }, [platformKey]);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) resetModalState({ setStatus, setEmail, setSubmittedEmail, setEarlyBeta, setErrorMsg, setShareState, setShareFallbackUrl });
  }

  useWaitlistFocusAndKeys({ open, onClose, fetchCount, modalRef, previousFocusRef });
  useEffect(() => {
    if (!open) {
      submitAbortRef.current?.abort();
      submitAbortRef.current = null;
      return;
    }
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    submitAbortRef.current?.abort();
    const controller = new AbortController();
    submitAbortRef.current = controller;
    // Distinguish a timeout-abort (user needs feedback + retry) from a
    // close/re-submit abort (silence is correct).
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, FETCH_TIMEOUT_MS);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, platform: platformKey, earlyBeta }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((typeof data.error === "string" && data.error) || "Failed to join waitlist");
      setSubmittedEmail(email.trim());
      if (data.duplicate) setStatus("duplicate");
      else {
        setStatus("success");
        setWaitlistCount((prev) => (prev !== null ? prev + 1 : 1));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Timeout: the form would otherwise sit on "Joining…" forever with no
        // recovery. Surface an error + retry. A close/re-submit abort stays silent.
        if (timedOut) {
          setStatus("error");
          setErrorMsg("Request timed out — please try again");
        }
        return;
      }
      Sentry.captureException(err, { tags: { component: "WaitlistModal" } });
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      clearTimeout(timeout);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}?ref=waitlist&platform=${platformKey}`;
    try {
      await navigator.clipboard.writeText(url);
      markCopied(setShareState, setShareFallbackUrl);
      return;
    } catch {}
    if (legacyCopyToClipboard(url)) {
      markCopied(setShareState, setShareFallbackUrl);
      return;
    }
    setShareFallbackUrl(url);
    setShareState("manual");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION_FAST} className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="waitlist-modal-title" initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={TRANSITION_NORMAL} onClick={(event) => event.stopPropagation()} className="relative w-full max-w-[440px] rounded-2xl border border-glass bg-background p-6 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
            <WaitlistHeader platformLabel={platformLabel} PlatformIcon={platformIcon} count={waitlistCount} comingSoon={t.pricing.comingSoon} peopleWaiting={t.waitlist.peopleWaiting} closeLabel={t.common.close} onClose={onClose} />
            {status === "success" || status === "duplicate" ? (
              <WaitlistSuccessPanel status={status} submittedEmail={submittedEmail} platformLabel={platformLabel} earlyBeta={earlyBeta} shareState={shareState} shareFallbackUrl={shareFallbackUrl} onShare={handleShare} onClose={onClose} labels={{ duplicate: t.waitlist.duplicate, success: t.waitlist.success, copied: t.waitlist.copied, close: t.common.close, next: t.common.next }} />
            ) : (
              <WaitlistForm email={email} setEmail={setEmail} earlyBeta={earlyBeta} setEarlyBeta={setEarlyBeta} errorMsg={errorMsg} setErrorMsg={setErrorMsg} status={status} onSubmit={handleSubmit} labels={{ emailPlaceholder: t.waitlist.emailPlaceholder, earlyBeta: t.waitlist.earlyBeta, joining: t.waitlist.joining, notifyMe: t.common.notifyMe }} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function useWaitlistFocusAndKeys({ open, onClose, fetchCount, modalRef, previousFocusRef }: { open: boolean; onClose: () => void; fetchCount: (signal: AbortSignal) => Promise<void>; modalRef: React.RefObject<HTMLDivElement | null>; previousFocusRef: React.RefObject<HTMLElement | null> }) {
  useEffect(() => {
    if (!open) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement;
    const controller = new AbortController();
    queueMicrotask(() => fetchCount(controller.signal));
    return () => controller.abort();
  }, [open, fetchCount, previousFocusRef]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && modalRef.current) trapFocus(event, modalRef.current);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, modalRef]);
}

function trapFocus(event: KeyboardEvent, modal: HTMLDivElement) {
  const focusable = modal.querySelectorAll<HTMLElement>('a, button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return;
  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function resetModalState(setters: { setStatus: (status: WaitlistStatus) => void; setEmail: (email: string) => void; setSubmittedEmail: (email: string) => void; setEarlyBeta: (enabled: boolean) => void; setErrorMsg: (message: string) => void; setShareState: (state: ShareState) => void; setShareFallbackUrl: (url: string) => void }) {
  setters.setStatus("idle");
  setters.setEmail("");
  setters.setSubmittedEmail("");
  setters.setEarlyBeta(false);
  setters.setErrorMsg("");
  setters.setShareState("idle");
  setters.setShareFallbackUrl("");
}

function markCopied(setShareState: (state: ShareState | ((state: ShareState) => ShareState)) => void, setShareFallbackUrl: (url: string) => void) {
  setShareState("copied");
  setShareFallbackUrl("");
  setTimeout(() => setShareState((state) => (state === "copied" ? "idle" : state)), 2000);
}
