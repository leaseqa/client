import { Badge, Form } from "react-bootstrap";
import { MessageSquareQuote, Shield } from "lucide-react";

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
import styles from "../ai-review.module.css";

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
  question,
  sendingMessage,
  onQuestionChange,
  onSubmitQuestion,
  onPrompt,
}: ConversationProps) {
  return (
    <section className={styles.conversation} aria-labelledby="review-conversation-title">
      <div className={styles.conversationHeader}>
        <h2 id="review-conversation-title">Review</h2>
        {showSession ? (
          <Badge bg={formatStatusVariant(displayStatus)}>
            {formatStatusLabel(displayStatus)}
          </Badge>
        ) : (
          <span>No source added</span>
        )}
      </div>

      {showSession ? (
        <div className={styles.activeConversation}>
          <div className={styles.currentSource}>
            <h3>{resultsPanelState.title}</h3>
            <p className={styles.sourceStatus}>{resultsPanelState.subtitle}</p>
            <p className="review-summary-text">{displaySourcePreview}</p>
            {activeSession?.error ? (
              <p className="text-danger mb-0 small">{activeSession.error}</p>
            ) : null}
          </div>

          <div className={styles.chatArea}>
            <div className="qa-sidebar-label">
              <MessageSquareQuote size={12}/>
              <span>{resultsPanelState.conversationLabel}</span>
            </div>
            <div className="review-chat-log">
              {activeMessages.length > 0 || pendingDraftSource || pendingUserQuestion || pendingAssistantLabel ? (
                <>
                  {activeMessages.map((message, index) => {
                    const messageKey = `${message.createdAt}-${index}`;
                    return (
                      <article
                        key={messageKey}
                        className={`review-chat-message review-chat-message-${message.role}`}
                      >
                        <div className="review-chat-role">{message.role}</div>
                        <AnswerSections
                          message={message}
                          messageKey={messageKey}
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
            <Form onSubmit={onSubmitQuestion} className={styles.composer}>
              <Form.Group>
                <Form.Label className="visually-hidden" htmlFor="review-question">
                  Question about this lease
                </Form.Label>
                <Form.Control
                  id="review-question"
                  as="textarea"
                  rows={2}
                  value={question}
                  onChange={(event) => onQuestionChange(event.target.value)}
                  placeholder="Ask a question about this lease or clause."
                  className="review-textarea"
                />
              </Form.Group>

              <div className={styles.composerFooter}>
                <span>
                  <Shield size={14}/>
                  {activeSession.status === "ready"
                    ? "Answers include cited tenant guidance."
                    : "Wait for indexing to finish."}
                </span>
                <AceternityStatefulButton
                  type="submit"
                  status={sendingMessage ? "loading" : "idle"}
                  className="btn-warm-primary"
                  disabled={!question.trim() || activeSession.status !== "ready"}
                >
                  {sendingMessage ? "Sending" : "Ask"}
                </AceternityStatefulButton>
              </div>
            </Form>
          ) : (
            <div className="review-history-inline">
              Finishing the first answer. You can ask follow-up questions in a moment.
            </div>
          )}
        </div>
      ) : (
        <div className={styles.emptyConversation}>
          <div className={styles.emptyAccent}/>
          <h2>Clause context starts here.</h2>
          <ol>
            <li><span>01</span><strong>Exact lease language</strong></li>
            <li><span>02</span><strong>Cited tenant guidance</strong></li>
            <li><span>03</span><strong>Questions to verify</strong></li>
          </ol>
        </div>
      )}
    </section>
  );
}
