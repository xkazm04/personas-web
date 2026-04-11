import { ogCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Download Personas";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return ogCard({
    title: "Download Personas Free",
    subtitle: "AI agent orchestration for Windows, macOS, and Linux. Free forever, zero telemetry, no signup required.",
    badge: "Download",
    badgeColor: "#06b6d4",
    accentColor: "#06b6d4",
    footer: "personas.ai/download",
  });
}
