import { ImageResponse } from "next/og";
import { OgFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-frame";
import { templates } from "@/lib/templates";

export const runtime = "edge";
export const dynamic = "force-static";
export const revalidate = 86400;

export const alt = "Agent Template Gallery — Personas";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return new ImageResponse(
    (
      <OgFrame
        subtitle="Agent Template Gallery"
        tags={[`${templates.length} ready-made agents`, "Copy. Run. Done."]}
        accent="#a855f7"
      />
    ),
    { ...size },
  );
}
