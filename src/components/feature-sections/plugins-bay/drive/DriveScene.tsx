"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HardDrive, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import { useBeat } from "../shared/useBeat";
import DriveBrowser from "./DriveBrowser";
import DriveDrawer from "./DriveDrawer";
import { DRIVE_STILL, FILES, VERSIONS, driveAt } from "./driveData";
import { featuresSectionsCopy } from "@/i18n/pending/featuresSections";

const E = "var(--brand-emerald)";
const mix = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`;
const BEAT_MS = 1000;

/**
 * Drive at work, true to the catalog row (local_drive): agent exports land
 * in a managed local drive in the app's data directory, survive app
 * upgrades, and are browsable in the Drive plugin. Five agents' files drop
 * into the drawer and appear in the browser; then the app updates and every
 * file stays.
 */
export default function DriveScene() {
  const { language } = useTranslation();
  const copy = featuresSectionsCopy.plugins.drive;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { step, run } = useBeat(rootRef, BEAT_MS, DRIVE_STILL);
  const { landed, updating, updated } = driveAt(step);
  const version = updated || updating ? VERSIONS.after : VERSIONS.before;

  const status = updated
    ? fillTemplate(copy.statusKept, { version })
    : updating
      ? fillTemplate(copy.statusUpdating, { version })
      : fillTemplate(copy.statusLanding, { count: landed, total: FILES.length });

  return (
    <div ref={rootRef} className="flex h-full flex-col px-5 pb-4 pt-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: mix(E, 45), background: mix(E, 12) }}>
          <HardDrive className="h-[18px] w-[18px]" style={{ color: E }} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="text-[17px] font-semibold leading-tight text-foreground">{copy.title}</div>
          <div className="font-mono text-[14px] text-foreground/65">{copy.where}</div>
        </div>
        <div className="ml-auto flex items-center gap-3 font-mono text-[14px]">
          <span className="relative flex h-8 min-w-[64px] items-center justify-center overflow-hidden rounded-lg border px-2.5 font-semibold" style={{ borderColor: mix(E, updating ? 70 : 30), color: E }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={version}
                initial={run ? { y: 18, opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: run ? 0.35 : 0 }}
              >
                {version}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="tabular-nums text-foreground">
            {fillTemplate(copy.files, { count: landed.toLocaleString(language) })}
          </span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1.12fr_1fr] gap-3">
        <div className="relative flex min-h-0 items-center overflow-hidden rounded-2xl border px-2" style={{ borderColor: mix(E, 22), background: `radial-gradient(circle at 50% 30%, ${mix(E, 10)}, transparent 70%)` }}>
          <DriveDrawer landed={landed} updating={updating} updated={updated} run={run} />
        </div>
        <DriveBrowser landed={landed} updated={updated} />
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-[13px] uppercase tracking-[0.16em] text-foreground/65">
        <span aria-live="off">{status}</span>
        <span className="flex items-center gap-2" style={{ color: E }}>
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {copy.survives}
        </span>
      </div>
    </div>
  );
}
