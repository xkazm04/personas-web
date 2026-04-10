import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Version history and release notes for the Personas desktop app. See what's new in each release.",
  openGraph: {
    title: "Changelog — Personas",
    description: "Version history and release notes for the Personas desktop app.",
    url: `${SITE_URL}/changelog`,
  },
  alternates: { canonical: `${SITE_URL}/changelog` },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
