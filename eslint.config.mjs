/**
 * Lint enforcement policy
 * =======================
 *
 * Two severities, and a ceiling on the softer one.
 *
 *   error — the rule can see the whole failure it names, and any new instance
 *           is a defect, not a preference. Fails the build immediately.
 *           e.g. custom-quality/no-confusable-minus: a U+2212 in source is
 *           never intentional and always breaks something downstream.
 *
 *   warn  — the rule is right about the direction but cannot fully see the
 *           thing it is aiming at, or the existing violations are tracked debt
 *           that nobody has scheduled the repair for. Does not fail on its own.
 *
 * The ceiling: `npm run lint` is `eslint --max-warnings 24` (package.json).
 * 24 is the count measured on 2026-08-22. New warnings fail the build; the 24
 * that exist are debt with a number attached. This is the same ratchet shape
 * the repo already uses for encoding corruption
 * (scripts/check-i18n-encoding.mjs + scripts/i18n-encoding-baseline.json):
 * hold the line at today's number, never above it.
 *
 * Why a ceiling and not "promote everything to error": turning these 24 into
 * errors would red-line the build on day one for debt this change did not
 * create, and the predictable response is `--max-warnings` being removed
 * again, or rules being switched off. A ceiling costs nothing today and makes
 * the 25th warning somebody's problem at the moment they add it.
 *
 * Maintaining it — ESLint has no equivalent of the encoding checker's
 * "you are below baseline, tighten the ratchet" reminder; `--max-warnings 24`
 * passes silently at 23. So when you fix a warning, LOWER THE NUMBER IN
 * package.json in the same commit. A ceiling that only ever gets raised is not
 * a ratchet.
 *
 * Why custom-animation/require-animation-gating stays `warn` even though its
 * own header calls itself "a lint-time guarantee": the rule only fires on raw
 * animation-frame calls, so it is structurally blind to the failure its
 * contract cites — all three components that shipped blank would pass it
 * clean. Promoting a rule to `error` when it cannot see its own motivating
 * case buys enforcement theatre, not coverage. Promote it once it detects the
 * CSS/framer-motion entry paths as well; until then the ceiling is what keeps
 * its warning count from growing.
 */
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import noLowTextOpacity from "./eslint-rules/no-low-text-opacity.js";
import requireAnimationGating from "./eslint-rules/require-animation-gating.js";
import noMultiZustandSelector from "./eslint-rules/no-multi-zustand-selector.js";
import maxTsxLines from "./eslint-rules/max-tsx-lines.js";
import noConfusableMinus from "./eslint-rules/no-confusable-minus.js";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "**/.next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    ".claude/**",
    ".icon-gen-work/**",
    "test-results/**",
    "playwright-report/**",
    "coverage/**",
    "tsconfig.tsbuildinfo",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "custom-a11y": {
        rules: {
          "no-low-text-opacity": noLowTextOpacity,
        },
      },
      "custom-animation": {
        rules: {
          "require-animation-gating": requireAnimationGating,
        },
      },
      "custom-zustand": {
        rules: {
          "no-multi-zustand-selector": noMultiZustandSelector,
        },
      },
      "custom-quality": {
        rules: {
          "max-tsx-lines": maxTsxLines,
          "no-confusable-minus": noConfusableMinus,
        },
      },
    },
    rules: {
      "custom-a11y/no-low-text-opacity": "warn",
      "custom-animation/require-animation-gating": "warn",
      "custom-zustand/no-multi-zustand-selector": [
        "warn",
        { hooks: ["useAuthStore"] },
      ],
      "custom-quality/max-tsx-lines": ["warn", { max: 200 }],
      "custom-quality/no-confusable-minus": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
