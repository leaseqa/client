import { execSync } from "node:child_process";
import path from "node:path";
import { withPlaywrightDefaults } from "./playwright-env";
import { resolveLeaseqaServerDir } from "./server-dir";

const adminPassword =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD || "leaseqa-e2e-admin";

export default async function globalSetup() {
  const serverDir = resolveLeaseqaServerDir(path.join(__dirname, ".."));

  execSync("npm run seed:demo-users", {
    cwd: serverDir,
    stdio: "inherit",
    env: {
      ...withPlaywrightDefaults(process.env),
      DEMO_PASSWORD: adminPassword,
      SERVER_ENV: "development",
      ALLOW_DEMO_ACCOUNTS: "true",
    },
  });
}
