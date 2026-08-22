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

  test("labels the journey steps with numbers alone", () => {
    const html = renderToStaticMarkup(<HomeJourney stats={[]} />);

    expect(html).toContain(">01<");
    expect(html).toContain(">02<");
    expect(html).toContain(">03<");
    expect(html).not.toContain("01 · Source");
    expect(html).not.toContain("02 · Context");
    expect(html).not.toContain("03 · Questions");
  });

  test("leads the journey with its heading and no decorative eyebrow", () => {
    const html = renderToStaticMarkup(<HomeJourney stats={[]} />);

    expect(html).toContain('id="journey-title"');
    expect(html).toContain("From clause to context");
    expect(html).not.toContain("Your path");
  });

  test("leaves the legal boundary to the single footer disclaimer", () => {
    const html = renderToStaticMarkup(<HomeJourney stats={[]} />);

    expect(html).not.toContain("Built for renters who want a clearer starting point.");
    expect(html).not.toMatch(/not legal advice/i);
    expect(html).not.toContain("Cited sources stay visible");
  });

  test("admits a failed stats read instead of hiding the section", () => {
    const html = renderToStaticMarkup(<HomeJourney stats={[]} statsError/>);

    expect(html).toContain("Community activity could not be loaded.");
    expect(html).toContain("Community snapshot");
  });

  test("prefers real statistics over the error state once they arrive", () => {
    const html = renderToStaticMarkup(
      <HomeJourney stats={[{ label: "Open questions", value: 3 }]} statsError/>,
    );

    expect(html).not.toContain("Community activity could not be loaded.");
    expect(html).toContain("Open questions");
  });

  test("stays silent when stats are simply empty and nothing failed", () => {
    const html = renderToStaticMarkup(<HomeJourney stats={[]}/>);

    expect(html).not.toContain("Community snapshot");
    expect(html).not.toContain("could not be loaded");
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
