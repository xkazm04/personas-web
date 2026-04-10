import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import LegalContent from "./LegalContent";

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Legal",
  description: "Privacy policy and terms of service for Personas.",
  alternates: {
    canonical: `${SITE_URL}/legal`,
  },
};

export default function LegalPage() {
  return (
    <>
      <Navbar />
      <LegalContent />
      <Footer />
    </>
  );
}
