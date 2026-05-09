/**
 * ESLint rule: no-multi-zustand-selector
 *
 * Flags multiple subscriptions to the same Zustand hook in a single
 * function/component. Each call registers an independent subscription
 * that runs on every store change — collapse with `useShallow` instead.
 *
 * Catches:
 *   const x = useAuthStore((s) => s.x);
 *   const y = useAuthStore((s) => s.y);  // ← reported
 *
 * Recommended fix:
 *   const { x, y } = useAuthStore(useShallow((s) => ({ x: s.x, y: s.y })));
 *
 * Configurable via the `hooks` option (defaults to ["useAuthStore"]).
 */

const DEFAULT_HOOKS = ["useAuthStore"];

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Flag multiple calls to the same Zustand hook in one component. Collapse with useShallow.",
    },
    messages: {
      multipleCalls:
        "Component calls {{name}} {{count}} times. Collapse into a single useShallow selector to avoid duplicate subscriptions.",
    },
    schema: [
      {
        type: "object",
        properties: {
          hooks: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const hooks = new Set(options.hooks ?? DEFAULT_HOOKS);

    /** Stack of per-function call counts: Map<hookName, { count, firstNode }>. */
    const stack = [];

    function enterFn() {
      stack.push(new Map());
    }

    function exitFn() {
      const counts = stack.pop();
      if (!counts) return;
      for (const [name, info] of counts.entries()) {
        if (info.count > 1) {
          context.report({
            node: info.firstNode,
            messageId: "multipleCalls",
            data: { name, count: String(info.count) },
          });
        }
      }
    }

    return {
      FunctionDeclaration: enterFn,
      "FunctionDeclaration:exit": exitFn,
      FunctionExpression: enterFn,
      "FunctionExpression:exit": exitFn,
      ArrowFunctionExpression: enterFn,
      "ArrowFunctionExpression:exit": exitFn,

      CallExpression(node) {
        if (stack.length === 0) return;
        const callee = node.callee;
        if (callee.type !== "Identifier") return;
        if (!hooks.has(callee.name)) return;

        const top = stack[stack.length - 1];
        const existing = top.get(callee.name);
        if (existing) {
          existing.count += 1;
        } else {
          top.set(callee.name, { count: 1, firstNode: node });
        }
      },
    };
  },
};
