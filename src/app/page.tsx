import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import WhyAgents from "@/components/sections/WhyAgents";
import Features from "@/components/sections/Features";
import Showcase from "@/components/sections/Showcase";
import UseCases from "@/components/sections/UseCases";
import EventBusShowcase from "@/components/sections/EventBusShowcase";
import Vision from "@/components/sections/Vision";
import Pricing from "@/components/sections/Pricing";
import DownloadCTA from "@/components/sections/DownloadCTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhyAgents />
        <Features />
        <Showcase />
        <UseCases />
        <EventBusShowcase />
        <Vision />
        <Pricing />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}
