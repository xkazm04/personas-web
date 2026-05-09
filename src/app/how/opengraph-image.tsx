import { ImageResponse } from "next/og";
import { OgFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-frame";

export const runtime = "edge";
export const dynamic = "force-static";
export const revalidate = 86400;

export const alt = "How It Works — Personas";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return new ImageResponse(
    (
      <OgFrame
        subtitle="From natural language to production agents"
        tags={["Agents", "Platform", "Event bus"]}
        accent="#06b6d4"
      />
    ),
    { ...size },
  );
}
