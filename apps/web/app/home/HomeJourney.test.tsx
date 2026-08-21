import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import HomeJourney from "./HomeJourney";

describe("HomeJourney", () => {
  test("keeps the lease guidance preview visible without community data", () => {
    const html = renderToStaticMarkup(<HomeJourney stats={[]} />);

    expect(html).toContain("Understand your lease");
    expect(html).toContain("Know what to check");
    expect(html).toContain('aria-label="Example lease guidance comparison"');
    expect(html).toContain("Question to verify");
    expect(html).toContain('href="/ai-review"');
  });

  test("uses informational framing instead of directing a renter's action", () => {
    const html = renderToStaticMarkup(<HomeJourney stats={[]} />);

    expect(html).toContain("What the cited guidance says");
    expect(html).toContain("Does the deposit amount in this clause match");
    expect(html).not.toMatch(/suggested action/i);
    expect(html).not.toMatch(/clear next step/i);
    expect(html).not.toMatch(/ask the landlord to/i);
    expect(html).not.toMatch(/you should/i);
  });

  test("shows community statistics only when at least one value is nonzero", () => {
    const emptyHtml = renderToStaticMarkup(
      <HomeJourney
        stats={[
          { label: "Open questions", value: 0 },
          { label: "Attorney replies", value: 0 },
        ]}
      />,
    );
    const populatedHtml = renderToStaticMarkup(
      <HomeJourney
        stats={[
          { label: "Open questions", value: 3 },
          { label: "Attorney replies", value: 1 },
        ]}
      />,
    );

    expect(emptyHtml).not.toContain("Community snapshot");
    expect(populatedHtml).toContain("Community snapshot");
    expect(populatedHtml).toContain("Open questions");
  });
});
