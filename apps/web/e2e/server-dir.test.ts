import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveLeaseqaServerDir } from "./server-dir";

describe("resolveLeaseqaServerDir", () => {
  it("uses an explicit paired server checkout", () => {
    expect(
      resolveLeaseqaServerDir("/workspace/apps/web", {
        LEASEQA_SERVER_DIR: "/workspace/leaseqa-server",
      }),
    ).toBe("/workspace/leaseqa-server");
  });

  it("falls back to the sibling leaseqa-server directory", () => {
    expect(
      resolveLeaseqaServerDir("/tmp/client/apps/web", {}, () => false),
    ).toBe(path.resolve("/tmp/leaseqa-server"));
  });

  it("prefers an existing server-engineering worktree over the CI checkout name", () => {
    expect(
      resolveLeaseqaServerDir("/tmp/client/apps/web", {}, (filePath) =>
        filePath.endsWith(`${path.sep}server-engineering`),
      ),
    ).toBe(path.resolve("/tmp/server-engineering"));
  });
});
