import path from "node:path";
import { defineConfig } from "@playwright/test";

const frontendPort = process.env.PLAYWRIGHT_FRONTEND_PORT || "3100";
const backendPort = process.env.PLAYWRIGHT_BACKEND_PORT || "4100";
const clientDir = __dirname;
const serverDir = path.resolve(__dirname, "../../../leaseqa-server");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm start",
      cwd: serverDir,
      env: {
        ...process.env,
        PORT: backendPort,
        CLIENT_URL: `http://127.0.0.1:${frontendPort}`,
        SERVER_ENV: "development",
      },
      url: `http://127.0.0.1:${backendPort}/api/health`,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: `npm run dev -- --hostname 127.0.0.1 --port ${frontendPort}`,
      cwd: clientDir,
      env: {
        ...process.env,
        NEXT_PUBLIC_HTTP_SERVER: `http://127.0.0.1:${backendPort}`,
      },
      url: `http://127.0.0.1:${frontendPort}`,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
