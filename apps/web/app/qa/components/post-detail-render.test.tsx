import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
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
          author: { username: "alex" },
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
    expect(html).toContain("Follow-up discussion");
    expect(html).toContain("Write follow-up");
  });
});

function renderPostContent(overrides: Record<string, unknown> = {}) {
  const noop = () => {
  };
  return renderToStaticMarkup(
    <PostContent
      post={{
        summary: "Heating issue",
        details: "<p>Broken radiator</p>",
        folders: ["repairs"],
        isPinned: false,
        urgency: "high",
        createdAt: "2026-03-12T12:00:00.000Z",
        viewCount: 12,
        isAnonymous: false,
        author: { username: "alex" },
      } as any}
      folders={[{ _id: "f1", name: "repairs", displayName: "Repairs & Habitability", description: "", color: "" }]}
      canEdit
      isEditing={false}
      editSummary=""
      editDetails=""
      editUrgency="low"
      editFolders={[]}
      resolvedStatus="open"
      isAdmin={false}
      onStatusChange={noop}
      onEdit={noop}
      onDelete={noop}
      onSave={noop}
      onCancel={noop}
      onSummaryChange={noop}
      onDetailsChange={noop}
      onUrgencyChange={noop}
      onFoldersChange={noop}
      onTogglePin={noop}
      {...overrides}
    />,
  );
}

describe("question thread details", () => {
  test("names a post's topic by its display name, not its slug", () => {
    const html = renderPostContent();
    expect(html).toContain("Repairs &amp; Habitability");
    expect(html).not.toMatch(/>repairs</);
  });

  test("marks high urgency in words", () => {
    const html = renderPostContent();
    expect(html).toContain(">Urgent<");
    expect(html).not.toContain("HIGH");
  });

  test("groups the status radios so the keyboard can move between them", () => {
    const html = renderPostContent();
    expect(html.match(/name="post-status"/g)).toHaveLength(2);
  });

  test("gives the answer edit and delete buttons a name", () => {
    const noop = () => {
    };
    const html = renderToStaticMarkup(
      <AnswersSection
        answers={[{
          _id: "a1",
          postId: "p1",
          authorId: "u1",
          answerType: "community_answer",
          content: "<p>Call 311.</p>",
          createdAt: "2026-03-12T12:00:00.000Z",
          author: { username: "sam" },
        }]}
        currentUserId="u1"
        currentRole="tenant"
        isGuest={false}
        showAnswerBox={false}
        answerContent=""
        answerFocused={false}
        answerFiles={[]}
        answerEditing={null}
        answerEditContent=""
        error=""
        onShowAnswerBox={noop}
        onAnswerContentChange={noop}
        onAnswerFocus={noop}
        onAnswerFilesChange={noop}
        onSubmitAnswer={noop}
        onClearAnswer={noop}
        onEditAnswer={noop}
        onEditContentChange={noop}
        onSaveEdit={noop}
        onCancelEdit={noop}
        onDeleteAnswer={noop}
      />,
    );
    expect(html).toContain('aria-label="Edit answer"');
    expect(html).toContain('aria-label="Delete answer"');
  });
});
