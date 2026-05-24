import Image from "next/image";

import { tint } from "@/lib/brand-theme";

import type { PlatformCard } from "../data";

export function PlatformCardBackdrop({
  card,
  open,
}: {
  card: PlatformCard;
  open: boolean;
}) {
  return (
    <>
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
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--background) 20%, transparent) 0%, color-mix(in srgb, var(--background) 55%, transparent) 55%, color-mix(in srgb, var(--background) 88%, transparent) 100%)",
          }}
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `radial-gradient(ellipse 75% 55% at 50% 100%, ${tint(card.brand, 30)}, transparent)`,
        }}
      />
    </>
  );
}
