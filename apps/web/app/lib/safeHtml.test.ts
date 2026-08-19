import { describe, expect, it } from "vitest";

import { sanitizeServerHtml } from "./safeHtml";

describe("sanitizeServerHtml", () => {
  it("removes executable markup while preserving basic rich text", () => {
    const result = sanitizeServerHtml(
      '<p>Hello</p><img src=x onerror="alert(1)"><a href="javascript:alert(1)">bad</a>',
    );
    expect(result).toContain("<p>Hello</p>");
    expect(result).not.toMatch(/onerror|javascript:|<script/i);
  });

  it("strips script tags and event handler attributes", () => {
    const result = sanitizeServerHtml(
      '<p onclick="alert(1)">ok</p><script>alert(1)</script>',
    );
    expect(result).toContain("<p>ok</p>");
    expect(result).not.toMatch(/onclick|script/i);
  });
});
