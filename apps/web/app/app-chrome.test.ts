import { describe, expect, test } from "vitest";

import { shouldHideGlobalChrome } from "./chrome";

describe("shouldHideGlobalChrome", () => {
  test("hides global navigation for study routes", () => {
    expect(shouldHideGlobalChrome("/study/security-deposit")).toBe(true);
  });

  test("keeps global navigation for ordinary product routes", () => {
    expect(shouldHideGlobalChrome("/ai-review")).toBe(false);
    expect(shouldHideGlobalChrome("/qa")).toBe(false);
  });
});
