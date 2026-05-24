import { motion } from "framer-motion";

import { fadeUp } from "@/lib/animations";

import type { Platform } from "./downloadCtaTypes";

export function PlatformPills({
  platforms,
  notifyLabel,
  onWaitlist,
}: {
  platforms: Platform[];
  notifyLabel: string;
  onWaitlist: (platform: Platform) => void;
}) {
  return (
    <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
      {platforms.map((platform) =>
        platform.available ? (
          <div
            key={platform.key}
            className="flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-2 text-base font-medium text-brand-cyan shadow-[0_0_15px_rgba(6,182,212,0.06)] transition-all duration-300"
          >
            <platform.icon className="h-3.5 w-3.5" />
            {platform.label}
            <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_4px_rgba(6,182,212,0.5)]" />
          </div>
        ) : (
          <button
            key={platform.key}
            onClick={() => onWaitlist(platform)}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-glass bg-white/[0.01] px-4 py-2 text-base font-medium text-muted-dark transition-all duration-300 hover:border-brand-purple/20 hover:bg-brand-purple/5 hover:text-brand-purple/80 focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none"
          >
            <platform.icon className="h-3.5 w-3.5" />
            {platform.label}
            <span className="text-base">{notifyLabel}</span>
          </button>
        ),
      )}
    </motion.div>
  );
}
