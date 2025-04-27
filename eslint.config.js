import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "18.3" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  // Bloc de override pentru fișierele Node (de ex., cele din folderul "backend" sau "server.js")
  {
    files: ["backend/**/*.{js,jsx}", "server.js"],
    env: {
      node: true, // specifică mediul Node.js
      browser: true,
    },
    languageOptions: {
      // Folosește variabilele globale pentru Node
      globals: globals.node,
      // Pentru fișierele Node este adesea indicat să folosești "sourceType": "script"
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "script",
      },
    },
    // Dacă dorești, poți dezactiva regulile React pentru fișierele Node:
    rules: {
      // Poți regla sau dezactiva regulile care nu se aplică în Node
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];
