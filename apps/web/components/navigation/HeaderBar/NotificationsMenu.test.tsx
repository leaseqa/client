import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, test} from "vitest";

import NotificationsMenu from "./NotificationsMenu";

describe("NotificationsMenu", () => {
  test("shows the unread state when notifications are present", () => {
    const html = renderToStaticMarkup(
      <NotificationsMenu
        items={[
          {
            _id: "activity-1",
            title: "New answer on your question",
            summary: "Security deposit deadline question",
            href: "/qa?post=1",
            createdAt: "2026-03-12T15:00:00.000Z",
          },
        ]}
        loading={false}
        error=""
        onOpen={() => {
        }}
        onSelect={async () => {
        }}
      />,
    );

    expect(html).toContain("site-auth-chip-bell");
    expect(html).toContain("has-unread");
    expect(html).toContain("New answer on your question");
    expect(html).toContain("Security deposit deadline question");
  });

  test("shows the empty state when there are no unread notifications", () => {
    const html = renderToStaticMarkup(
      <NotificationsMenu
        items={[]}
        loading={false}
        error=""
        onOpen={() => {
        }}
        onSelect={async () => {
        }}
      />,
    );

    expect(html).toContain("No new notifications");
  });
});
