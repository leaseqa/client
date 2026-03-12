import { execSync } from "node:child_process";
import path from "node:path";

const adminPassword =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD || "leaseqa-e2e-admin";

export default async function globalSetup() {
  const serverDir = path.resolve(__dirname, "../../../../leaseqa-server");

  execSync("pnpm seed:demo-users", {
    cwd: serverDir,
    stdio: "inherit",
    env: {
      ...process.env,
      DEMO_PASSWORD: adminPassword,
    },
  });
}
