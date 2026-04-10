import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how Personas agents are built, orchestrated, and connected through the event bus. From natural language to production in minutes.",
  openGraph: {
    title: "How It Works — Personas",
    description:
      "Learn how Personas agents are built, orchestrated, and connected through the event bus.",
    url: `${SITE_URL}/how`,
  },
  alternates: {
    canonical: `${SITE_URL}/how`,
  },
};

export default function HowLayout({ children }: { children: React.ReactNode }) {
  return children;
}
