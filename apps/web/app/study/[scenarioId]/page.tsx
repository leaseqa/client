"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Alert, Badge, Form, Spinner } from "react-bootstrap";

import PageLoadingState from "@/components/ui/PageLoadingState";

import {
  getInlineCitationItems,
  getVisibleMessages,
  shouldShowLegacyCitationList,
} from "../../ai-review/view-model";
import * as client from "../client";
import { buildQualtricsReturnUrl } from "../qualtrics";
import { StudySessionView } from "../types";
import { getStudyActionState, getStudyShellState } from "../view-model";

function getScenarioIdFromParams(
  scenarioParam: string | string[] | undefined,
): string {
  if (Array.isArray(scenarioParam)) {
    return scenarioParam[0] || "";
  }

  return scenarioParam || "";
}

export default function StudyScenarioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ scenarioId?: string | string[] }>();
  const scenarioId = getScenarioIdFromParams(params?.scenarioId);
  const searchParamsString = searchParams.toString();
  const requestedSessionId = searchParams.get("studySessionId");
  const participantId =
    searchParams.get("participantId") ||
    searchParams.get("ResponseID") ||
    "pilot-participant";
  const configuredReturnUrl =
    searchParams.get("returnUrl") ||
    process.env.NEXT_PUBLIC_STUDY_QUALTRICS_RETURN_URL ||
    "";

  const [studyView, setStudyView] = useState<StudySessionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [error, setError] = useState("");
  const [completionNotice, setCompletionNotice] = useState("");

  const currentStudySessionId = studyView?.studySessionId || null;

  useEffect(() => {
    let cancelled = false;

    if (requestedSessionId && requestedSessionId === currentStudySessionId) {
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      setLoading(true);
      setError("");

      try {
        const nextView = requestedSessionId
          ? await client.fetchStudySession(requestedSessionId)
          : await client.createStudySession(participantId, scenarioId);

        if (cancelled) {
          return;
        }

        setStudyView(nextView);

        if (!requestedSessionId && nextView.studySessionId) {
          const nextParams = new URLSearchParams(searchParamsString);
          nextParams.set("studySessionId", nextView.studySessionId);
          if (!nextParams.get("participantId")) {
            nextParams.set("participantId", participantId);
          }
          router.replace(
            `/study/${encodeURIComponent(scenarioId)}?${nextParams.toString()}`,
          );
        }
      } catch (loadError: any) {
        if (!cancelled) {
          setError(
            loadError.response?.data?.error?.message ||
              "Failed to load this study session.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [
    currentStudySessionId,
    participantId,
    requestedSessionId,
    router,
    scenarioId,
    searchParamsString,
  ]);

  const shellState = useMemo(
    () =>
      getStudyShellState({
        scenarioTitle: studyView?.scenario.title || `Scenario ${scenarioId}`,
        boundaryCue: studyView?.boundaryCue || "low",
      }),
    [scenarioId, studyView?.boundaryCue, studyView?.scenario.title],
  );

  const actionState = useMemo(
    () =>
      getStudyActionState({
        turnCount: studyView?.turnCount || 0,
        remainingFollowUps: studyView?.remainingFollowUps || 0,
        status: studyView?.status || "active",
      }),
    [studyView?.remainingFollowUps, studyView?.status, studyView?.turnCount],
  );

  const visibleMessages = useMemo(
    () => getVisibleMessages(studyView?.ragSession || null),
    [studyView?.ragSession],
  );

  const completeReturnUrl = useMemo(() => {
    if (!studyView?.studySessionId) {
      return null;
    }

    return buildQualtricsReturnUrl({
      baseUrl: configuredReturnUrl,
      participantId,
      studySessionId: studyView.studySessionId,
      conditionId: studyView.conditionId,
    });
  }, [
    configuredReturnUrl,
    participantId,
    studyView?.conditionId,
    studyView?.studySessionId,
  ]);

  const submitStudyMessage = async (rawMessage: string) => {
    if (!studyView?.studySessionId) {
      return;
    }

    const trimmedMessage = rawMessage.trim();
    if (!trimmedMessage) {
      return;
    }

    try {
      setSending(true);
      setError("");
      const result = await client.sendStudyMessage(
        studyView.studySessionId,
        trimmedMessage,
      );
      setStudyView(result.studySession);
      setMessageDraft("");
    } catch (sendError: any) {
      setError(
        sendError.response?.data?.error?.message ||
          "Failed to send the study question.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleStartMainQuestion = async () => {
    if (!studyView) {
      return;
    }

    await submitStudyMessage(studyView.scenario.mainQuestion);
  };

  const handleSendFollowUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitStudyMessage(messageDraft);
  };

  const handleComplete = async () => {
    if (!studyView?.studySessionId) {
      return;
    }

    try {
      setCompleting(true);
      setError("");
      const completed = await client.completeStudySession(studyView.studySessionId);
      setStudyView((current) =>
        current
          ? {
              ...current,
              status: (completed.status as StudySessionView["status"]) || "completed",
              completedAt: completed.completedAt || current.completedAt || null,
            }
          : current,
      );

      if (completeReturnUrl) {
        window.location.assign(completeReturnUrl);
        return;
      }

      setCompletionNotice(
        "Study session marked complete. Add a Qualtrics return URL to redirect automatically.",
      );
    } catch (completeError: any) {
      setError(
        completeError.response?.data?.error?.message ||
          "Failed to complete this study session.",
      );
    } finally {
      setCompleting(false);
    }
  };

  if (loading && !studyView) {
    return <PageLoadingState message="Loading study session..." />;
  }

  return (
    <div className="review-flow">
      <section className="review-header-section">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <Badge bg="dark" pill>
            UPL study
          </Badge>
          <span className="qa-page-sub">{shellState.scenarioLabel}</span>
        </div>
        <h1 className="qa-page-title">{shellState.studyTitle}</h1>
        <p className="qa-page-sub">
          {studyView?.scenario.taskInstructions ||
            "Use the fixed scenario and question, then complete the short study task."}
        </p>
        <p className="qa-page-sub">
          Stay on this page until you finish the task. The study view hides the
          normal site navigation on purpose.
        </p>
      </section>

      {shellState.banner ? (
        <Alert variant="warning" className="mb-0">
          {shellState.banner}
        </Alert>
      ) : null}

      {error ? <Alert variant="danger">{error}</Alert> : null}
      {completionNotice ? <Alert variant="success">{completionNotice}</Alert> : null}

      <section className="review-recs-panel">
        <div className="review-next-steps">
          <div className="review-next-step">
            <div className="qa-sidebar-label">Scenario</div>
            <p className="panel-copy mb-0">
              {studyView?.scenario.introduction || "Scenario details unavailable."}
            </p>
          </div>
          <div className="review-next-step">
            <div className="qa-sidebar-label">Fixed Main Question</div>
            <p className="panel-copy mb-0">
              {studyView?.scenario.mainQuestion || "Main question unavailable."}
            </p>
          </div>
          <div className="review-next-step">
            <div className="qa-sidebar-label">Turn Budget</div>
            <p className="panel-copy mb-0">{actionState.helperText}</p>
          </div>
        </div>
      </section>

      <section className="review-results-section">
        <div className="review-results-header">
          <div>
            <h2 className="qa-page-title" style={{ fontSize: "1.4rem" }}>
              Conversation
            </h2>
            <p className="qa-page-sub">
              Ask the fixed first question, then use any remaining follow-up turns.
            </p>
          </div>
          <Badge bg={studyView?.status === "completed" ? "success" : "secondary"}>
            {studyView?.status === "completed" ? "Completed" : "Active"}
          </Badge>
        </div>

        <div className="review-chat-log">
          {visibleMessages.length > 0 ? (
            visibleMessages.map((message, index) => {
              const messageKey = `${message.createdAt}-${index}`;
              return (
                <article
                  key={messageKey}
                  className={`review-chat-message review-chat-message-${message.role}`}
                >
                  <div className="review-chat-role">{message.role}</div>
                  {message.role === "assistant" &&
                  message.summary &&
                  message.bullets?.length ? (
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
                  ) : (
                    <>
                      <div className="review-chat-body">{message.content}</div>
                      {shouldShowLegacyCitationList(message) ? (
                        <div className="review-chat-inline-citations review-chat-inline-citations-block">
                          {message.citations.map((citation, citationIndex) =>
                            citation.sourceUrl ? (
                              <a
                                key={`${messageKey}-${citationIndex}`}
                                href={citation.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="review-chat-inline-citation"
                              >
                                {citation.sourceName}
                              </a>
                            ) : (
                              <span
                                key={`${messageKey}-${citationIndex}`}
                                className="review-chat-inline-citation is-static"
                              >
                                {citation.sourceName}
                              </span>
                            ),
                          )}
                        </div>
                      ) : null}
                    </>
                  )}
                </article>
              );
            })
          ) : (
            <div className="review-history-inline">
              {sending ? (
                <>
                  <Spinner size="sm" />
                  <span>Sending the fixed study question...</span>
                </>
              ) : (
                <span>No answers yet. Start with the fixed study question.</span>
              )}
            </div>
          )}
        </div>

        {actionState.canSendMainQuestion ? (
          <div className="review-recs-panel">
            <button
              type="button"
              className="btn btn-dark"
              disabled={sending || !studyView}
              onClick={() => void handleStartMainQuestion()}
            >
              {sending ? "Sending..." : "Send fixed study question"}
            </button>
          </div>
        ) : null}

        <Form onSubmit={handleSendFollowUp} className="review-upload-stack">
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={3}
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
              placeholder="Ask a follow-up question about this scenario."
              className="review-textarea"
              disabled={!actionState.canSendFollowUp || sending}
            />
          </Form.Group>

          <div className="review-form-footer">
            <div className="review-note">
              <span>{actionState.helperText}</span>
            </div>
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-outline-dark"
                disabled={!actionState.canSendFollowUp || sending || !messageDraft.trim()}
              >
                {sending ? "Sending..." : "Send follow-up"}
              </button>
              <button
                type="button"
                className="btn btn-dark"
                disabled={!actionState.canComplete || completing}
                onClick={() => void handleComplete()}
              >
                {completing ? "Finishing..." : "Continue to survey"}
              </button>
            </div>
          </div>
        </Form>
      </section>

      <footer className="review-recs-panel text-secondary">
        {shellState.footerCue}
      </footer>
    </div>
  );
}
