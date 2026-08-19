import Link from "next/link";
import { Badge, Form } from "react-bootstrap";
import { FileText, MessageSquareQuote, Shield } from "lucide-react";

import AceternityStatefulButton from "@/components/ui/AceternityStatefulButton";
import { ChatMessage, RagSession } from "../types";
import {
  AUTO_ANALYZE_QUESTION,
  FILE_SUGGESTED_PROMPTS,
  formatStatusLabel,
  formatStatusVariant,
  getEmptyStateMessage,
  ResultsPanelState,
  TEXT_RETRY_PROMPT_LABEL,
} from "../view-model";
import AnswerSections from "./AnswerSections";

type RevealingMessage = {
  key: string;
  fullText: string;
  visibleLength: number;
};

type ConversationProps = {
  showSession: boolean;
  resultsPanelState: ResultsPanelState;
  displayStatus: RagSession["status"];
  displaySourcePreview: string;
  activeSession: RagSession | null;
  activeMessages: ChatMessage[];
  pendingDraftSource: boolean;
  pendingUserQuestion: string | null;
  pendingAssistantLabel: string | null;
  revealingMessage: RevealingMessage | null;
  question: string;
  sendingMessage: boolean;
  onQuestionChange: (value: string) => void;
  onSubmitQuestion: (event: React.FormEvent<HTMLFormElement>) => void;
  onPrompt: (question: string) => void;
};

export default function Conversation({
  showSession,
  resultsPanelState,
  displayStatus,
  displaySourcePreview,
  activeSession,
  activeMessages,
  pendingDraftSource,
  pendingUserQuestion,
  pendingAssistantLabel,
  revealingMessage,
  question,
  sendingMessage,
  onQuestionChange,
  onSubmitQuestion,
  onPrompt,
}: ConversationProps) {
  return (
    <section className="review-results-section">
      <div className="review-results-header">
        <div>
          <h2 className="qa-page-title" style={{ fontSize: "1.4rem" }}>
            {showSession ? resultsPanelState.title : "Chat"}
          </h2>
          <p className="qa-page-sub">
            {showSession
              ? resultsPanelState.subtitle
              : "Create a source above, then ask questions here."}
          </p>
        </div>
        {showSession ? (
          <Badge bg={formatStatusVariant(displayStatus)}>
            {formatStatusLabel(displayStatus)}
          </Badge>
        ) : null}
      </div>

      {showSession ? (
        <>
          <div className="review-recs-panel">
            <div className="qa-sidebar-label">
              <FileText size={12}/>
              <span>Current source</span>
            </div>
            <p className="review-summary-text">{displaySourcePreview}</p>
            {activeSession?.error ? (
              <p className="text-danger mb-0 small">{activeSession.error}</p>
            ) : null}
          </div>

          <div className="review-next-step">
            <div className="qa-sidebar-label">
              <MessageSquareQuote size={12}/>
              <span>{resultsPanelState.conversationLabel}</span>
            </div>
            <div className="review-chat-log">
              {activeMessages.length > 0 || pendingDraftSource || pendingUserQuestion || pendingAssistantLabel ? (
                <>
                  {activeMessages.map((message, index) => {
                    const messageKey = `${message.createdAt}-${index}`;
                    const isRevealing = revealingMessage?.key === messageKey;
                    const messageBody = isRevealing
                      ? revealingMessage.fullText.slice(0, revealingMessage.visibleLength)
                      : message.content;

                    return (
                      <article
                        key={messageKey}
                        className={`review-chat-message review-chat-message-${message.role}`}
                      >
                        <div className="review-chat-role">{message.role}</div>
                        <AnswerSections
                          message={message}
                          messageKey={messageKey}
                          isRevealing={Boolean(isRevealing)}
                          messageBody={messageBody}
                        />
                      </article>
                    );
                  })}
                  {pendingUserQuestion ? (
                    <article className="review-chat-message review-chat-message-user">
                      <div className="review-chat-role">user</div>
                      <div className="review-chat-body">{pendingUserQuestion}</div>
                    </article>
                  ) : null}
                  {pendingAssistantLabel ? (
                    <article className="review-chat-message review-chat-message-assistant">
                      <div className="review-chat-role">assistant</div>
                      <div className="review-chat-body review-chat-body-pending">
                        {pendingAssistantLabel}
                      </div>
                    </article>
                  ) : null}
                </>
              ) : (
                <>
                  {activeSession?.status === "ready" ? (
                    <div className="review-prompt-grid">
                      {(activeSession.sourceKind === "upload"
                          ? FILE_SUGGESTED_PROMPTS
                          : [TEXT_RETRY_PROMPT_LABEL]
                      ).map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          className="review-prompt-chip"
                          onClick={() =>
                            onPrompt(
                              activeSession.sourceKind === "upload"
                                ? prompt
                                : AUTO_ANALYZE_QUESTION,
                            )
                          }
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="review-history-inline">
                    {getEmptyStateMessage({ activeSession })}
                  </div>
                </>
              )}
            </div>
          </div>

          {activeSession && !pendingDraftSource ? (
            <Form onSubmit={onSubmitQuestion} className="review-upload-stack">
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={question}
                  onChange={(event) => onQuestionChange(event.target.value)}
                  placeholder="Ask a question about this document or your housing issue."
                  className="review-textarea"
                />
              </Form.Group>

              <div className="review-form-footer">
                <div className="review-note">
                  <Shield size={14}/>
                  <span>
                    {activeSession.status === "ready"
                      ? "LeaseQA provides legal information, not legal advice."
                      : "Wait for indexing to finish before asking a question."}
                  </span>
                </div>
                <AceternityStatefulButton
                  type="submit"
                  status={sendingMessage ? "loading" : "idle"}
                  className="btn-unified btn-unified-primary btn-unified-md"
                  disabled={!question.trim() || activeSession.status !== "ready"}
                >
                  {sendingMessage ? "Sending" : "Send question"}
                </AceternityStatefulButton>
              </div>
            </Form>
          ) : (
            <div className="review-history-inline">
              Finishing the first answer. You can ask follow-up questions in a moment.
            </div>
          )}
        </>
      ) : (
        <div className="review-history-inline">
          Start a chat above or <Link href="/qa">browse community Q&amp;A</Link>.
        </div>
      )}
    </section>
  );
}
