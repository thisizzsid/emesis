import tseslint from "typescript-eslint";
import js from "@eslint/js";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { react },
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "coverage",
      "bot/**",
      "public/**",
      "postcss.config.mjs",
      "eslint.config.js",
      "next-env.d.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-empty": "off",
      "prefer-const": "off",
    },
  },
];
