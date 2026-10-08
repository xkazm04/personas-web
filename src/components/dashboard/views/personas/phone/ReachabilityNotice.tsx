"use client";

import { useState } from "react";
import { Download, KeyRound, MonitorOff } from "lucide-react";
import { useI18nStore } from "@/stores/i18nStore";
import { DashLink } from "@/components/dashboard/spa/navigate";
import { browserShareCapabilities, handoffUrl, shareOrCopy, type ShareOutcome } from "@/components/mobile-landing/shared/handoff";
import { formatDue } from "@/lib/review-sla";
import { lastSeenMs, showsDownloadCta } from "@/lib/sync/reachability";
import type { SyncReachability } from "@/hooks/useSyncReachability";
import { mobileCopy } from "@/i18n/pending/mobile";

const CARD = "rounded-2xl border p-4";

/** "Send the download to my computer": the phone cannot install the app, so it hands the link over (PLAN M8). */
function DownloadHandoff() {
  const copy = mobileCopy.reach;
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null);
  const [url, setUrl] = useState("");

  const onShare = async () => {
    const link = handoffUrl(window.location.origin);
    setUrl(link);
    setOutcome(await shareOrCopy({ url: link, title: "Personas", text: copy.demoBody }, browserShareCapabilities()));
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => void onShare()}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-cyan/15 px-4 text-base font-medium text-foreground transition-colors hover:bg-brand-cyan/25 focus-visible:outline-2 focus-visible:outline-brand-cyan"
      >
        <Download aria-hidden className="h-4 w-4 text-brand-cyan" />
        {copy.downloadCta}
      </button>
      <p aria-live="polite" className="mt-2 text-sm text-muted-dark">
        {outcome === "copied" ? copy.linkCopied : outcome === "failed" ? copy.shareFailed.replace("{url}", url) : ""}
      </p>
    </div>
  );
}

/**
 * The tier banner above the phone persona list (PHASE2-SPEC.md 4.3, PLAN M7
 * + M12): offline says "open Personas on your computer" and never offers a
 * download; never-synced (and the anonymous demo) offer the download; an
 * online but unpaired browser is pointed at pairing; online shows nothing.
 */
export default function ReachabilityNotice({ reach }: { reach: SyncReachability }) {
  const language = useI18nStore((s) => s.language);
  const copy = mobileCopy.reach;
  const { tier, device, now } = reach;

  if (tier === "offline") {
    const seen = device ? lastSeenMs(device) : null;
    return (
      <section aria-labelledby="reach-offline" className={`${CARD} border-amber-500/25 bg-amber-500/10`}>
        <h2 id="reach-offline" className="flex items-center gap-2 text-base font-semibold text-foreground">
          <MonitorOff aria-hidden className="h-4 w-4 flex-none text-brand-amber" />
          {copy.offlineTitle.replace("{device}", device?.name ?? copy.yourComputer)}
        </h2>
        {seen !== null && (
          <p className="mt-1 text-sm text-muted">{copy.offlineBody.replace("{ago}", formatDue(seen - now, language))}</p>
        )}
      </section>
    );
  }

  if (tier === "online-unpaired") {
    return (
      <section aria-labelledby="reach-unpaired" className={`${CARD} border-brand-cyan/25 bg-brand-cyan/5`}>
        <h2 id="reach-unpaired" className="flex items-center gap-2 text-base font-semibold text-foreground">
          <KeyRound aria-hidden className="h-4 w-4 flex-none text-brand-cyan" />
          {copy.unpairedTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{copy.unpairedBody}</p>
        <DashLink
          href="/dashboard/settings"
          className="mt-3 inline-flex min-h-[44px] items-center rounded-xl border border-glass-hover px-4 text-base font-medium text-foreground focus-visible:outline-2 focus-visible:outline-brand-cyan"
        >
          {copy.unpairedCta}
        </DashLink>
      </section>
    );
  }

  if (showsDownloadCta(tier)) {
    const demo = tier === "demo";
    return (
      <section aria-labelledby="reach-download" className={`${CARD} border-glass bg-white/[0.02]`}>
        <h2 id="reach-download" className="text-base font-semibold text-foreground">
          {demo ? copy.demoTitle : copy.neverTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{demo ? copy.demoBody : copy.neverBody}</p>
        <DownloadHandoff />
      </section>
    );
  }

  return null;
}
