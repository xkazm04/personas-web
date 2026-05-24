import { motion } from "framer-motion";

import { fadeUp } from "@/lib/animations";

export function DownloadTrustSignals({
  requiresCli,
  installerSize,
}: {
  requiresCli: string;
  installerSize: string;
}) {
  return (
    <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3 text-base text-muted-dark sm:gap-6">
      <span className="flex items-center gap-1.5">
        <div className="h-1 w-1 rounded-full bg-brand-cyan/40" />
        {requiresCli}
      </span>
      <span className="hidden h-3 w-px bg-white/[0.06] sm:inline-block" />
      <span className="flex items-center gap-1.5">
        <div className="h-1 w-1 rounded-full bg-brand-cyan/40" />
        {installerSize}
      </span>
    </motion.div>
  );
}
