import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["app/**/*.test.ts", "app/**/*.test.tsx", "e2e/server-dir.test.ts"],
    exclude: ["e2e/**/*.spec.ts", "node_modules/**"],
  },
});
