import { BookOpen, X } from "lucide-react";

import { guideHref, openGuideLink } from "@/lib/guide-link";

import type { PlatformCard } from "../data";

export function PlatformCardPanel({
  card,
  open,
  brandVar,
  panelRef,
  closeRef,
  onClose,
}: {
  card: PlatformCard;
  open: boolean;
  brandVar: string;
  panelRef: React.RefObject<HTMLDivElement | null>;
  closeRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  return (
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
            onClose();
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
          {card.details.map((detail) => (
            <li
              key={detail}
              className="flex items-start gap-2 text-base text-foreground/75"
            >
              <span
                className="mt-2 h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: brandVar }}
              />
              <span className="leading-relaxed">{detail}</span>
            </li>
          ))}
        </ul>
        {card.guideTopics?.map((guideTopic) => (
          <button
            key={guideTopic.topic}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openGuideLink(guideHref(guideTopic));
            }}
            className="inline-flex items-center gap-1.5 text-base font-medium transition-opacity hover:opacity-80 bg-transparent border-none p-0 cursor-pointer"
            style={{ color: brandVar }}
          >
            <BookOpen className="h-4 w-4" />
            <span>{guideTopic.label}</span>
            <span aria-hidden="true">-&gt;</span>
          </button>
        ))}
      </div>
    </div>
  );
}
