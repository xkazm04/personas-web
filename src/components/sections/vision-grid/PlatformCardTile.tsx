"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { PlatformCard } from "./data";

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

interface PlatformCardTileProps {
  card: PlatformCard;
}

export default function PlatformCardTile({ card }: PlatformCardTileProps) {
  const [open, setOpen] = useState(false);
  const brandVar = BRAND_VAR[card.brand];

  return (
    <motion.button
      variants={cardVariants}
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      className="group relative block w-full overflow-hidden rounded-2xl border text-left h-[380px] cursor-pointer transition-all duration-500 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2"
      style={{
        borderColor: "rgba(var(--surface-overlay), 0.08)",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Branded illustration — semi-transparent, full on hover, faded when info open */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          open ? "opacity-10" : "opacity-60 group-hover:opacity-100"
        }`}
      >
        <Image
          src={card.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.88) 100%)",
          }}
        />
      </div>

      {/* Accent color wash */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `radial-gradient(ellipse 75% 55% at 50% 100%, ${tint(card.brand, 30)}, transparent)`,
        }}
      />

      {/* Centered title with hover-only arrow */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5">
        <div className="flex items-center gap-3 transition-all duration-300 group-hover:-translate-y-1">
          <h3
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-center"
            style={{
              color: brandVar,
              textShadow: `0 0 24px ${tint(card.brand, 65)}, 0 2px 12px rgba(0,0,0,0.8)`,
            }}
          >
            {card.title}
          </h3>
          <ArrowRight
            className="h-7 w-7 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
            style={{
              color: brandVar,
              filter: `drop-shadow(0 0 8px ${tint(card.brand, 60)})`,
            }}
          />
        </div>
        <div
          className="mt-3 text-base font-mono uppercase tracking-widest opacity-0 transition-opacity duration-300 group-hover:opacity-70"
          style={{ color: "rgba(var(--surface-overlay), 0.7)" }}
        >
          {open ? "Click to hide" : "Click to reveal"}
        </div>
      </div>

      {/* Info panel — uncovered on click */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 transition-all duration-500 ease-out ${
          open
            ? "translate-y-0 opacity-100"
            : "translate-y-[70%] opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="m-3 rounded-xl border backdrop-blur-xl p-5"
          style={{
            borderColor: "rgba(var(--surface-overlay), 0.10)",
            backgroundColor: "rgba(var(--background-rgb, 10,10,18), 0.9)",
          }}
        >
          <p className="text-base text-foreground/90 leading-relaxed mb-4">
            {card.description}
          </p>
          <ul className="space-y-2 mb-4">
            {card.details.map((d) => (
              <li
                key={d}
                className="flex items-start gap-2 text-base text-foreground/75"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: brandVar }}
                />
                <span className="leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
          {card.guideTopics?.map((gt) => (
            <Link
              key={gt.topic}
              href={`/guide/${gt.category}/${gt.topic}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-base font-medium transition-opacity hover:opacity-80"
              style={{ color: brandVar }}
            >
              <BookOpen className="h-4 w-4" />
              <span>{gt.label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </motion.button>
  );
}
