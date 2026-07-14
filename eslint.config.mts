import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: [".next/**", "node_modules/**", ".scratch/**", "out/**", "test_blogs.ts"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Redundant with TypeScript prop types checking
      "react/prop-types": "off",
      // Allow explicit any where needed for raw Notion/Spotify API structures
      "@typescript-eslint/no-explicit-any": "off",
      // Allow require imports in config and script files
      "@typescript-eslint/no-require-imports": "off",
      // Allow unused variables if they start with an underscore or are transient
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      // Allow require/process in global scope
      "no-undef": "off",
    },
  },

]);
