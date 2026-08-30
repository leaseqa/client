"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import ToastNotification, { ToastData } from "@/components/ui/ToastNotification";
import PageLoadingState from "@/components/ui/PageLoadingState";
import { apiErrorMessage } from "@/app/lib/api/client";
import { RootState } from "@/app/store";
import { RagSession } from "./types";
import {
  getDisplayedSource,
  getResultsPanelState,
  getSessionInputPlan,
  getVisibleMessages,
} from "./view-model";
import { useRagConversation } from "./hooks/useRagConversation";
import { useRagSession } from "./hooks/useRagSession";
import { useRagSessions } from "./hooks/useRagSessions";
import SessionList from "./components/SessionList";
import SourceUploader from "./components/SourceUploader";
import Conversation from "./components/Conversation";
import styles from "./ai-review.module.css";

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
  const [pendingDraftSource, setPendingDraftSource] = useState<{
    sourceName: string;
    sourcePreview: string;
  } | null>(null);
  const [pendingAssistantLabel, setPendingAssistantLabel] = useState<string | null>(null);
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

    setQuestion("");
    setPendingAssistantLabel("Searching the handbook");

    try {
      await sendAsync(trimmedQuestion);
      setPendingAssistantLabel(null);
    } catch ( error: unknown ) {
      setPendingAssistantLabel(null);
      setQuestion(trimmedQuestion);
      showToast(
        apiErrorMessage(error, "Failed to send message."),
        "error",
      );
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
    if ( inputPlan.error ) {
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
    if ( inputPlan.initialQuestion ) {
      formData.set("initialQuestion", inputPlan.initialQuestion);
      setPendingDraftSource({
        sourceName: "pasted-text",
        sourcePreview: sourceText.trim(),
      });
      setPendingAssistantLabel("Matching this clause against the handbook");
    } else {
      setPendingDraftSource(null);
      setPendingAssistantLabel(null);
    }

    try {
      const created = await createSession(formData);
      setPendingDraftSource(null);
      setPendingAssistantLabel(null);
      setActiveId(created._id);
      setSourceText("");
      setSelectedFile(null);
      setUploadResetKey((current) => current + 1);
      if ( inputPlan.initialQuestion ) {
        const hasAssistantAnswer = getVisibleMessages(created).some(
          (message) => message.role === "assistant",
        );
        if ( !hasAssistantAnswer ) {
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
    } catch ( error: unknown ) {
      setPendingDraftSource(null);
      setPendingAssistantLabel(null);
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
            pendingDraftSource={Boolean(pendingDraftSource)}
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
          pendingUserQuestion={null}
          pendingAssistantLabel={pendingAssistantLabel}
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
