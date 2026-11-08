"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import ToastNotification, { ToastData } from "@/components/ui/ToastNotification";
import PageLoadingState from "@/components/ui/PageLoadingState";
import { apiErrorMessage } from "@/app/lib/api/client";
import { RootState } from "@/app/store";
import { AnswerDraft, RagSession } from "./types";
import {
  applyAnswerEvent,
  createAnswerDraft,
  FIRST_ANSWER_FAILED,
  getDisplayedSource,
  getPendingAnswerView,
  getResultsPanelState,
  getSessionInputPlan,
  getVisibleMessages,
  PASTED_TEXT_SOURCE,
  PendingDraftSource,
} from "./view-model";
import { useRagConversation } from "./hooks/useRagConversation";
import { useRagSession } from "./hooks/useRagSession";
import { useRagSessions } from "./hooks/useRagSessions";
import SessionList from "./components/SessionList";
import SourceUploader from "./components/SourceUploader";
import Conversation from "./components/Conversation";
import styles from "./ai-review.module.css";

/** A new review's first answer in progress, and the source it reads. */
type PendingFirstAnswer = {
  source: PendingDraftSource;
  draft: AnswerDraft;
};

/** A follow-up answer in progress, and the review it belongs to. */
type PendingFollowUp = {
  sessionId: string;
  draft: AnswerDraft;
};

