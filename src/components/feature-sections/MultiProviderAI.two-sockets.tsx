"use client";

import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import TwoSocketsArt from "./MultiProviderAI.two-sockets.art";

/* /illustrate variant "two-sockets": one runtime core, two engines plugged in. */
export default function MultiProviderAITwoSockets() {
  return (
    <SectionWrapper id="multi-provider">
      <div className="text-center">
        <SectionHeading>
          Powered by{" "}
          <GradientText className="drop-shadow-lg">Claude</GradientText>.
          Private via <GradientText className="drop-shadow-lg">Ollama</GradientText>.
        </SectionHeading>
        <p className="mx-auto mt-6 max-w-2xl text-foreground/85 font-light">
          Two engines, one consistent agent runtime.
        </p>
      </div>
      <TwoSocketsArt className="mx-auto mt-12 max-w-5xl" />
    </SectionWrapper>
  );
}
