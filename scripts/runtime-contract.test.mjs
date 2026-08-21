import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const readJson = async (relativePath) =>
  JSON.parse(await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8"));

test("declares Node 24 across the workspace", async () => {
  const nvmrc = (await readFile(new URL("../.nvmrc", import.meta.url), "utf8")).trim();
  const rootPackage = await readJson("package.json");
  const webPackage = await readJson("apps/web/package.json");
  const vercel = await readJson("apps/web/vercel.json");

  assert.equal(nvmrc, "24.19.0");
  assert.equal(rootPackage.engines.node, "24.x");
  assert.equal(webPackage.engines.node, "24.x");
  assert.equal(rootPackage.packageManager, "npm@11.17.0");
  assert.equal(vercel.installCommand, "npm ci");
  assert.equal(typeof rootPackage.scripts.typecheck, "string");
  assert.equal(typeof rootPackage.scripts.test, "string");
  assert.equal(typeof rootPackage.scripts.e2e, "string");
});
