import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import noLowTextOpacity from "./eslint-rules/no-low-text-opacity.js";
import requireAnimationGating from "./eslint-rules/require-animation-gating.js";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
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
    },
    rules: {
      "custom-a11y/no-low-text-opacity": "warn",
      "custom-animation/require-animation-gating": "warn",
    },
  },
]);

export default eslintConfig;
