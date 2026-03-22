"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Form, Spinner } from "react-bootstrap";
import { Clock3, FileText, MessageSquareQuote, Shield } from "lucide-react";

import ToastNotification, {
  ToastData,
} from "@/components/ui/ToastNotification";
import AceternityFileUpload from "@/components/ui/AceternityFileUpload";
import AceternityStatefulButton from "@/components/ui/AceternityStatefulButton";
import PageLoadingState from "@/components/ui/PageLoadingState";
import * as client from "./client";
import { RagSession, ResponseFraming } from "./types";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import {
  CHAT_UPLOAD_ACCEPT,
  CHAT_UPLOAD_MAX_MB,
  FILE_SUGGESTED_PROMPTS,
  AUTO_ANALYZE_QUESTION,
  getDisplayedSource,
  getEmptyStateMessage,
  getInlineCitationItems,
  getNextRevealLength,
  getResultsPanelState,
  SALIENT_BOUNDARY_LABEL,
  getSessionInputPlan,
  shouldShowLegacyCitationList,
  TEXT_RETRY_PROMPT_LABEL,
  getVisibleMessages,
} from "./view-model";

const formatStatusLabel = (status: RagSession["status"]) => {
  if (status === "ready") {
    return "Ready";
  }
  if (status === "failed") {
    return "Failed";
  }
  return "Indexing";
};

const formatStatusVariant = (status: RagSession["status"]) => {
  if (status === "ready") {
    return "success";
  }
  if (status === "failed") {
    return "danger";
  }
  return "warning";
};

