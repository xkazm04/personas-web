import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Visual Playground",
  description:
    "Browse AI-generated backgrounds and decorative patterns. Combine layers and preview visual treatments for your pages.",
  openGraph: {
    title: "Visual Asset Playground — Personas",
    description:
      "AI-generated backgrounds and patterns. Combine layers to find the perfect visual treatment.",
    url: `${SITE_URL}/playground`,
  },
  alternates: {
    canonical: `${SITE_URL}/playground`,
  },
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
