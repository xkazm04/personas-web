import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Security & Privacy",
  description:
    "How Personas protects your data. Local-first architecture, AES-256 encryption, OS-native keyring, zero telemetry. Your data never leaves your machine.",
  openGraph: {
    title: "Security & Privacy — Personas",
    description:
      "Desktop-first AI agent orchestration with AES-256 encryption, zero telemetry, and air-gap capability.",
    url: `${SITE_URL}/security`,
  },
  alternates: { canonical: `${SITE_URL}/security` },
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
