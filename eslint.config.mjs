import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import noLowTextOpacity from "./eslint-rules/no-low-text-opacity.js";
import requireAnimationGating from "./eslint-rules/require-animation-gating.js";
import noMultiZustandSelector from "./eslint-rules/no-multi-zustand-selector.js";

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
      "custom-zustand": {
        rules: {
          "no-multi-zustand-selector": noMultiZustandSelector,
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
