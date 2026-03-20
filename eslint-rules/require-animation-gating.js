/**
 * ESLint rule: require-animation-gating
 *
 * Enforces the animation gating contract defined in lib/animations.ts.
 *
 * Flags files that use `requestAnimationFrame`, `<canvas>`, or
 * `cancelAnimationFrame` without also importing `useReducedMotion`
 * (from framer-motion or a local hook).
 *
 * This converts the documented contract into a lint-time guarantee.
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require useReducedMotion in files using requestAnimationFrame or canvas elements",
    },
    messages: {
      missingReducedMotion:
        "This file uses {{trigger}} but does not import/call `useReducedMotion`. " +
        "Per the animation gating contract in lib/animations.ts, canvas-based and " +
        "GPU-intensive components MUST call useReducedMotion() and gate animations accordingly.",
    },
    schema: [],
  },

  create(context) {
    let hasReducedMotion = false;
    const triggerNodes = [];

    return {
      // Track imports of useReducedMotion
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          if (
            specifier.local &&
            (specifier.local.name === "useReducedMotion" ||
              specifier.local.name === "useReducedMotionPreference")
          ) {
            hasReducedMotion = true;
          }
        }
      },

      // Track requestAnimationFrame / cancelAnimationFrame calls
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          (node.callee.name === "requestAnimationFrame" ||
            node.callee.name === "cancelAnimationFrame")
        ) {
          triggerNodes.push({
            node,
            trigger: node.callee.name,
          });
        }

        // Also check for useReducedMotion calls (in case it was required
        // without import, e.g. from a destructured hook)
        if (
          node.callee.type === "Identifier" &&
          (node.callee.name === "useReducedMotion" ||
            node.callee.name === "useReducedMotionPreference")
        ) {
          hasReducedMotion = true;
        }
      },

      // Track <canvas> JSX elements
      JSXOpeningElement(node) {
        if (node.name && node.name.type === "JSXIdentifier" && node.name.name === "canvas") {
          triggerNodes.push({
            node,
            trigger: "<canvas>",
          });
        }
      },

      // Report at program exit so we have full file context
      "Program:exit"() {
        if (hasReducedMotion || triggerNodes.length === 0) return;

        for (const { node, trigger } of triggerNodes) {
          context.report({
            node,
            messageId: "missingReducedMotion",
            data: { trigger },
          });
        }
      },
    };
  },
};
