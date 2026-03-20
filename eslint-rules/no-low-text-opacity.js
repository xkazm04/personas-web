/**
 * ESLint rule: no-low-text-opacity
 *
 * Flags Tailwind text-opacity classes (text-*​/{n}) where the opacity value
 * is below the WCAG-safe threshold of 60.
 *
 * Catches patterns like:
 *   text-white/30, text-muted-dark/40, text-brand-cyan/50,
 *   placeholder:text-muted-dark/40, hover:text-white/55
 *
 * Ignores non-text opacity utilities (bg-*, border-*, ring-*, shadow-*, etc.)
 * and SVG `fill`/`stroke` attributes.
 */

const MIN_OPACITY = 60;

// Matches Tailwind text-opacity classes: text-{color}/{opacity}
// Accounts for optional variant prefixes like hover:, placeholder:, group-hover:, etc.
const TEXT_OPACITY_RE =
  /(?:^|[\s"'`{])(?:[\w-]+:)*text-[\w-]+\/(\d+)(?=[\s"'`},;]|$)/g;

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: `Disallow text opacity classes below /${MIN_OPACITY} for WCAG contrast compliance`,
    },
    messages: {
      lowOpacity:
        "Text opacity /{{value}} is below the minimum /{{min}}. " +
        "Use /{{min}} or higher to meet WCAG AA contrast requirements.",
    },
    schema: [],
  },

  create(context) {
    /**
     * Scan a raw string value for low-opacity text classes.
     */
    function checkString(node, value) {
      TEXT_OPACITY_RE.lastIndex = 0;
      let match;
      while ((match = TEXT_OPACITY_RE.exec(value)) !== null) {
        const opacity = parseInt(match[1], 10);
        if (opacity < MIN_OPACITY) {
          context.report({
            node,
            messageId: "lowOpacity",
            data: { value: String(opacity), min: String(MIN_OPACITY) },
          });
        }
      }
    }

    return {
      // String literals (className="text-white/30")
      Literal(node) {
        if (typeof node.value === "string") {
          checkString(node, node.value);
        }
      },

      // Template literals (className={`text-white/30`})
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          checkString(node, quasi.value.raw);
        }
      },
    };
  },
};
