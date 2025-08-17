
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  {
    ignores: ["dist"],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2024,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node, ...globals.es2024 },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react": reactPlugin,
      "jsx-a11y": jsxA11y,
      "prettier": prettierPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Base recommended JS rules
      ...js.configs.recommended.rules,
      // Keep a small set of TS/React rules explicitly to avoid loading plugin configs dynamically
      "prettier/prettier": "warn",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  // Disable core rules that conflict with TS analysis in TS/TSX files
  "no-unused-vars": "off",
  "no-undef": "off",
  "no-redeclare": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: { version: "detect" },
    },
  // flat config does not use 'extends'
  },
];
