// ESLint flat config (Next.js 16 removed `next lint`; run `npm run lint`).
// Same rule base as the old .eslintrc.json ("next/core-web-vitals").

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design handoff is reference material only — never linted/built.
    "design_handoff_gym_tracker/**",
  ]),
]);
