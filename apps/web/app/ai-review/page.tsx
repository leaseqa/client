"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Badge, Form, Spinner } from "react-bootstrap";
import { Clock3, FileText, MessageSquareQuote, Shield } from "lucide-react";

import ToastNotification, {
  ToastData,
} from "@/components/ui/ToastNotification";
import AceternityFileUpload from "@/components/ui/AceternityFileUpload";
import AceternityStatefulButton from "@/components/ui/AceternityStatefulButton";
import PageLoadingState from "@/components/ui/PageLoadingState";
import * as client from "./client";
import { RagSession } from "./types";
import * as studyClient from "../study/client";
import { buildQualtricsReturnUrl } from "../study/qualtrics";
import { StudySessionView } from "../study/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setGuestSession } from "@/app/store";
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
  getSessionInputPlan,
  getStudyQueryState,
  getStudyUiState,
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
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const session = useSelector(
    (currentState: RootState) => currentState.session,
  );
  const isAuthenticated = session.status === "authenticated";
  const isGuest = session.status === "guest";
  const hasAccess = isAuthenticated || isGuest;
  const searchParamsString = searchParams.toString();
  const studyQuery = useMemo(
    () => getStudyQueryState(searchParams),
    [searchParamsString, searchParams],
  );
  const isStudyMode = studyQuery.enabled;
  const configuredReturnUrl =
    searchParams.get("returnUrl") ||
    process.env.NEXT_PUBLIC_STUDY_QUALTRICS_RETURN_URL ||
    "";

  const [sessions, setSessions] = useState<RagSession[]>([]);
  const [activeSession, setActiveSession] = useState<RagSession | null>(null);
  const [studyView, setStudyView] = useState<StudySessionView | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [question, setQuestion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [completingStudy, setCompletingStudy] = useState(false);
  const [studyCompletionNotice, setStudyCompletionNotice] = useState("");
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

  const applyStudyView = useCallback((nextStudyView: StudySessionView) => {
    setStudyView(nextStudyView);
    setActiveSession(nextStudyView.ragSession);
    setSessions(nextStudyView.ragSession ? [nextStudyView.ragSession] : []);
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

  const loadStudySession = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const nextStudyView = studyQuery.studySessionId
        ? await studyClient.fetchStudySession(studyQuery.studySessionId)
        : await studyClient.createStudySession(
            studyQuery.participantId,
            studyQuery.scenarioId,
          );

      applyStudyView(nextStudyView);

      if (!studyQuery.studySessionId && nextStudyView.studySessionId) {
        const nextParams = new URLSearchParams(searchParamsString);
        nextParams.set("study", "1");
        nextParams.set("participantId", studyQuery.participantId);
        nextParams.set("scenarioId", studyQuery.scenarioId);
        nextParams.set("studySessionId", nextStudyView.studySessionId);
        router.replace(`/ai-review?${nextParams.toString()}`);
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.error?.message ||
          "Failed to load the assigned study scenario.",
        "error",
      );
    } finally {
      setLoadingSessions(false);
    }
  }, [
    applyStudyView,
    router,
    searchParamsString,
    showToast,
    studyQuery.participantId,
    studyQuery.scenarioId,
    studyQuery.studySessionId,
  ]);

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
      if (isStudyMode) {
        localStorage.setItem("guest_session", "true");
        dispatch(setGuestSession());
        return;
      }
      router.replace("/auth/login?next=%2Fai-review");
      return;
    }
    if (hasAccess) {
      if (isStudyMode) {
        void loadStudySession();
      } else {
        void loadSessions();
      }
    }
  }, [
    dispatch,
    hasAccess,
    isStudyMode,
    loadSessions,
    loadStudySession,
    router,
    session.status,
  ]);

  useEffect(() => {
    if (!activeSession || activeSession.status !== "indexing") {
      return;
    }

    const timer = window.setTimeout(() => {
      if (isStudyMode && studyView?.studySessionId) {
        void studyClient
          .fetchStudySession(studyView.studySessionId)
          .then((nextStudyView) => applyStudyView(nextStudyView))
          .catch((error: any) =>
            showToast(
              error.response?.data?.error?.message ||
                "Failed to refresh this study chat.",
              "error",
            ),
          );
        return;
      }
      void refreshActiveSession(activeSession._id);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [
    activeSession,
    applyStudyView,
    isStudyMode,
    refreshActiveSession,
    showToast,
    studyView?.studySessionId,
  ]);

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
      showToast(
        isStudyMode ? "The assigned study source is still loading." : "Create a chat source first.",
        "error",
      );
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
      if (isStudyMode) {
        if (!studyView?.studySessionId) {
          throw new Error("Study session is still loading.");
        }
        const result = await studyClient.sendStudyMessage(
          studyView.studySessionId,
          trimmedQuestion,
        );
        setPendingUserQuestion(null);
        setPendingAssistantLabel(null);
        applyStudyView(result.studySession);
        if (result.studySession.ragSession) {
          triggerLatestAssistantReveal(result.studySession.ragSession);
        }
        return;
      }

      const result = await client.sendMessage(activeSession._id, trimmedQuestion);
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
    applyStudyView,
    isStudyMode,
    showToast,
    stopReveal,
    studyView?.studySessionId,
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

  const handleCompleteStudy = useCallback(async () => {
    if (!studyView?.studySessionId) {
      return;
    }

    try {
      setCompletingStudy(true);
      const completed = await studyClient.completeStudySession(studyView.studySessionId);
      setStudyView((current) =>
        current
          ? {
              ...current,
              status: (completed.status as StudySessionView["status"]) || "completed",
              completedAt: completed.completedAt || current.completedAt || null,
            }
          : current,
      );
      const returnUrl = buildQualtricsReturnUrl({
        baseUrl: configuredReturnUrl,
        participantId: studyQuery.participantId,
        studySessionId: studyView.studySessionId,
        conditionId: studyView.conditionId,
      });
      if (returnUrl) {
        window.location.assign(returnUrl);
        return;
      }
      setStudyCompletionNotice(
        "Study session marked complete. Add a Qualtrics return URL to redirect automatically.",
      );
    } catch (error: any) {
      showToast(
        error.response?.data?.error?.message ||
          "Failed to complete this study session.",
        "error",
      );
    } finally {
      setCompletingStudy(false);
    }
  }, [
    configuredReturnUrl,
    showToast,
    studyQuery.participantId,
    studyView?.conditionId,
    studyView?.studySessionId,
  ]);

  const studyUi = useMemo(() => getStudyUiState(studyView), [studyView]);
  const canSendStudyMainQuestion =
    isStudyMode && studyUi.canSendFixedQuestion && activeSession?.status === "ready";
  const canSendStudyFollowUp =
    isStudyMode && studyUi.canSendFollowUp && activeSession?.status === "ready";
  const showStudyComposer = isStudyMode && Boolean(studyView);

  if (
    session.status === "loading" ||
    (session.status === "unauthenticated" && !isStudyMode) ||
    (isStudyMode && !hasAccess) ||
    (isStudyMode && loadingSessions && !studyView)
  ) {
    return (
      <PageLoadingState
        message={
          isStudyMode && session.status !== "loading"
            ? "Preparing study session..."
            : session.status === "loading"
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
        {isStudyMode ? (
          <>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <Badge bg="dark" pill>
                UPL study
              </Badge>
              {studyView?.conditionId ? (
                <span className="qa-page-sub">{studyUi.taskTitle}</span>
              ) : null}
            </div>
            <h1 className="qa-page-title">Review the assigned housing scenario.</h1>
            <p className="qa-page-sub">
              {studyView?.scenario.taskInstructions ||
                "Use the assigned scenario in the original LeaseQA interface."}
            </p>
          </>
        ) : (
          <>
            <h1 className="qa-page-title">Upload a lease or paste one clause.</h1>
            <p className="qa-page-sub">
              Ask questions against your document and compare it with the
              tenant-rights handbook.
            </p>
          </>
        )}
      </section>

      {isStudyMode && studyUi.banner ? (
        <Alert variant="warning" className="mb-0">
          {studyUi.banner}
        </Alert>
      ) : null}
      {isStudyMode && studyCompletionNotice ? (
        <Alert variant="success" className="mb-0">
          {studyCompletionNotice}
        </Alert>
      ) : null}

      <section className="review-input-section">
        {isStudyMode ? (
          <div className="review-recs-panel">
            <div className="review-next-steps">
              <div className="review-next-step">
                <div className="qa-sidebar-label">
                  <FileText size={12} />
                  <span>Scenario</span>
                </div>
                <p className="panel-copy mb-0">{studyUi.taskIntroduction}</p>
              </div>
              <div className="review-next-step">
                <div className="qa-sidebar-label">
                  <MessageSquareQuote size={12} />
                  <span>Fixed Main Question</span>
                </div>
                <p className="panel-copy mb-0">{studyUi.mainQuestion}</p>
              </div>
            </div>
          </div>
        ) : (
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
        )}
      </section>

      <section className="review-history-section">
        <div className="review-history-header">
          <div className="qa-sidebar-label">
            <Clock3 size={12} />
            <span>{isStudyMode ? "Assigned source" : "History"}</span>
          </div>
          {isStudyMode ? (
            <span className="review-history-hint">Study mode uses one fixed source</span>
          ) : isGuest ? (
            <span className="review-history-hint">Temporary for this guest session</span>
          ) : null}
        </div>

        {loadingSessions ? (
          <div className="review-history-inline">
            <Spinner size="sm" />
            <span>Loading...</span>
          </div>
        ) : isStudyMode ? (
          activeSession ? (
            <div className="review-history-chips">
              <div className="review-history-chip is-active">
                <span>{activeSession.sourceName}</span>
                <span className="review-history-chip-date">Assigned</span>
              </div>
            </div>
          ) : (
            <div className="review-history-inline">Loading the assigned source...</div>
          )
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
              {showSession
                ? isStudyMode
                  ? "Conversation"
                  : resultsPanelState.title
                : "Chat"}
            </h2>
            <p className="qa-page-sub">
              {showSession
                ? isStudyMode
                  ? studyUi.helperText
                  : resultsPanelState.subtitle
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
                    {activeSession?.status === "ready" && !isStudyMode ? (
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
                      {isStudyMode
                        ? studyUi.helperText
                        : getEmptyStateMessage({ activeSession })}
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
                    placeholder={
                      isStudyMode
                        ? studyUi.composerPlaceholder
                        : "Ask a question about this document or your housing issue."
                    }
                    className="review-textarea"
                    disabled={showStudyComposer ? !canSendStudyFollowUp : false}
                  />
                </Form.Group>

                <div className="review-form-footer">
                  <div className="review-note">
                    <Shield size={14} />
                    <span>
                      {showStudyComposer
                        ? studyUi.footerCue
                        : activeSession.status === "ready"
                          ? "LeaseQA provides legal information, not legal advice."
                          : "Wait for indexing to finish before asking a question."}
                    </span>
                  </div>
                  {showStudyComposer ? (
                    <div className="d-flex gap-2 flex-wrap">
                      {canSendStudyMainQuestion ? (
                        <button
                          type="button"
                          className="btn btn-dark"
                          disabled={sendingMessage}
                          onClick={() => void submitQuestion(studyUi.mainQuestion)}
                        >
                          {sendingMessage ? "Sending..." : "Send fixed question"}
                        </button>
                      ) : null}
                      {studyUi.canSendFollowUp ? (
                        <AceternityStatefulButton
                          type="submit"
                          status={sendingMessage ? "loading" : "idle"}
                          className="btn-unified btn-unified-primary btn-unified-md"
                          disabled={!question.trim() || !canSendStudyFollowUp}
                        >
                          {sendingMessage ? "Sending" : "Send follow-up"}
                        </AceternityStatefulButton>
                      ) : null}
                      {studyUi.canComplete ? (
                        <button
                          type="button"
                          className="btn btn-dark"
                          disabled={completingStudy}
                          onClick={() => void handleCompleteStudy()}
                        >
                          {completingStudy ? "Finishing..." : "Continue to survey"}
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <AceternityStatefulButton
                      type="submit"
                      status={sendingMessage ? "loading" : "idle"}
                      className="btn-unified btn-unified-primary btn-unified-md"
                      disabled={!question.trim() || activeSession.status !== "ready"}
                    >
                      {sendingMessage ? "Sending" : "Send question"}
                    </AceternityStatefulButton>
                  )}
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
