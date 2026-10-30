import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "dotenv";
import { defineConfig } from "vitest/config";

const env = parse(readFileSync(".env.test"));

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["src/**/*.test.ts"], environment: "node", env },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
          env,
          globalSetup: ["tests/integration/global-setup.ts"],
          setupFiles: ["tests/integration/setup.ts"],
          fileParallelism: false, // shared database
          testTimeout: 20_000,
        },
      },
    ],
  },
});
