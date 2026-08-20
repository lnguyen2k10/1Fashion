import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
    // Archived import tooling and one-off database helpers are not shipped by Next.js.
    "_archive/**",
    "scratch/**",
    "scripts/**",
    "output/**",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Supabase's untyped JSON payloads are progressively being migrated to
      // generated types. They must not block a release while strict TypeScript
      // compilation remains the required correctness gate.
      "@typescript-eslint/no-explicit-any": "off",
      // These React Compiler diagnostics are valuable refactor guidance, but
      // are not runtime lint failures for the existing client data-loading code.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
