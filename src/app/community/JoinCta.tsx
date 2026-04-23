"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Heart } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR, tint, brandShadow } from "@/lib/brand-theme";
import { DISCORD_URL } from "./data";

/**
 * Bottom CTA card — gradient brand wash, glowing Users icon, Discord button.
 */
export default function JoinCta() {
  return (
    <SectionWrapper id="join-cta" aria-label="Join the community">
      <motion.div
        variants={fadeUp}
        className="mx-auto max-w-3xl text-center relative"
      >
        <div
          className="relative rounded-3xl border p-10 sm:p-14"
          style={{
            borderColor: "var(--border-glass-hover)",
            backgroundColor: "rgba(var(--surface-overlay), 0.02)",
            backgroundImage: `linear-gradient(135deg, ${tint("purple", 12)} 0%, ${tint("cyan", 10)} 100%)`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{ boxShadow: `inset 0 0 120px ${tint("purple", 15)}` }}
          />
          <div
            className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: tint("purple", 18),
              boxShadow: brandShadow("purple", 48, 35),
            }}
          >
            <Users className="h-7 w-7" style={{ color: BRAND_VAR.purple }} />
          </div>
          <SectionHeading>
            Join the{" "}
            <GradientText className="drop-shadow-lg">conversation</GradientText>
          </SectionHeading>
          <p className="relative mt-6 text-base text-muted-dark leading-relaxed max-w-2xl mx-auto">
            Get help in minutes, share what you&apos;re building, and help
            shape the future of local-first AI agent orchestration.
          </p>
          <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-base font-bold transition-all duration-300"
              style={{
                backgroundColor: tint("purple", 18),
                border: `1px solid ${tint("purple", 45)}`,
                color: BRAND_VAR.purple,
                boxShadow: brandShadow("purple", 32, 25),
              }}
            >
              <Heart className="h-4 w-4" />
              Join Discord
            </a>
            <Link
              href="/#download"
              className="inline-flex items-center gap-2 rounded-full border px-8 py-3 text-base font-medium transition-colors"
              style={{
                borderColor: "var(--border-glass-strong)",
                color: "var(--muted)",
              }}
            >
              Download Personas
            </Link>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
