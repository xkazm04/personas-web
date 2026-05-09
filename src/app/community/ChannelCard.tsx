"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { BRAND_VAR, tint, brandShadow } from "@/lib/brand-theme";
import { fadeUp } from "@/lib/animations";
import type { CommunityChannel } from "./data";

interface ChannelCardProps {
  channel: CommunityChannel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const Icon = channel.icon;
  const bv = BRAND_VAR[channel.brand];

  const cardClass =
    "group relative flex flex-col h-full overflow-hidden rounded-2xl border p-7 transition-all duration-500 hover:scale-[1.01]";
  const cardStyle = {
    borderColor: "var(--border-glass-hover)",
    backgroundColor: "rgba(var(--surface-overlay), 0.02)",
    backgroundImage: `linear-gradient(135deg, ${tint(channel.brand, 14)} 0%, transparent 55%)`,
  };

  const inner = (
    <>
      {/* Ambient accent */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl opacity-50 transition-opacity duration-500 group-hover:opacity-80"
        style={{ backgroundColor: tint(channel.brand, 25) }}
      />

      <div className="relative flex items-start justify-between gap-3 mb-5">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: tint(channel.brand, 18),
            boxShadow: brandShadow(channel.brand, 32, 30),
          }}
        >
          <Icon className="h-6 w-6" style={{ color: bv }} />
        </div>
        <span
          className="rounded-full px-3 py-1 text-base font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: tint(channel.brand, 12),
            color: bv,
          }}
        >
          {channel.stat}
        </span>
      </div>

      <h3
        className="relative text-2xl font-extrabold tracking-tight mb-3 flex items-center gap-2"
        style={{
          color: bv,
          textShadow: `0 0 24px ${tint(channel.brand, 30)}`,
        }}
      >
        {channel.title}
        {channel.external && (
          <ExternalLink
            className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: bv }}
          />
        )}
      </h3>

      <p className="relative text-base text-muted-dark leading-relaxed flex-1 mb-5">
        {channel.description}
      </p>

      <div
        className="relative flex items-center gap-1.5 text-base font-semibold transition-transform group-hover:translate-x-0.5"
        style={{ color: bv }}
      >
        {channel.cta}
        <ArrowRight className="h-4 w-4" />
      </div>
    </>
  );

  return (
    <motion.div variants={fadeUp}>
      {channel.external ? (
        <a
          href={channel.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClass}
          style={cardStyle}
        >
          {inner}
        </a>
      ) : (
        <Link href={channel.href} className={cardClass} style={cardStyle}>
          {inner}
        </Link>
      )}
    </motion.div>
  );
}
