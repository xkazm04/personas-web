import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Info, Mail, Share2 } from "lucide-react";
import Link from "next/link";
import { AnimatedCheckmark } from "./AnimatedCheckmark";
import type { ShareState, WaitlistStatus } from "./waitlistUtils";

export function WaitlistSuccessPanel({
  status,
  submittedEmail,
  platformLabel,
  earlyBeta,
  shareState,
  shareFallbackUrl,
  onShare,
  onClose,
  labels,
}: {
  status: Extract<WaitlistStatus, "success" | "duplicate">;
  submittedEmail: string;
  platformLabel: string;
  earlyBeta: boolean;
  shareState: ShareState;
  shareFallbackUrl: string;
  onShare: () => void;
  onClose: () => void;
  labels: { duplicate: string; success: string; copied: string; close: string; next: string };
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
      {status === "duplicate" ? (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-cyan/15 ring-1 ring-brand-cyan/20">
          <Info className="h-6 w-6 text-brand-cyan" />
        </div>
      ) : (
        <div className="mx-auto mb-3"><AnimatedCheckmark /></div>
      )}
      <p className="text-base font-medium text-foreground">{status === "duplicate" ? labels.duplicate : labels.success}</p>
      <div className="mx-auto mt-3 flex items-center justify-center gap-2 rounded-lg border border-glass bg-white/[0.02] px-3 py-2">
        <Mail className="h-3.5 w-3.5 shrink-0 text-muted-dark" />
        <span className="truncate text-sm font-medium text-foreground/80">{submittedEmail}</span>
        <span className="shrink-0 rounded-md bg-brand-purple/15 px-1.5 py-0.5 text-xs font-medium text-brand-purple">{platformLabel}</span>
      </div>
      <WaitlistNextSteps status={status} platformLabel={platformLabel} earlyBeta={earlyBeta} nextLabel={labels.next} />
      <button onClick={onClose} className="mt-5 w-full rounded-full border border-glass-hover bg-white/[0.02] px-4 py-2.5 text-base font-medium text-muted transition-colors hover:border-glass-strong hover:text-foreground">
        {labels.close}
      </button>
      <button onClick={onShare} className="mt-2 group relative flex w-full items-center justify-center gap-2 rounded-full bg-white/[0.04] px-4 py-2.5 text-base font-medium text-brand-cyan transition-colors hover:bg-white/[0.08]">
        <Share2 className="h-3.5 w-3.5" />
        <span>Share with a friend</span>
        <AnimatePresence>
          {shareState === "copied" && <CopiedBubble label={labels.copied} />}
        </AnimatePresence>
      </button>
      <ManualCopyAlert shareState={shareState} shareFallbackUrl={shareFallbackUrl} />
    </motion.div>
  );
}

function WaitlistNextSteps({ status, platformLabel, earlyBeta, nextLabel }: { status: "success" | "duplicate"; platformLabel: string; earlyBeta: boolean; nextLabel: string }) {
  // Honest next-steps only: this repo ships NO email pipeline, so nothing here
  // may promise a message. The beta is announced on the public roadmap and on
  // GitHub — both are real, live surfaces, so that is what we point people at.
  const steps: { key: string; node: React.ReactNode }[] = [
    {
      key: "spot",
      node: status === "duplicate"
        ? `Your spot for ${platformLabel} was already saved.`
        : `Your spot for ${platformLabel} is saved.`,
    },
    {
      key: "beta",
      node: earlyBeta
        ? "You opted into early beta, so your entry is flagged for the first build wave."
        : "Your address is only used to size the waitlist - we send no marketing email.",
    },
    {
      key: "where",
      node: (
        <>
          Beta availability is announced on the{" "}
          <Link href="/roadmap" className="text-brand-cyan underline underline-offset-2 hover:text-brand-cyan/80">public roadmap</Link>
          {" "}and on GitHub - watch either for the release.
        </>
      ),
    },
  ];
  return (
    <div className="mt-4 space-y-2.5 text-left">
      <p className="text-sm font-medium text-foreground/70">{nextLabel}</p>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-muted-dark">{index + 1}</span>
            <p className="text-sm leading-relaxed text-muted-dark">{step.node}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CopiedBubble({ label }: { label: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute -top-10 rounded-lg bg-brand-cyan px-2 py-1 text-sm font-bold uppercase tracking-wider text-black shadow-lg shadow-brand-cyan/20">
      {label}
      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-brand-cyan" />
    </motion.div>
  );
}

function ManualCopyAlert({ shareState, shareFallbackUrl }: { shareState: ShareState; shareFallbackUrl: string }) {
  return (
    <AnimatePresence>
      {shareState === "manual" && shareFallbackUrl && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} role="alert" className="mt-2 flex flex-col gap-1.5 rounded-xl border border-brand-amber/40 bg-brand-amber/10 px-3 py-2 text-left">
          <span className="flex items-center gap-1.5 text-sm font-medium text-brand-amber">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Could not copy automatically - copy this link
          </span>
          <input readOnly value={shareFallbackUrl} autoFocus onFocus={(event) => event.currentTarget.select()} onClick={(event) => event.currentTarget.select()} className="w-full truncate rounded-md border border-glass bg-background/60 px-2 py-1 text-sm font-mono text-foreground outline-none focus:border-brand-amber" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
