import { describe, expect, test } from "vitest";

import { countLabel, toPlainText } from "./utils";

describe("toPlainText", () => {
  test("strips editor markup into one line of text", () => {
    expect(toPlainText("<p>Heat is off.</p><p>Since <strong>Monday</strong>.</p>")).toBe(
      "Heat is off. Since Monday.",
    );
  });

  test("decodes the entities the editor writes", () => {
    expect(toPlainText("<p>Rent &amp; fees&nbsp;&lt;$50&gt; &quot;due&quot; &#39;now&#39;</p>")).toBe(
      "Rent & fees <$50> \"due\" 'now'",
    );
  });

  test("never appends an ellipsis — clamping is the stylesheet's job", () => {
    expect(toPlainText("<p>Short.</p>")).toBe("Short.");
  });
});

describe("countLabel", () => {
  test("uses the singular for exactly one", () => {
    expect(countLabel(1, "discussion")).toBe("1 discussion");
  });

  test("uses the plural otherwise", () => {
    expect(countLabel(0, "answer")).toBe("0 answers");
    expect(countLabel(2, "answer")).toBe("2 answers");
  });
});
