import { ImageResponse } from "next/og";
import { OgFrame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-frame";

export const revalidate = 86400;

export const alt = "Personas — AI Agents That Work For You";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return new ImageResponse(
    (
      <OgFrame
        subtitle="AI Agents That Work For You"
        tags={["Natural Language", "Local + Cloud", "Zero Code"]}
      />
    ),
    { ...size },
  );
}
