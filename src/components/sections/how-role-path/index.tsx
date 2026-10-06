"use client";

import { useState } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { useTranslation } from "@/i18n/useTranslation";
import RoleLenses from "./RoleLenses";
import Route from "./Route";
import { roleDef, type ViewerRole } from "./roles";
import { ZOOM_FILL, ZOOM_TIERS, zoomStyle } from "./zoom";

export type { ViewerRole } from "./roles";

/**
 * /how opener - "Start here". The visitor picks who they are with one of three
 * role lenses, and the section draws THEIR path through the page: the four
 * sections below, each with a line on why it matters to that role and a jump
 * link. The page owns the role (it also retints the events stage), so it comes
 * in as props.
 */
export default function HowRolePath({
  role,
  onRoleChange,
}: {
  role: ViewerRole;
  onRoleChange: (role: ViewerRole) => void;
}) {
  const c = useTranslation().t.howSections.rolePath;
  // Stop lines fade in only after a switch: the first paint shows them as-is.
  const [touched, setTouched] = useState(false);
  const pick = (next: ViewerRole) => {
    if (next === role) return;
    setTouched(true);
    onRoleChange(next);
  };
  const name = c.roles[roleDef(role).copy].name;

  return (
    <SectionWrapper fit="fill" id="for-you" aria-label={c.aria} className={ZOOM_TIERS}>
      <SectionIntro
        eyebrow={c.eyebrow}
        eyebrowBrand={roleDef(role).brand}
        heading={c.heading}
        gradient={c.gradient}
        description={c.lede}
        descriptionMaxWidth="max-w-3xl"
        className="mb-10"
      />
      <div data-stage-slot>
        <div
          className={`flex flex-col gap-10 stage:flex-row stage:items-stretch stage:gap-[clamp(2.5rem,5cqw,4.5rem)] ${ZOOM_FILL}`}
          style={zoomStyle}
        >
          <RoleLenses role={role} onChange={pick} />
          <Route role={role} touched={touched} />
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {touched ? c.announce.replace("{role}", name) : ""}
      </p>
    </SectionWrapper>
  );
}
