import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Next.js compiles JSX with the automatic runtime, so component files do not
  // import React. Vitest transforms them with esbuild, which follows the
  // tsconfig "jsx": "preserve" setting and would otherwise expect React in scope.
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": root,
    },
  },
  test: {
    include: [
      "app/**/*.test.ts",
      "app/**/*.test.tsx",
      "components/**/*.test.ts",
      "components/**/*.test.tsx",
      "e2e/**/*.test.ts",
    ],
    exclude: ["e2e/**/*.spec.ts", "node_modules/**"],
  },
});
