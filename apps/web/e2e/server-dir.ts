import path from "node:path";

export const resolveLeaseqaServerDir = (
  fromDir: string,
  env: Record<string, string | undefined> = process.env,
) =>
  path.resolve(
    env.LEASEQA_SERVER_DIR || path.join(fromDir, "../../../leaseqa-server"),
  );
