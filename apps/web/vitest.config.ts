import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": root,
    },
  },
  test: {
    include: ["app/**/*.test.ts", "app/**/*.test.tsx", "e2e/server-dir.test.ts"],
    exclude: ["e2e/**/*.spec.ts", "node_modules/**"],
  },
});
