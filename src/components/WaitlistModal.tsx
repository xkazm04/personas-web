"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Sentry from "@sentry/nextjs";
import { TRANSITION_FAST, TRANSITION_NORMAL } from "@/lib/animations";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/bodyScrollLock";
import { useTranslation } from "@/i18n/useTranslation";
import { trackWaitlistOpen, trackWaitlistResult, trackWaitlistSubmit, type WaitlistEntryPoint } from "@/lib/analytics";
import { WaitlistForm } from "./waitlist-modal/WaitlistForm";
import { WaitlistHeader } from "./waitlist-modal/WaitlistHeader";
import { WaitlistSuccessPanel } from "./waitlist-modal/WaitlistSuccessPanel";
import { loadWaitlistCounts, primeWaitlistCount } from "./waitlist-modal/waitlistCounts";
import { markCopied, resetModalState, useWaitlistFocusAndKeys } from "./waitlist-modal/waitlistModalShell";
import { waitlistErrorLabels, waitlistFormLabels, waitlistHeaderLabels, waitlistPanelLabels } from "./waitlist-modal/waitlistLabels";
import { EMAIL_RE, FETCH_TIMEOUT_MS, legacyCopyToClipboard, waitlistErrorMessage, type PlatformKey, type ShareState, type WaitlistStatus } from "./waitlist-modal/waitlistUtils";

interface WaitlistModalProps {
  platformKey: PlatformKey;
  platformLabel: string;
  platformIcon: React.ComponentType<{ className?: string }>;
  open: boolean;
  onClose: () => void;
  /** Which surface opened this modal — reported with every waitlist event. */
  entryPoint: WaitlistEntryPoint;
}

export default function WaitlistModal({ platformKey, platformLabel, platformIcon, open, onClose, entryPoint }: WaitlistModalProps) {
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
      const counts = await loadWaitlistCounts();
      // The shared request is not aborted (another mount may still want it);
      // the signal only decides whether THIS instance applies the result.
      if (signal.aborted || !counts) return;
      setWaitlistCount(counts[platformKey] ?? 0);
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
    if (open) trackWaitlistOpen(platformKey, entryPoint);
  }, [open, platformKey, entryPoint]);
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
      setErrorMsg(t.waitlist.invalidEmail);
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    trackWaitlistSubmit(platformKey, entryPoint);
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
      if (!res.ok) {
        // The route's `error` prose is English-only and describes server
        // internals, so it is never rendered — the stable `code` (status as
        // fallback) picks a translated sentence instead. The Sentry title stays
        // machine-readable and carries no email.
        const code = typeof data.code === "string" ? data.code : "none";
        Sentry.captureException(new Error(`waitlist POST failed (status=${res.status}, code=${code})`), { tags: { component: "WaitlistModal" } });
        setStatus("error");
        setErrorMsg(waitlistErrorMessage(res.status, data.code, waitlistErrorLabels(t)));
        return;
      }
      setSubmittedEmail(email.trim());
      trackWaitlistResult(platformKey, entryPoint, data.duplicate ? "duplicate" : "success");
      if (data.duplicate) setStatus("duplicate");
      else {
        setStatus("success");
        // Prefer the authoritative post-insert count the route returns; the
        // optimistic +1 is only a fallback for responses that omit it.
        const serverCount = typeof data.count === "number" ? data.count : null;
        if (serverCount !== null) primeWaitlistCount(platformKey, serverCount);
        setWaitlistCount((prev) => (serverCount ?? (prev !== null ? prev + 1 : 1)));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Timeout: the form would otherwise sit on "Joining…" forever with no
        // recovery. Surface an error + retry. A close/re-submit abort stays silent.
        if (timedOut) {
          setStatus("error");
          setErrorMsg(t.waitlist.errorTimeout);
        }
        return;
      }
      Sentry.captureException(err, { tags: { component: "WaitlistModal" } });
      setStatus("error");
      // Transport/parse failures carry no server code — always the generic line.
      setErrorMsg(t.waitlist.errorGeneric);
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
          <motion.div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="waitlist-modal-title" initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={TRANSITION_NORMAL} onClick={(event) => event.stopPropagation()} className="relative w-full max-w-[440px] rounded-2xl border border-glass bg-background p-6 shadow-2xl">
            <WaitlistHeader {...waitlistHeaderLabels(t, platformLabel)} PlatformIcon={platformIcon} count={waitlistCount} onClose={onClose} />
            {status === "success" || status === "duplicate" ? (
              <WaitlistSuccessPanel status={status} submittedEmail={submittedEmail} platformLabel={platformLabel} earlyBeta={earlyBeta} shareState={shareState} shareFallbackUrl={shareFallbackUrl} onShare={handleShare} onClose={onClose} labels={waitlistPanelLabels(t)} />
            ) : (
              <WaitlistForm email={email} setEmail={setEmail} earlyBeta={earlyBeta} setEarlyBeta={setEarlyBeta} errorMsg={errorMsg} setErrorMsg={setErrorMsg} status={status} onSubmit={handleSubmit} labels={waitlistFormLabels(t)} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
