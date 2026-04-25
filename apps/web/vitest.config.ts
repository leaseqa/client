import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    include: ["app/**/*.test.ts", "app/**/*.test.tsx"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});