export default function AIReviewPage() {
  const router = useRouter();
  const session = useSelector(
    (currentState: RootState) => currentState.session,
  );
  const isAuthenticated = session.status === "authenticated";
  const isGuest = session.status === "guest";
  const hasAccess = isAuthenticated || isGuest;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [question, setQuestion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  // Streamed drafts. Each is cleared in the same update that brings in the
  // finished answer, so the draft never flashes away before it is replaced.
  const [pendingFirstAnswer, setPendingFirstAnswer] = useState<PendingFirstAnswer | null>(null);
  const [followUp, setFollowUp] = useState<PendingFollowUp | null>(null);
  const pendingDraftSource = pendingFirstAnswer?.source ?? null;
  const [toast, setToast] = useState<ToastData>({
    show: false,
    message: "",
    type: "error",
  });

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
  }, []);

  const {
    sessions,
    isLoading: loadingSessions,
    error: sessionsError,
    refetch: refetchSessions,
    createSession,
    isCreating: creatingSession,
  } = useRagSessions(hasAccess);

  const resolvedId = activeId || sessions[0]?._id || null;
  const { session: detailedSession } = useRagSession(resolvedId);
  const { sendAsync, isSending: sendingMessage } = useRagConversation(resolvedId);

  const activeSession =
    detailedSession ||
    sessions.find((item) => item._id === resolvedId) ||
    null;

  useEffect(() => {
    if ( session.status === "unauthenticated" ) {
      router.replace("/auth/login?next=%2Fai-review");
    }
  }, [session.status, router]);

  const displayedSource = useMemo(
    () =>
      getDisplayedSource({
        activeSession,
        pendingDraftSource,
        pendingStage: pendingFirstAnswer?.draft.stage ?? null,
      }),
    [activeSession, pendingDraftSource, pendingFirstAnswer?.draft.stage],
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
  const pendingAnswer = useMemo(() => {
    if ( pendingFirstAnswer ) {
      return getPendingAnswerView(pendingFirstAnswer.draft, pendingFirstAnswer.source.sourceKind);
    }
    if ( followUp && activeSession && followUp.sessionId === activeSession._id ) {
      return getPendingAnswerView(followUp.draft, activeSession.sourceKind);
    }
    return null;
  }, [activeSession, followUp, pendingFirstAnswer]);

  const submitQuestion = useCallback(async (rawQuestion: string) => {
    if ( !activeSession ) {
      showToast("Create a chat source first.", "error");
      return;
    }
    if ( activeSession.status !== "ready" ) {
      showToast("This source is still indexing. Try again in a moment.", "error");
      return;
    }

    const trimmedQuestion = rawQuestion.trim();
    if ( !trimmedQuestion ) {
      return;
    }

    const sessionId = activeSession._id;
    const isThisAnswer = (current: PendingFollowUp | null): current is PendingFollowUp =>
      current?.sessionId === sessionId;
    setQuestion("");
    setFollowUp({ sessionId, draft: createAnswerDraft("retrieving") });

    try {
      await sendAsync(trimmedQuestion, (serverEvent) => {
        setFollowUp((current) =>
          isThisAnswer(current)
            ? { sessionId, draft: applyAnswerEvent(current.draft, serverEvent) }
            : current,
        );
      });
    } catch ( error: unknown ) {
      setQuestion(trimmedQuestion);
      showToast(
        apiErrorMessage(error, "Failed to send message."),
        "error",
      );
    } finally {
      setFollowUp((current) => (isThisAnswer(current) ? null : current));
    }
  }, [activeSession, sendAsync, showToast]);

  const handleCreateSession = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const inputPlan = getSessionInputPlan({
      hasFile: Boolean(selectedFile),
      sourceText,
    });
    // Without an error the plan always carries the first question to ask.
    if ( inputPlan.error !== null ) {
      showToast(inputPlan.error, "error");
      return;
    }

    const formData = new FormData();
    if ( selectedFile ) {
      formData.set("file", selectedFile);
    }
    if ( sourceText.trim() ) {
      formData.set("sourceText", sourceText.trim());
    }
    formData.set("initialQuestion", inputPlan.initialQuestion);
    setPendingFirstAnswer({
      source: selectedFile
        ? { sourceName: selectedFile.name, sourcePreview: "", sourceKind: "upload" }
        : { sourceName: PASTED_TEXT_SOURCE, sourcePreview: sourceText.trim(), sourceKind: "text" },
      draft: createAnswerDraft("indexing"),
    });

    try {
      const created = await createSession(formData, (serverEvent) => {
        setPendingFirstAnswer((current) =>
          current ? { ...current, draft: applyAnswerEvent(current.draft, serverEvent) } : current,
        );
      });
      setPendingFirstAnswer(null);
      setActiveId(created._id);
      setSourceText("");
      setSelectedFile(null);
      setUploadResetKey((current) => current + 1);
      const hasAssistantAnswer = getVisibleMessages(created).some(
        (message) => message.role === "assistant",
      );
      if ( !hasAssistantAnswer ) {
        // The empty review below says how to try again; the toast only says what happened.
        showToast(FIRST_ANSWER_FAILED, "error");
      }
    } catch ( error: unknown ) {
      setPendingFirstAnswer(null);
      showToast(
        apiErrorMessage(error, "Failed to load source."),
        "error",
      );
    }
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitQuestion(question);
  };

  if ( session.status === "loading" || session.status === "unauthenticated" ) {
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
    <div className={styles.reviewPage}>
      <ToastNotification
        toast={toast}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <section className={styles.pageHeader} aria-labelledby="review-page-title">
        <h1 id="review-page-title">Review my lease</h1>
      </section>

      <div className={styles.workspace}>
        <aside className={styles.sourceRail} aria-label="Sources and review history">
          <SourceUploader
            sourceText={sourceText}
            selectedFile={selectedFile}
            uploadResetKey={uploadResetKey}
            creatingSession={creatingSession}
            pendingSourceKind={pendingDraftSource?.sourceKind ?? null}
            hasActiveSession={showSession}
            isGuest={isGuest}
            onSourceTextChange={setSourceText}
            onFilesChange={(files) => setSelectedFile(files[0] || null)}
            onSubmit={handleCreateSession}
          />

          <SessionList
            sessions={sessions}
            activeSessionId={resolvedId}
            loading={loadingSessions}
            isGuest={isGuest}
            error={sessionsError ? apiErrorMessage(sessionsError, "Failed to load reviews.") : null}
            onRetry={() => {
              void refetchSessions();
            }}
            onSelect={(item) => setActiveId(item._id)}
          />
        </aside>

        <Conversation
          showSession={showSession}
          resultsPanelState={resultsPanelState}
          displayStatus={displayStatus}
          displaySourcePreview={displaySourcePreview}
          activeSession={activeSession}
          activeMessages={activeMessages}
          pendingDraftSource={Boolean(pendingDraftSource)}
          pendingAnswer={pendingAnswer}
          question={question}
          sendingMessage={sendingMessage}
          onQuestionChange={setQuestion}
          onSubmitQuestion={handleSendMessage}
          onPrompt={(prompt) => void submitQuestion(prompt)}
        />
      </div>
    </div>
  );
}
