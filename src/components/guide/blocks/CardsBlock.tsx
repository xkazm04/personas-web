"use client";

import { type ReactNode } from "react";

export interface CardItem {
  status: "available" | "roadmap" | "disabled";
  title: string;
  description: ReactNode;
  imageBase?: string;
  badge?: string;
}

interface CardsBlockProps {
  items: CardItem[];
}

const STATUS_STYLES: Record<
  CardItem["status"],
  { wrapper: string; image: string; badge: string | null }
> = {
  available: {
    wrapper:
      "border-glass hover:border-glass-strong hover:bg-white/[0.04] transition-colors",
    image: "",
    badge: null,
  },
  roadmap: {
    wrapper: "border-glass/60 opacity-70",
    image: "grayscale",
    badge: "Roadmap",
  },
  disabled: {
    wrapper: "border-glass/40 opacity-50",
    image: "grayscale",
    badge: "Coming soon",
  },
};

export function CardsBlock({ items }: CardsBlockProps) {
  if (items.length === 0) return null;
  return (
    <div className="my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => {
        const style = STATUS_STYLES[item.status];
        const badgeLabel = item.badge ?? style.badge;
        return (
          <div
            key={index}
            className={`relative flex flex-col overflow-hidden rounded-xl border bg-white/[0.02] ${style.wrapper}`}
          >
            {item.imageBase && (
              <div className={`relative aspect-[4/3] overflow-hidden bg-black/20 ${style.image}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${item.imageBase}-dark.png`}
                  alt=""
                  aria-hidden="true"
                  className="hidden dark:block absolute inset-0 h-full w-full object-cover"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${item.imageBase}-light.png`}
                  alt=""
                  aria-hidden="true"
                  className="block dark:hidden absolute inset-0 h-full w-full object-cover"
                />
              </div>
            )}
            {badgeLabel && (
              <span className="absolute right-3 top-3 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
                {badgeLabel}
              </span>
            )}
            <div className="flex flex-1 flex-col gap-1 px-4 py-3">
              <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
              <p className="text-base leading-relaxed text-muted-dark">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
