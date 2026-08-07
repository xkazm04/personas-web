import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import GuideSidebar from "@/components/guide/GuideSidebar";
import { CHROME_PAD_NAVBAR } from "@/components/guide/guide-chrome";

export const metadata: Metadata = {
  title: "User Guide",
  description:
    "Everything you need to know about Personas — from first steps to advanced automation. Browse 100+ topics across 10 categories.",
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className={`flex min-h-screen ${CHROME_PAD_NAVBAR}`}>
        <GuideSidebar />
        {/*
          No `overflow-y-auto` here: `<main>` has no constrained height, so an
          overflow value only made it the nearest scrollport without ever
          scrolling — which silently disabled every `position: sticky` inside
          it (the desktop on-this-page TOC). The window is the scroll
          container.
        */}
        <main id="main-content" className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </>
  );
}
