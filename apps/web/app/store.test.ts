import { describe, expect, test } from "vitest";

import { parseSessionUser } from "./store";

describe("parseSessionUser", () => {
  test("keeps the server's hasPassword flag", () => {
    expect(parseSessionUser({ _id: "user-1", hasPassword: true })?.hasPassword).toBe(true);
  });

  test("treats a missing hasPassword as no password", () => {
    expect(parseSessionUser({ _id: "user-1" })?.hasPassword).toBe(false);
  });
});
