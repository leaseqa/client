import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import Conversation from "./Conversation";
import type { ChatMessage, RagSession } from "../types";
import type { PendingAnswerView } from "../view-model";

vi.mock("@/components/ui/AceternityStatefulButton", () => ({
  default: ({ children }: { children: React.ReactNode }) => <button type="submit">{children}</button>,
}));

const messages: ChatMessage[] = [
  { role: "user", content: "Can they keep it?", citations: [], createdAt: "2026-10-01T00:00:00.000Z" },
  { role: "assistant", content: "Generally not.", citations: [], createdAt: "2026-10-01T00:01:00.000Z" },
];

const session: RagSession = {
  _id: "s1",
  status: "ready",
  error: null,
  sourceKind: "text",
  sourceName: "pasted-text",
  sourceMimeType: null,
  sourceTextPreview: "Tenant shall pay two months' rent.",
  sourceCharCount: 34,
  messages,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:01:00.000Z",
};

function renderConversation(
  status: RagSession["status"],
  pendingAnswer: PendingAnswerView | null = null,
) {
  return renderToStaticMarkup(
    <Conversation
      showSession
      resultsPanelState={{ title: "Pasted clause", subtitle: "", conversationLabel: "Conversation" }}
      displayStatus={status}
      displaySourcePreview={session.sourceTextPreview}
      activeSession={{ ...session, status }}
      activeMessages={messages}
      pendingDraftSource={false}
      pendingAnswer={pendingAnswer}
      question=""
      sendingMessage={false}
      onQuestionChange={() => {}}
      onSubmitQuestion={() => {}}
      onPrompt={() => {}}
    />,
  );
}

/** The streaming answer is the last turn in the log. */
function streamingTurn(html: string) {
  const start = html.lastIndexOf("<article");
  return html.slice(start, html.indexOf("</article>", start) + "</article>".length);
}

describe("Conversation", () => {
  test("states the source status as a label in the palette, not a Bootstrap badge", () => {
    const html = renderConversation("ready");
    expect(html).toContain('data-status="ready"');
    expect(html).toContain(">Ready<");
    expect(html).not.toMatch(/\bbadge\b|bg-success/);
  });

  test("marks a failed source with its own status", () => {
    expect(renderConversation("failed")).toContain('data-status="failed"');
  });

  test("labels turns as the renter and the answer, not raw roles", () => {
    const html = renderConversation("ready");
    expect(html).toContain(">You<");
    expect(html).toContain(">Answer<");
    expect(html).not.toContain(">user<");
    expect(html).not.toContain(">assistant<");
  });

  test("an answer with no text yet shows its stage with the caret after it", () => {
    const turn = streamingTurn(renderConversation("ready", {
      stageLabel: "Writing the answer",
      summary: "",
      bullets: [],
      caret: "label",
    }));

    expect(turn).toContain('aria-busy="true"');
    expect(turn).toMatch(
      /class="review-chat-body review-chat-body-pending">Writing the answer<span class="review-chat-caret" aria-hidden="true"><\/span><\/div>/,
    );
  });

  test("a streaming answer uses the finished layout, without citations, caret on the newest text", () => {
    const turn = streamingTurn(renderConversation("ready", {
      stageLabel: "Writing the answer",
      summary: "The deposit is too high.",
      bullets: ["Two months is over the cap.", "The fee"],
      caret: 1,
    }));

    expect(turn).toContain('aria-busy="true"');
    expect(turn).toContain('<p class="review-chat-summary">The deposit is too high.</p>');
    expect(turn).toContain(
      '<li class="review-chat-bullet-item"><span>Two months is over the cap.</span></li>',
    );
    expect(turn).toContain(
      '<li class="review-chat-bullet-item"><span>The fee</span><span class="review-chat-caret" aria-hidden="true"></span></li>',
    );
    expect(turn).not.toContain("review-chat-inline-citation");
    expect(turn).not.toContain("Writing the answer");
  });

  test("no answer is marked busy once nothing is streaming", () => {
    expect(renderConversation("ready")).not.toContain("aria-busy");
  });
});
