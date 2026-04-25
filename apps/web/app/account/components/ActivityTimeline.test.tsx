import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import ActivityTimeline from "./ActivityTimeline";

describe("ActivityTimeline", () => {
  test("renders recent activity entries in the v2 card style", () => {
    const html = renderToStaticMarkup(
      <ActivityTimeline
        loading={false}
        error=""
        isGuest={false}
        items={[
          {
            _id: "activity-1",
            type: "ai_review_created",
            title: "Created an AI review",
            summary: "Security deposit clause",
            href: "/ai-review?session=abc",
            createdAt: "2026-03-12T15:00:00.000Z",
          },
        ]}
        onRetry={() => {
        }}
      />,
    );

    expect(html).toContain("Recent Activity");
    expect(html).toContain("Created an AI review");
    expect(html).toContain("Security deposit clause");
    expect(html).toContain("account-activity-list");
  });

  test("renders the guest empty state", () => {
    const html = renderToStaticMarkup(
      <ActivityTimeline
        loading={false}
        error=""
        isGuest
        items={[]}
        onRetry={() => {
        }}
      />,
    );

    expect(html).toContain("saved history starts after sign-in");
  });

  test("renders an inline retry state for feed errors", () => {
    const html = renderToStaticMarkup(
      <ActivityTimeline
        loading={false}
        error="Activity unavailable"
        isGuest={false}
        items={[]}
        onRetry={() => {
        }}
      />,
    );

    expect(html).toContain("Activity unavailable");
    expect(html).toContain("Retry activity");
  });
});
