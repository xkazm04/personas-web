import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Bell, Sparkles } from "lucide-react";
import { TRANSITION_FAST } from "@/lib/animations";
import type { WaitlistStatus } from "./waitlistUtils";

export function WaitlistForm({
  email,
  setEmail,
  earlyBeta,
  setEarlyBeta,
  errorMsg,
  setErrorMsg,
  status,
  onSubmit,
  labels,
}: {
  email: string;
  setEmail: (email: string) => void;
  earlyBeta: boolean;
  setEarlyBeta: (enabled: boolean) => void;
  errorMsg: string;
  setErrorMsg: (message: string) => void;
  status: WaitlistStatus;
  onSubmit: (event: React.FormEvent) => void;
  labels: {
    emailPlaceholder: string;
    earlyBeta: string;
    joining: string;
    notifyMe: string;
  };
}) {
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div>
        <label htmlFor="waitlist-email" className="sr-only">{labels.emailPlaceholder}</label>
        <input
          id="waitlist-email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrorMsg("");
          }}
          placeholder={labels.emailPlaceholder}
          required
          autoFocus
          className="w-full rounded-xl border border-glass bg-white/[0.03] px-4 py-3 text-base text-foreground placeholder:text-muted-dark focus:border-brand-cyan/30 focus:outline-none focus:ring-1 focus:ring-brand-cyan/20 transition-colors"
        />
        <AnimatePresence>
          {errorMsg && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={TRANSITION_FAST} role="alert" className="mt-2 flex items-center gap-1.5 text-sm font-medium text-brand-rose">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-glass bg-white/[0.015] px-3.5 py-3 transition-all hover:border-glass-hover focus-within:ring-1 focus-within:ring-white/[0.04]">
        <input type="checkbox" checked={earlyBeta} onChange={(event) => setEarlyBeta(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-glass-hover bg-white/[0.05] accent-brand-cyan" />
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-brand-purple/70" />
            <span className="text-sm font-medium text-foreground/80">{labels.earlyBeta}</span>
          </div>
          <p className="mt-0.5 text-sm text-muted-dark leading-relaxed">Get access to unstable builds before the public release</p>
        </div>
      </label>
      <button type="submit" disabled={status === "loading"} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-3.5 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">
        {status === "loading" ? <Spinner /> : <Bell className="h-4 w-4" />}
        {status === "loading" ? labels.joining : labels.notifyMe}
      </button>
    </form>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
