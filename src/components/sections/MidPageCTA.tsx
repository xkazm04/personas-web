"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Apple, Terminal, BookOpen } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { trackDownloadClick } from "@/lib/analytics";
import Link from "next/link";
import PrimaryCTA from "@/components/PrimaryCTA";
import WaitlistModal from "@/components/WaitlistModal";

const waitlistPlatforms = [
  { icon: Apple, label: "macOS" },
  { icon: Terminal, label: "Linux" },
] as const;

export default function MidPageCTA() {
  const [waitlistPlatform, setWaitlistPlatform] = useState<
    (typeof waitlistPlatforms)[number] | null
  >(null);

  return (
    <section className="relative border-t border-primary/5 py-12">
      <motion.div
        className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 px-6 sm:flex-row"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div variants={fadeUp}>
          <PrimaryCTA href="#" icon={Download} label="Download for Windows" variant="solid" onClick={() => trackDownloadClick("windows_mid")} />
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-3">
          {waitlistPlatforms.map((p) => (
            <button
              key={p.label}
              onClick={() => setWaitlistPlatform(p)}
              className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-6 py-3 text-sm font-medium text-muted-dark transition-colors duration-300 hover:border-brand-purple/20 hover:bg-brand-purple/5 hover:text-brand-purple/80"
            >
              <p.icon className="h-4 w-4" />
              <span>{p.label}</span>
              <span className="text-sm text-muted-dark">notify me</span>
            </button>
          ))}
        </motion.div>

        <motion.div variants={fadeUp}>
          <Link
            href="/guide"
            className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-6 py-3 text-sm font-medium text-muted-dark transition-colors duration-300 hover:border-brand-cyan/20 hover:bg-brand-cyan/5 hover:text-brand-cyan/80"
          >
            <BookOpen className="h-4 w-4" />
            Browse the Guide
          </Link>
        </motion.div>
      </motion.div>

      {waitlistPlatform && (
        <WaitlistModal
          platform={waitlistPlatform.label}
          platformIcon={waitlistPlatform.icon}
          open={!!waitlistPlatform}
          onClose={() => setWaitlistPlatform(null)}
        />
      )}
    </section>
  );
}
