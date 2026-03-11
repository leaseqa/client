"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Form, Spinner } from "react-bootstrap";
import { Clock3, FileText, MessageSquareQuote, Shield } from "lucide-react";

import ToastNotification, {
  ToastData,
} from "@/components/ui/ToastNotification";
import AceternityFileUpload from "@/components/ui/AceternityFileUpload";
import AceternityStatefulButton from "@/components/ui/AceternityStatefulButton";
import PageLoadingState from "@/components/ui/PageLoadingState";
import * as client from "./client";
import { ChatMessage, RagSession } from "./types";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

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
  const [sourceText, setSourceText] = useState("");
  const [question, setQuestion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [toast, setToast] = useState<ToastData>({
    show: false,
    message: "",
    type: "error",
  });

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

  const handleCreateSession = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!selectedFile && !sourceText.trim()) {
      showToast("Upload a PDF or paste text first.", "error");
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      formData.set("file", selectedFile);
    }
    if (sourceText.trim()) {
      formData.set("sourceText", sourceText.trim());
    }

    try {
      setCreatingSession(true);
      const created = await client.createSession(formData);
      setActiveSession(created);
      setSessions((current) => [
        created,
        ...current.filter((item) => item._id !== created._id),
      ]);
      setSourceText("");
      setSelectedFile(null);
      setUploadResetKey((current) => current + 1);
      showToast(
        created.status === "ready"
          ? "Source loaded. You can start asking questions now."
          : "Source uploaded. We are indexing it now.",
        "success",
      );
    } catch (error: any) {
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
    if (!activeSession) {
      showToast("Create a chat source first.", "error");
      return;
    }
    if (activeSession.status !== "ready") {
      showToast("This source is still indexing. Try again in a moment.", "error");
      return;
    }
    if (!question.trim()) {
      return;
    }

    try {
      setSendingMessage(true);
      const result = await client.sendMessage(activeSession._id, question.trim());
      setActiveSession(result.session);
      setSessions((current) => [
        result.session,
        ...current.filter((item) => item._id !== result.session._id),
      ]);
      setQuestion("");
    } catch (error: any) {
      showToast(
        error.response?.data?.error?.message || "Failed to send message.",
        "error",
      );
    } finally {
      setSendingMessage(false);
    }
  };

  const activeMessages: ChatMessage[] = activeSession?.messages || [];

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

      <section className="review-input-section">
        <Form onSubmit={handleCreateSession} className="review-upload-stack">
          <AceternityFileUpload
            key={uploadResetKey}
            name="file"
            accept="application/pdf,.docx,text/plain,.txt,text/markdown,.md"
            maxSizeMb={8}
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
              {creatingSession ? "Loading source" : "Start chat"}
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
              {activeSession ? "Ask follow-up questions" : "Chat"}
            </h2>
            <p className="qa-page-sub">
              {activeSession
                ? `Source: ${activeSession.sourceName}`
                : "Create a source above, then ask questions here."}
            </p>
          </div>
          {activeSession ? (
            <Badge bg={formatStatusVariant(activeSession.status)}>
              {formatStatusLabel(activeSession.status)}
            </Badge>
          ) : null}
        </div>

        {activeSession ? (
          <>
            <div className="review-recs-panel">
              <div className="qa-sidebar-label">
                <FileText size={12} />
                <span>Current source</span>
              </div>
              <p className="review-summary-text">{activeSession.sourceTextPreview}</p>
              {activeSession.error ? (
                <p className="text-danger mb-0 small">{activeSession.error}</p>
              ) : null}
            </div>

            <div className="review-next-step">
              <div className="qa-sidebar-label">
                <MessageSquareQuote size={12} />
                <span>Conversation</span>
              </div>
              <div className="review-chat-log">
                {activeMessages.length > 0 ? (
                  activeMessages.map((message, index) => (
                    <article
                      key={`${message.createdAt}-${index}`}
                      className={`review-chat-message review-chat-message-${message.role}`}
                    >
                      <div className="review-chat-role">{message.role}</div>
                      <div className="review-chat-body">{message.content}</div>
                      {message.citations.length > 0 ? (
                        <div className="review-chat-citations">
                          {message.citations.map((citation, citationIndex) => (
                            <div
                              key={`${citation.sourceName}-${citationIndex}`}
                              className="review-chat-citation"
                            >
                              <div className="review-chat-citation-title">
                                {citation.sourceUrl ? (
                                  <a
                                    href={citation.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {citation.sourceName}
                                    {citation.chapterRef
                                      ? ` · Chapter ${citation.chapterRef}`
                                      : ""}
                                  </a>
                                ) : (
                                  <>
                                    {citation.sourceName}
                                    {citation.chapterRef
                                      ? ` · Chapter ${citation.chapterRef}`
                                      : ""}
                                  </>
                                )}
                              </div>
                              <div className="review-chat-citation-copy">
                                {citation.snippet}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div className="review-history-inline">
                    Ask your first question about this source.
                  </div>
                )}
              </div>
            </div>

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
                      ? "Answers cite your source and handbook materials."
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
