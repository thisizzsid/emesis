// ESLint 9 flat config for Next.js + TypeScript
// Based on Next.js documentation: https://nextjs.org/docs/app/api-reference/config/eslint#migrating-existing-config
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import next from "eslint-config-next";

export default tseslint.config(
  js.configs.recommended,
  // Next.js flat config exports an array of configs
  ...next,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
    settings: {
      next: { rootDir: true },
    },
    rules: {
      // Allow inline styles for dynamic CSS variables and animations
      "react/no-danger": "off",
    },
  }
);