export default function AIReviewPage() {
  const router = useRouter();
  const session = useSelector(
    (currentState: RootState) => currentState.session,
  );
  const isAuthenticated = session.status === "authenticated";
  const isGuest = session.status === "guest";
  const hasAccess = isAuthenticated || isGuest;

  const [sessions, setSessions] = useState<RagSession[]>([]);
  const [activeSession, setActiveSession] = useState<RagSession | null>(null);
  const showSalientBoundaryLabel = true;
  const responseFraming: ResponseFraming = "informational_detached";
  const [sourceText, setSourceText] = useState("");
  const [question, setQuestion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [pendingDraftSource, setPendingDraftSource] = useState<{
    sourceName: string;
    sourcePreview: string;
  } | null>(null);
  const [pendingUserQuestion, setPendingUserQuestion] = useState<string | null>(null);
  const [pendingAssistantLabel, setPendingAssistantLabel] = useState<string | null>(null);
  const [revealingMessage, setRevealingMessage] = useState<{
    key: string;
    fullText: string;
    visibleLength: number;
  } | null>(null);
  const [toast, setToast] = useState<ToastData>({
    show: false,
    message: "",
    type: "error",
  });
  const revealTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const data = await client.fetchSessions();
      setSessions(data);
      setActiveSession((current) => {
        if (!current) {
          return data[0] || null;
        }
        return data.find((item) => item._id === current._id) || data[0] || null;
      });
    } catch (error: any) {
      showToast(
        error.response?.data?.error?.message || "Failed to load chats.",
        "error",
      );
    } finally {
      setLoadingSessions(false);
    }
  }, [showToast]);

  const stopReveal = useCallback(() => {
    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setRevealingMessage(null);
  }, []);

  const startReveal = useCallback((messageKey: string, fullText: string) => {
    stopReveal();
    if (!fullText) {
      return;
    }
    setRevealingMessage({
      key: messageKey,
      fullText,
      visibleLength: 0,
    });
  }, [stopReveal]);

  const refreshActiveSession = useCallback(async (sessionId: string) => {
    try {
      const data = await client.fetchSessionById(sessionId);
      setActiveSession(data);
      setSessions((current) => {
        const next = current.filter((item) => item._id !== data._id);
        return [data, ...next];
      });
    } catch (error: any) {
      showToast(
        error.response?.data?.error?.message || "Failed to refresh this chat.",
        "error",
      );
    }
  }, [showToast]);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.replace("/auth/login?next=%2Fai-review");
      return;
    }
    if (hasAccess) {
      void loadSessions();
    }
  }, [session.status, router, hasAccess, loadSessions]);

  useEffect(() => {
    if (!activeSession || activeSession.status !== "indexing") {
      return;
    }

    const timer = window.setTimeout(() => {
      void refreshActiveSession(activeSession._id);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [activeSession, refreshActiveSession]);

  useEffect(() => {
    if (!revealingMessage) {
      return;
    }

    if (revealingMessage.visibleLength >= revealingMessage.fullText.length) {
      stopReveal();
      return;
    }

    revealTimerRef.current = window.setTimeout(() => {
      setRevealingMessage((current) => {
        if (!current) {
          return current;
        }
        const nextLength = getNextRevealLength(
          current.visibleLength,
          current.fullText,
        );
        if (nextLength >= current.fullText.length) {
          return null;
        }
        return {
          ...current,
          visibleLength: nextLength,
        };
      });
      revealTimerRef.current = null;
    }, 18);

    return () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [revealingMessage, stopReveal]);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
      }
    };
  }, []);

  const displayedSource = useMemo(
    () =>
      getDisplayedSource({
        activeSession,
        pendingDraftSource,
      }),
    [activeSession, pendingDraftSource],
  );
  const showSession = Boolean(displayedSource);
  const displaySourcePreview = displayedSource?.sourcePreview || "";
  const displayStatus: RagSession["status"] = displayedSource?.status || "ready";
  const resultsPanelState = useMemo(
    () =>
      getResultsPanelState({
        activeSession,
        pendingDraftSource,
      }),
    [activeSession, pendingDraftSource],
  );
  const activeMessages = useMemo(
    () => (pendingDraftSource ? [] : getVisibleMessages(activeSession)),
    [activeSession, pendingDraftSource],
  );

  const triggerLatestAssistantReveal = useCallback((session: RagSession) => {
    const visibleMessages = getVisibleMessages(session);
    const latestAssistantIndex = [...visibleMessages]
      .reverse()
      .findIndex((message) => message.role === "assistant");
    if (latestAssistantIndex === -1) {
      return;
    }
    const actualIndex = visibleMessages.length - 1 - latestAssistantIndex;
    const latestAssistant = visibleMessages[actualIndex];
    startReveal(`${latestAssistant.createdAt}-${actualIndex}`, latestAssistant.content);
  }, [startReveal]);

  const submitQuestion = useCallback(async (rawQuestion: string) => {
    if (!activeSession) {
      showToast("Create a chat source first.", "error");
      return;
    }
    if (activeSession.status !== "ready") {
      showToast("This source is still indexing. Try again in a moment.", "error");
      return;
    }

    const trimmedQuestion = rawQuestion.trim();
    if (!trimmedQuestion) {
      return;
    }

    stopReveal();
    setQuestion("");
    setPendingUserQuestion(trimmedQuestion);
    setPendingAssistantLabel("Researching the best supported answer...");

    try {
      setSendingMessage(true);
      const result = await client.sendMessage(
        activeSession._id,
        trimmedQuestion,
        responseFraming,
      );
      setPendingUserQuestion(null);
      setPendingAssistantLabel(null);
      setActiveSession(result.session);
      setSessions((current) => [
        result.session,
        ...current.filter((item) => item._id !== result.session._id),
      ]);
      triggerLatestAssistantReveal(result.session);
    } catch (error: any) {
      setPendingUserQuestion(null);
      setPendingAssistantLabel(null);
      setQuestion(trimmedQuestion);
      showToast(
        error.response?.data?.error?.message || "Failed to send message.",
        "error",
      );
    } finally {
      setSendingMessage(false);
    }
  }, [
    activeSession,
    responseFraming,
    showToast,
    stopReveal,
    triggerLatestAssistantReveal,
  ]);

  const handleCreateSession = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const inputPlan = getSessionInputPlan({
      hasFile: Boolean(selectedFile),
      sourceText,
    });
    if (inputPlan.error) {
      showToast(inputPlan.error, "error");
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      formData.set("file", selectedFile);
    }
    if (sourceText.trim()) {
      formData.set("sourceText", sourceText.trim());
    }
    if (inputPlan.initialQuestion) {
      formData.set("initialQuestion", inputPlan.initialQuestion);
      formData.set("responseFraming", responseFraming);
      setPendingDraftSource({
        sourceName: "pasted-text",
        sourcePreview: sourceText.trim(),
      });
      setPendingAssistantLabel("Analyzing this clause against the handbook...");
    } else {
      setPendingDraftSource(null);
      setPendingAssistantLabel(null);
    }

    try {
      setCreatingSession(true);
      stopReveal();
      const created = await client.createSession(formData);
      setPendingDraftSource(null);
      setPendingAssistantLabel(null);
      setActiveSession(created);
      setSessions((current) => [
        created,
        ...current.filter((item) => item._id !== created._id),
      ]);
      setSourceText("");
      setSelectedFile(null);
      setUploadResetKey((current) => current + 1);
      if (inputPlan.initialQuestion) {
        const hasAssistantAnswer = getVisibleMessages(created).some(
          (message) => message.role === "assistant",
        );
        if (hasAssistantAnswer) {
          triggerLatestAssistantReveal(created);
        } else {
          showToast(
            "The first answer failed. Retry the clause analysis or ask your own question.",
            "error",
          );
        }
      } else {
        showToast(
          created.status === "ready"
            ? "Source loaded. Pick a suggested question or ask your own."
            : "Source uploaded. We are indexing it now.",
          "success",
        );
      }
    } catch (error: any) {
      setPendingDraftSource(null);
      setPendingAssistantLabel(null);
      showToast(
        error.response?.data?.error?.message || "Failed to load source.",
        "error",
      );
    } finally {
      setCreatingSession(false);
    }
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitQuestion(question);
  };

  if (session.status === "loading" || session.status === "unauthenticated") {
    return (
      <PageLoadingState
        message={
          session.status === "loading"
            ? "Loading review tools..."
            : "Redirecting to login..."
        }
      />
    );
  }

  return (
    <div className="review-flow">
      <ToastNotification
        toast={toast}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <section className="review-header-section">
        <h1 className="qa-page-title">Upload a lease or paste one clause.</h1>
        <p className="qa-page-sub">
          Ask questions against your document and compare it with the
          tenant-rights handbook.
        </p>
      </section>

      {showSalientBoundaryLabel ? (
        <Alert variant="warning" className="mb-0">
          {SALIENT_BOUNDARY_LABEL}
        </Alert>
      ) : null}

      <section className="review-input-section">
        <Form onSubmit={handleCreateSession} className="review-upload-stack">
          <AceternityFileUpload
            key={uploadResetKey}
            name="file"
            accept={CHAT_UPLOAD_ACCEPT}
            maxSizeMb={CHAT_UPLOAD_MAX_MB}
            onFilesChangeAction={(files) => setSelectedFile(files[0] || null)}
          />

          <div className="review-divider">or paste text</div>

          <Form.Group>
            <Form.Control
              as="textarea"
              name="sourceText"
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              rows={6}
              placeholder="Paste the lease clause, notice, or housing text you want to ask about."
              className="review-textarea"
            />
          </Form.Group>

          <div className="review-form-footer">
            <div className="review-note">
              <Shield size={14} />
              <span>
                {isGuest
                  ? "Guest chats stay in this browser session."
                  : "Not legal advice."}
              </span>
            </div>
            <AceternityStatefulButton
              type="submit"
              status={creatingSession ? "loading" : "idle"}
              className="btn-unified btn-unified-primary btn-unified-md"
            >
              {creatingSession
                ? pendingDraftSource
                  ? "Analyzing clause"
                  : "Loading source"
                : selectedFile
                  ? "Start chat"
                  : sourceText.trim()
                    ? "Analyze clause"
                    : "Start chat"}
            </AceternityStatefulButton>
          </div>
        </Form>
      </section>

      <section className="review-history-section">
        <div className="review-history-header">
          <div className="qa-sidebar-label">
            <Clock3 size={12} />
            <span>History</span>
          </div>
          {isGuest ? (
            <span className="review-history-hint">Temporary for this guest session</span>
          ) : null}
        </div>

        {loadingSessions ? (
          <div className="review-history-inline">
            <Spinner size="sm" />
            <span>Loading...</span>
          </div>
        ) : sessions.length > 0 ? (
          <div className="review-history-chips">
            {sessions.map((item) => {
              const isActive = activeSession?._id === item._id;
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setActiveSession(item)}
                  className={`review-history-chip ${isActive ? "is-active" : ""}`}
                >
                  <span>{item.sourceName}</span>
                  <span className="review-history-chip-date">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="review-history-inline">
            No chats yet. Start one above.
          </div>
        )}
      </section>

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
                <FileText size={12} />
                <span>Current source</span>
              </div>
              <p className="review-summary-text">{displaySourcePreview}</p>
              {activeSession?.error ? (
                <p className="text-danger mb-0 small">{activeSession.error}</p>
              ) : null}
            </div>

            <div className="review-next-step">
              <div className="qa-sidebar-label">
                <MessageSquareQuote size={12} />
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
                          {isRevealing || !message.summary || !message.bullets?.length ? (
                            <>
                              <div
                                className={`review-chat-body ${isRevealing ? "is-revealing" : ""}`}
                              >
                                {messageBody}
                              </div>
                              {shouldShowLegacyCitationList(message) ? (
                                <div className="review-chat-inline-citations review-chat-inline-citations-block">
                                  {getInlineCitationItems({
                                    citations: message.citations,
                                    citationIndices: message.citations.map((_, citationIndex) => citationIndex),
                                  }).map((citation, citationIndex) =>
                                    citation.sourceUrl ? (
                                      <a
                                        key={`${messageKey}-legacy-${citationIndex}`}
                                        href={citation.sourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="review-chat-inline-citation"
                                      >
                                        {citation.label}
                                      </a>
                                    ) : (
                                      <span
                                        key={`${messageKey}-legacy-${citationIndex}`}
                                        className="review-chat-inline-citation is-static"
                                      >
                                        {citation.label}
                                      </span>
                                    ),
                                  )}
                                </div>
                              ) : null}
                            </>
                          ) : (
                            <div className="review-chat-structured">
                              <p className="review-chat-summary">{message.summary}</p>
                              <ul className="review-chat-bullet-list">
                                {message.bullets.map((bullet, bulletIndex) => (
                                  <li
                                    key={`${messageKey}-bullet-${bulletIndex}`}
                                    className="review-chat-bullet-item"
                                  >
                                    <span>{bullet.text}</span>
                                    {bullet.citationIndices.length > 0 ? (
                                    <span className="review-chat-inline-citations">
                                        {getInlineCitationItems({
                                          citations: message.citations,
                                          citationIndices: bullet.citationIndices,
                                        }).map((citation, citationIndex) =>
                                          citation.sourceUrl ? (
                                            <a
                                              key={`${messageKey}-${bulletIndex}-${citationIndex}`}
                                              href={citation.sourceUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="review-chat-inline-citation"
                                            >
                                              {citation.label}
                                            </a>
                                          ) : (
                                            <span
                                              key={`${messageKey}-${bulletIndex}-${citationIndex}`}
                                              className="review-chat-inline-citation is-static"
                                            >
                                              {citation.label}
                                            </span>
                                          ),
                                        )}
                                      </span>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
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
                              void submitQuestion(
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
              <Form onSubmit={handleSendMessage} className="review-upload-stack">
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Ask a question about this document or your housing issue."
                    className="review-textarea"
                  />
                </Form.Group>

                <div className="review-form-footer">
                  <div className="review-note">
                    <Shield size={14} />
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
    </div>
  );
}
