import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["src/__tests__/**/*.test.ts"],
    environment: "node",
    pool: "forks",
    fileParallelism: false, // serial execution for integration tests (shared DB)
    testTimeout: 15000,
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/app/api/**", "src/trigger/**", "src/trpc/**"],
      thresholds: {
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
