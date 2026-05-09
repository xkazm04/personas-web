"use client";

import Image from "next/image";
import { featureIllustrations } from "../data";
import type { Feature } from "../local-types";

export default function FeatureVoteIllustration({
  feature,
  rgba,
  imgLoaded,
  onImgLoad,
}: {
  feature: Feature;
  rgba: (a: number) => string;
  imgLoaded: boolean;
  onImgLoad: () => void;
}) {
  return (
    <div className="relative flex items-center justify-center py-12 sm:py-14 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: imgLoaded ? 0 : 1,
          background: `radial-gradient(circle at 50% 50%, ${rgba(0.06)} 0%, transparent 60%)`,
        }}
      />

      {featureIllustrations[feature.id] && (
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{ opacity: imgLoaded ? 1 : 0 }}
        >
          <Image
            src={featureIllustrations[feature.id]}
            alt={feature.title}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            loading="lazy"
            className="object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-700"
            onLoad={onImgLoad}
          />
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 40%, rgba(10,10,18,0.9) 100%), radial-gradient(circle at 50% 50%, transparent 30%, rgba(10,10,18,0.6) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${rgba(0.12)} 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}
