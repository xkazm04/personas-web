"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR, type BrandKey } from "@/lib/brand-theme";

/**
 * SectionIntro — the eyebrow + heading + subtitle trio that appears above
 * almost every section and page on the site.
 *
 * Replaces ~15 lines of boilerplate per section with a single component
 * and keeps the eyebrow / heading / subtitle typography consistent.
 *
 * Pass either a plain `heading` string or a pair of `heading` + `gradient`
 * to render the gradient span at the end.
 */

interface SectionIntroProps {
  /** Small uppercase label above the heading (e.g. "Use Cases"). */
  eyebrow?: string;
  /** Brand color for the eyebrow (defaults to cyan). */
  eyebrowBrand?: BrandKey;
  /** Leading text of the heading. */
  heading: string;
  /** Optional trailing gradient word rendered after the heading. */
  gradient?: string;
  /** Optional suffix that follows the gradient (e.g. "?" or ", for builders"). */
  trailing?: string;
  /** Paragraph under the heading. */
  description?: string;
  /** Override max-width of the description paragraph. */
  descriptionMaxWidth?: string;
  /** Alignment — defaults to center. */
  align?: "center" | "left";
  /** Margin-bottom class. Defaults to mb-12. */
  className?: string;
  /** id attached to the heading element for aria-labelledby linking. */
  id?: string;
  /** Heading level — "h1" for page-level uses, defaults to "h2" for sections. */
  as?: "h1" | "h2";
}

export default function SectionIntro({
  eyebrow,
  eyebrowBrand = "cyan",
  heading,
  gradient,
  trailing,
  description,
  descriptionMaxWidth = "max-w-2xl",
  align = "center",
  className = "mb-12",
  id,
  as,
}: SectionIntroProps) {
  const alignClass = align === "center" ? "text-center" : "text-left";
  const mxClass = align === "center" ? "mx-auto" : "";

  return (
    <motion.div variants={fadeUp} className={`${alignClass} ${className}`}>
      {eyebrow && (
        <p
          className="mb-4 text-base font-semibold uppercase tracking-widest"
          style={{ color: BRAND_VAR[eyebrowBrand] }}
        >
          {eyebrow}
        </p>
      )}
      <SectionHeading id={id} as={as}>
        {heading}
        {gradient && (
          <>
            {" "}
            <GradientText className="drop-shadow-lg">{gradient}</GradientText>
          </>
        )}
        {trailing}
      </SectionHeading>
      {description && (
        <p
          className={`${mxClass} mt-6 ${descriptionMaxWidth} text-base text-muted leading-relaxed font-light`}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
