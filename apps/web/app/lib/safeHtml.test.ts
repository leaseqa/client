import { describe, expect, it, test } from "vitest";

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

describe("sanitizeServerHtml link targeting", () => {
  test("forces noopener on a link that opens a new tab", () => {
    const result = sanitizeServerHtml(
      '<p><a href="https://example.com" target="_blank">x</a></p>',
    );
    expect(result).toContain('rel="noopener noreferrer"');
  });

  test("overrides an explicit rel=opener that would defeat the browser default", () => {
    const result = sanitizeServerHtml(
      '<a href="https://example.com" target="_blank" rel="opener">x</a>',
    );
    expect(result).toContain('rel="noopener noreferrer"');
    expect(result).not.toMatch(/rel="[^"]*\bopener\b[^"]*"/);
  });

  test("leaves a same-tab link's rel alone", () => {
    const result = sanitizeServerHtml('<a href="/qa">x</a>');
    expect(result).not.toContain("noopener");
  });

  test("normalises a named target to _blank", () => {
    const result = sanitizeServerHtml(
      '<a href="https://example.com" target="evil">x</a>',
    );
    expect(result).toContain('target="_blank"');
  });
});
