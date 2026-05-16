import { ImageResponse } from "next/og";
import { OgFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-frame";

export const revalidate = 86400;

export const alt = "Roadmap — Personas";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return new ImageResponse(
    (
      <OgFrame
        subtitle="Vote on what ships next"
        tags={["Roadmap", "Feature voting", "Changelog"]}
        accent="#34d399"
      />
    ),
    { ...size },
  );
}
