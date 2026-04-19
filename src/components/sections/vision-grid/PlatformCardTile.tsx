"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, X } from "lucide-react";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    cardRef.current?.focus();
  }, []);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => closeRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      role="button"
      tabIndex={0}
      onClick={() => setOpen((v) => !v)}
      onKeyDown={(e) => {
        if (
          (e.key === "Enter" || e.key === " ") &&
          e.target === e.currentTarget
        ) {
          e.preventDefault();
          setOpen((v) => !v);
        }
      }}
      aria-expanded={open}
      className="group relative block w-full overflow-hidden rounded-2xl border text-left h-[380px] cursor-pointer transition-all duration-500 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2"
      style={{
        borderColor: "var(--border-glass-hover)",
        backgroundColor: "color-mix(in srgb, var(--background) 70%, transparent)",
      }}
    >
      {/* Branded illustration */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          open ? "opacity-10" : "opacity-60 group-hover:opacity-100"
        }`}
      >
        <Image
          src={card.images.dark}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="hidden dark:block object-cover"
          aria-hidden="true"
        />
        <Image
          src={card.images.light}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="block dark:hidden object-cover"
          aria-hidden="true"
        />
        {/* Theme-aware readability gradient: fades to current --background at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--background) 20%, transparent) 0%, color-mix(in srgb, var(--background) 55%, transparent) 55%, color-mix(in srgb, var(--background) 88%, transparent) 100%)",
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
              textShadow: `0 0 24px ${tint(card.brand, 65)}, 0 2px 12px color-mix(in srgb, var(--background) 80%, transparent)`,
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

      {/* Info panel */}
      <div
        ref={panelRef}
        role="region"
        aria-label={`${card.title} details`}
        className={`absolute inset-x-0 bottom-0 z-20 transition-all duration-500 ease-out ${
          open
            ? "translate-y-0 opacity-100"
            : "translate-y-[70%] opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="m-3 rounded-xl border backdrop-blur-xl p-5 relative"
          style={{
            borderColor: "var(--border-glass-hover)",
            backgroundColor: "color-mix(in srgb, var(--background) 90%, transparent)",
          }}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2"
            style={{ color: brandVar }}
            aria-label={`Close ${card.title} details`}
          >
            <X className="h-4 w-4" />
          </button>

          <p className="text-base text-foreground/90 leading-relaxed mb-4 pr-8">
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
    </motion.div>
  );
}
