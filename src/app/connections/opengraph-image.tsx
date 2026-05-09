import { ImageResponse } from "next/og";
import { OgFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-frame";
import { connectors } from "@/data/connectors";

export const runtime = "edge";
export const dynamic = "force-static";
export const revalidate = 86400;

export const alt = "Connections Catalog — Personas";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  const count = Math.floor(connectors.length / 5) * 5;
  return new ImageResponse(
    (
      <OgFrame
        subtitle="Connections Catalog"
        tags={[`${count}+ integrations`, "Slack · GitHub · AWS"]}
        accent="#06b6d4"
      />
    ),
    { ...size },
  );
}
