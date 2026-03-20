import { Sparkles, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

export const metadata = {
  title: "Legal — Personas",
  description: "Privacy policy and terms of service for Personas.",
};

export default function LegalPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cyan/10 ring-1 ring-brand-cyan/10">
          <Sparkles className="h-6 w-6 text-brand-cyan" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
          Legal pages coming soon
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-dark">
          Our privacy policy and terms of service are being finalized. In the
          meantime, if you have any questions please reach out to us.
        </p>
        <a
          href="mailto:legal@personas.ai"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-2.5 text-sm font-medium text-muted transition-colors hover:border-white/[0.15] hover:text-foreground"
        >
          <Mail className="h-4 w-4" />
          legal@personas.ai
        </a>
      </main>
      <Footer />
    </>
  );
}
