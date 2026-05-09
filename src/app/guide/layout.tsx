import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import GuideSidebar from "@/components/guide/GuideSidebar";

export const metadata: Metadata = {
  title: "User Guide",
  description:
    "Everything you need to know about Personas — from first steps to advanced automation. Browse 100+ topics across 10 categories.",
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen pt-16">
        <GuideSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}
