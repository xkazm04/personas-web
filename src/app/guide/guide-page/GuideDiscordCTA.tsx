import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";

import { fadeUp } from "@/lib/animations";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { DISCORD_INVITE_URL } from "@/lib/constants";

export function GuideDiscordCTA({
  title,
  subtitle,
  ctaLabel,
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="mt-16 mx-auto max-w-3xl"
    >
      <div
        className="flex flex-col items-center gap-5 rounded-2xl border p-8 sm:flex-row sm:gap-6"
        style={{
          borderColor: "var(--border-glass-hover)",
          backgroundColor: "rgba(var(--surface-overlay), 0.02)",
          backgroundImage: `linear-gradient(135deg, ${tint("purple", 10)} 0%, transparent 60%)`,
        }}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: tint("purple", 18),
            boxShadow: brandShadow("purple", 32, 28),
          }}
        >
          <MessageCircle
            className="h-5 w-5"
            style={{ color: BRAND_VAR.purple }}
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-lg font-bold" style={{ color: BRAND_VAR.purple }}>
            {title}
          </p>
          <p className="mt-1 text-base text-foreground/75">{subtitle}</p>
        </div>
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-base font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{
            color: BRAND_VAR.purple,
            backgroundColor: tint("purple", 14),
            border: `1px solid ${tint("purple", 35)}`,
          }}
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );
}
