import { ImageResponse } from "next/og";
import { OgFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-frame";

export const runtime = "edge";
export const dynamic = "force-static";
export const revalidate = 86400;

export const alt = "Features — Personas";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return new ImageResponse(
    (
      <OgFrame
        subtitle="Self-healing agents, end-to-end observability"
        tags={["Genome", "Memory", "Healing"]}
        accent="#a855f7"
      />
    ),
    { ...size },
  );
}
