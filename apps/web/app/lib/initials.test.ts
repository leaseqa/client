import { describe, expect, test } from "vitest";

import { initialsFor } from "./initials";

describe("initialsFor", () => {
  test("takes the first and last word of a full name", () => {
    expect(initialsFor("Demo Tenant")).toBe("DT");
    expect(initialsFor("Lena  van der Berg")).toBe("LB");
  });

  test("keeps two letters of a single-word name", () => {
    expect(initialsFor("Guest")).toBe("GU");
  });

  test("falls back to a question mark without a name", () => {
    expect(initialsFor("")).toBe("?");
    expect(initialsFor("   ")).toBe("?");
    expect(initialsFor(null)).toBe("?");
    expect(initialsFor(undefined)).toBe("?");
  });
});
