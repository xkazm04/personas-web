import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Guide",
  description:
    "Everything you need to know about Personas — from first steps to advanced automation. Browse 100+ topics across 10 categories.",
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
