import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import Conversation from "./Conversation";
import type { ChatMessage, RagSession } from "../types";

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

function renderConversation(status: RagSession["status"]) {
  return renderToStaticMarkup(
    <Conversation
      showSession
      resultsPanelState={{ title: "Pasted clause", subtitle: "", conversationLabel: "Conversation" }}
      displayStatus={status}
      displaySourcePreview={session.sourceTextPreview}
      activeSession={{ ...session, status }}
      activeMessages={messages}
      pendingDraftSource={false}
      pendingUserQuestion={null}
      pendingAssistantLabel={null}
      question=""
      sendingMessage={false}
      onQuestionChange={() => {}}
      onSubmitQuestion={() => {}}
      onPrompt={() => {}}
    />,
  );
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
});
