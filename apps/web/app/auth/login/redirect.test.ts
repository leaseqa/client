import { describe, expect, test } from "vitest";

import { resolveSafeNextHref } from "./redirect";

describe("resolveSafeNextHref", () => {
  test("keeps an internal redirect supplied by the server page", () => {
    expect(resolveSafeNextHref("/qa?topic=deposit")).toBe("/qa?topic=deposit");
  });

  test("rejects missing, repeated, and external redirect values", () => {
    expect(resolveSafeNextHref(undefined)).toBeNull();
    expect(resolveSafeNextHref(["/qa", "/account"])).toBeNull();
    expect(resolveSafeNextHref("https://example.com")).toBeNull();
  });
});
