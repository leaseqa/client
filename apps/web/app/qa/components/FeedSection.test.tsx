/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import AnnouncementSection from "./AnnouncementSection";
import PinPostsSection from "./PinPostsSection";
import QuestionFeed from "./QuestionFeed";
import type { Folder, Post } from "../types";

afterEach(cleanup);

const folders: Folder[] = [
  { _id: "f1", name: "security_deposit", displayName: "Security Deposit", description: "", color: "" },
];

function post(overrides: Partial<Post>): Post {
  return {
    _id: "p1",
    summary: "Deposit not returned",
    details: "<p>Landlord kept it.</p>",
    postType: "question",
    folders: ["security_deposit"],
    authorId: "u1",
    lawyerOnly: false,
    fromAIReviewId: null,
    urgency: "low",
    viewCount: 0,
    isPinned: false,
    isResolved: false,
    isAnonymous: false,
    createdAt: "2025-12-07T10:00:00.000Z",
    updatedAt: "2025-12-07T10:00:00.000Z",
    lastActivityAt: "2025-12-07T10:00:00.000Z",
    ...overrides,
  };
}

describe("community feed rows", () => {
  test("are links to the thread, reachable by keyboard", () => {
    render(<QuestionFeed posts={[post({ _id: "abc" })]} folders={folders}/>);
    const link = screen.getByRole("link", { name: /Deposit not returned/ });
    expect(link.getAttribute("href")).toBe("/qa?post=abc");
  });

  test("show the topic's display name, not its slug", () => {
    render(<QuestionFeed posts={[post({})]} folders={folders}/>);
    const row = screen.getByRole("link");
    expect(row.textContent).toContain("Security Deposit");
    expect(row.textContent).not.toContain("security_deposit");
  });

  test("do not pad a short preview with an ellipsis", () => {
    render(<QuestionFeed posts={[post({ details: "<p>Short.</p>" })]} folders={folders}/>);
    expect(screen.getByText("Short.")).toBeTruthy();
    expect(screen.getByRole("link").textContent).not.toContain("...");
  });

  test("label only high urgency, in words", () => {
    render(
      <QuestionFeed
        posts={[post({ _id: "a", urgency: "high" }), post({ _id: "b", summary: "Quiet one", urgency: "low" })]}
        folders={folders}
      />,
    );
    const [urgent, quiet] = screen.getAllByRole("link");
    expect(urgent.textContent).toContain("Urgent");
    expect(quiet.textContent).not.toContain("Urgent");
  });
});

describe("feed sections", () => {
  test("a pinned announcement is listed under Pinned only", () => {
    const pinnedAnnouncement = post({ _id: "ann", summary: "AMA on Friday", postType: "announcement", isPinned: true });
    const plainAnnouncement = post({ _id: "upd", summary: "New template", postType: "announcement" });

    render(
      <>
        <PinPostsSection posts={[pinnedAnnouncement, plainAnnouncement]} folders={folders}/>
        <AnnouncementSection posts={[pinnedAnnouncement, plainAnnouncement]} folders={folders}/>
      </>,
    );

    const pinned = screen.getByRole("region", { name: /Pinned/ });
    const updates = screen.getByRole("region", { name: /Updates/ });
    expect(within(pinned).queryByText("AMA on Friday")).not.toBeNull();
    expect(within(updates).queryByText("AMA on Friday")).toBeNull();
    expect(within(updates).queryByText("New template")).not.toBeNull();
  });

  test("render nothing when a section has no posts", () => {
    const { container } = render(<AnnouncementSection posts={[post({})]} folders={folders}/>);
    expect(container.innerHTML).toBe("");
  });
});
