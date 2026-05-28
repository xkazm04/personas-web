/**
 * ESLint rule: no-confusable-minus
 *
 * A no-irregular-whitespace–style guard for ASCII-confusable minus/hyphen
 * glyphs. These look identical to a plain `-` (U+002D) on screen but are
 * distinct Unicode codepoints, so they silently break anything that parses
 * the surrounding string — e.g. Framer Motion's `translateX: ["-100%", …]`,
 * CSS values, or numeric literals — while reading as correct to a human.
 *
 * Regression guard for the SkeletonCard shimmer bug, where the first keyframe
 * was written with U+2212 MINUS SIGN instead of an ASCII hyphen-minus, so the
 * overlay never swept in from off-screen left.
 *
 * Only flags glyphs that are confusable with `-`/hyphen and have no
 * legitimate use in source. EN DASH (U+2013) and EM DASH (U+2014) are
 * intentionally NOT included — they are used pervasively in prose and i18n
 * copy and are not confusable with a code-level minus.
 *
 * Codepoints are referenced numerically (never as literal glyphs) so this
 * rule's own source does not trip the guard it defines.
 */

// Confusable minus/hyphen codepoints → human-readable name.
const CONFUSABLES = new Map([
  [0x2212, "U+2212 MINUS SIGN"],
  [0xff0d, "U+FF0D FULLWIDTH HYPHEN-MINUS"],
  [0x2796, "U+2796 HEAVY MINUS SIGN"],
  [0x02d7, "U+02D7 MODIFIER LETTER MINUS SIGN"],
  [0x2010, "U+2010 HYPHEN"],
  [0x2011, "U+2011 NON-BREAKING HYPHEN"],
  [0x2015, "U+2015 HORIZONTAL BAR"],
  [0x2043, "U+2043 HYPHEN BULLET"],
]);

const CONFUSABLE_SET = new Set(CONFUSABLES.keys());

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow Unicode glyphs that are confusable with an ASCII hyphen-minus (-)",
    },
    messages: {
      confusableMinus:
        "Confusable character {{name}} reads as '-' but is not an ASCII " +
        "hyphen-minus and will break string/CSS/numeric parsing. Replace it with a plain '-' (U+002D).",
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      Program(node) {
        const text = sourceCode.getText();
        for (let i = 0; i < text.length; i++) {
          const code = text.codePointAt(i);
          if (CONFUSABLE_SET.has(code)) {
            context.report({
              node,
              loc: {
                start: sourceCode.getLocFromIndex(i),
                end: sourceCode.getLocFromIndex(i + 1),
              },
              messageId: "confusableMinus",
              data: { name: CONFUSABLES.get(code) },
            });
          }
        }
      },
    };
  },
};
