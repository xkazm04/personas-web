"use client";

import "./hero.css";
import HeroCopy from "./HeroCopy";
import HeroDeck from "./HeroDeck";

/** The landing hero: promise, calls to action and the live persona illustration. */
export default function LandingHero() {
  return (
    <section id="hero" className="ln-sec ln-hero" aria-labelledby="hero-h">
      <div className="ln-hero-grid">
        <HeroCopy />
        <HeroDeck />
      </div>
    </section>
  );
}
