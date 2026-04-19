"use client";

import Image from "next/image";

type TabKey = "chat" | "arena" | "evolution" | "eval";

export default function TabBackdrop({ tab }: { tab: TabKey }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
    >
      {/* Dark-theme illustration — shown in dark mode only */}
      <div className="absolute inset-0 hidden dark:block">
        <Image
          src={`/imgs/features/lab/${tab}-dark.png`}
          alt=""
          fill
          sizes="(min-width: 1024px) 896px, 100vw"
          className="object-cover opacity-[0.18]"
          priority={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,10,16,0.35) 0%, rgba(8,10,16,0.8) 85%, rgba(8,10,16,0.95) 100%)",
          }}
        />
      </div>

      {/* Light-theme illustration — shown in light mode only */}
      <div className="absolute inset-0 dark:hidden">
        <Image
          src={`/imgs/features/lab/${tab}-light.png`}
          alt=""
          fill
          sizes="(min-width: 1024px) 896px, 100vw"
          className="object-cover opacity-[0.22]"
          priority={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.88) 85%, rgba(255,255,255,0.96) 100%)",
          }}
        />
      </div>
    </div>
  );
}
