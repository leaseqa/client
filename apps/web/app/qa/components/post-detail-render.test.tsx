import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, test, vi} from "vitest";
import PostContent from "../[id]/components/PostContent";
import AnswersSection from "../[id]/components/AnswersSection";
import DiscussionsSection from "../[id]/components/DiscussionsSection";

vi.mock("next/dynamic", () => ({
  default: () =>
    function MockDynamicEditor() {
      return <div data-testid="mock-editor"/>;
    },
}));

describe("moderation render smoke", () => {
  test("PostContent keeps pin and status controls visible for admins on the v2 surface", () => {
    const html = renderToStaticMarkup(
      <PostContent
        post={{
          summary: "Heating issue",
          details: "<p>Broken radiator</p>",
          folders: ["repairs"],
          isPinned: true,
          urgency: "high",
          createdAt: "2026-03-12T12:00:00.000Z",
          viewCount: 12,
          isAnonymous: false,
          author: {username: "alex"},
        } as any}
        folders={[]}
        canEdit
        isEditing={false}
        editSummary=""
        editDetails=""
        editUrgency="low"
        editFolders={[]}
        resolvedStatus="open"
        isAdmin
        onStatusChange={() => {
        }}
        onEdit={() => {
        }}
        onDelete={() => {
        }}
        onSave={() => {
        }}
        onCancel={() => {
        }}
        onSummaryChange={() => {
        }}
        onDetailsChange={() => {
        }}
        onUrgencyChange={() => {
        }}
        onFoldersChange={() => {
        }}
        onTogglePin={() => {
        }}
      />,
    );

    expect(html).toContain("qa-v2-panel");
    expect(html).toContain("Pinned");
    expect(html).toContain("Status:");
  });

  test("AnswersSection keeps answer affordances reachable on the v2 surface", () => {
    const html = renderToStaticMarkup(
      <AnswersSection
        answers={[]}
        currentUserId="u1"
        currentRole="admin"
        isGuest={false}
        showAnswerBox={false}
        answerContent=""
        answerFocused={false}
        answerFiles={[]}
        answerEditing={null}
        answerEditContent=""
        error=""
        onShowAnswerBox={() => {
        }}
        onAnswerContentChange={() => {
        }}
        onAnswerFocus={() => {
        }}
        onAnswerFilesChange={() => {
        }}
        onSubmitAnswer={() => {
        }}
        onClearAnswer={() => {
        }}
        onEditAnswer={() => {
        }}
        onEditContentChange={() => {
        }}
        onSaveEdit={() => {
        }}
        onCancelEdit={() => {
        }}
        onDeleteAnswer={() => {
        }}
      />,
    );

    expect(html).toContain("qa-v2-panel");
    expect(html).toContain("Answers");
    expect(html).toContain("Write an answer");
  });

  test("DiscussionsSection keeps follow-up affordances reachable on the v2 surface", () => {
    const html = renderToStaticMarkup(
      <DiscussionsSection
        discussions={[]}
        currentUserId="u1"
        currentRole="admin"
        isGuest={false}
        showFollowBox={false}
        followFocused={false}
        discussionDrafts={{}}
        discussionReplying={null}
        discussionEditing={null}
        onShowFollowBox={() => {
        }}
        onFollowFocus={() => {
        }}
        onDraftChange={() => {
        }}
        onSubmit={() => {
        }}
        onUpdate={() => {
        }}
        onDelete={() => {
        }}
        onReply={() => {
        }}
        onEdit={() => {
        }}
        onCancelReply={() => {
        }}
        onCancelEdit={() => {
        }}
        onClearFollow={() => {
        }}
      />,
    );

    expect(html).toContain("qa-v2-panel");
    expect(html).toContain("Follow-up Discussion");
    expect(html).toContain("Write follow-up");
  });
});
