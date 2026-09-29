"use client";

import dynamic from "next/dynamic";
import "./hero.css";
import { useLandingSkin } from "../LandingSkinScope";
import HeroCopy from "./HeroCopy";
import HeroDeck from "./HeroDeck";

// The Blueprint cover is a client-only swap that only visitors on that skin download.
const BlueprintCover = dynamic(() => import("./BlueprintCover"), { ssr: false });

/** The landing hero: promise, calls to action and the live persona illustration (a drawn cover under Blueprint). */
export default function LandingHero() {
  const skin = useLandingSkin();
  return (
    <section id="hero" className="ln-sec ln-hero" aria-labelledby="hero-h">
      <div className="ln-hero-grid">
        <HeroCopy />
        {skin === "blueprint" ? <BlueprintCover /> : <HeroDeck />}
      </div>
    </section>
  );
}
