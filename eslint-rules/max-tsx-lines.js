/**
 * ESLint rule: max-tsx-lines
 *
 * Flags oversized TSX files so page/container components are split into
 * focused components, hooks, and data modules before they become hard to review.
 */

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn when TSX files exceed the configured line budget and should be refactored",
    },
    messages: {
      tooManyLines:
        "{{path}} has {{lines}} lines. Keep TSX files below {{max}} lines by extracting focused components, hooks, and data modules.",
    },
    schema: [
      {
        type: "object",
        properties: {
          max: { type: "integer", minimum: 1 },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const max = context.options[0]?.max ?? 200;
    const filename = context.getFilename();

    if (!filename.endsWith(".tsx")) {
      return {};
    }

    return {
      Program(node) {
        const lines = context.sourceCode.lines.length;

        if (lines < max) {
          return;
        }

        context.report({
          node,
          messageId: "tooManyLines",
          data: {
            lines: String(lines),
            max: String(max),
            path: filename.replaceAll("\\", "/"),
          },
        });
      },
    };
  },
};
