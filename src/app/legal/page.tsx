import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import LegalContent from "./LegalContent";

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy & Terms",
  description:
    "Privacy policy, terms of service, and cookie policy for Personas. Your data stays on your device — we believe privacy is a right, not a feature.",
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
