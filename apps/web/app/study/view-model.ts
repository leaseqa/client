import { StudyBoundaryCue, StudySessionPayload, StudySessionView, StudyStatus } from "./types";

export type StudyShellState = {
  banner: string | null;
  footerCue: string;
  scenarioLabel: string;
  studyTitle: string;
};

export type StudyActionState = {
  canSendMainQuestion: boolean;
  canSendFollowUp: boolean;
  canComplete: boolean;
  helperText: string;
};

const FOOTER_CUE =
  "LeaseQA provides legal information for renters. It is not a law firm and it is not legal advice.";

const HIGH_SALIENCE_BANNER =
  "LeaseQA provides legal information, not legal advice. For advice about your specific situation, consult a licensed attorney or legal aid office.";

const getFollowUpLabel = (remainingFollowUps: number) =>
  remainingFollowUps === 1
    ? "You may ask up to 1 follow-up question."
    : `You may ask up to ${remainingFollowUps} follow-up questions.`;

export function getStudyShellState({
  scenarioTitle,
  boundaryCue,
}: {
  scenarioTitle: string;
  boundaryCue: StudyBoundaryCue;
}): StudyShellState {
  return {
    banner: boundaryCue === "high" ? HIGH_SALIENCE_BANNER : null,
    footerCue: FOOTER_CUE,
    scenarioLabel: scenarioTitle,
    studyTitle: "LeaseQA study session",
  };
}

export function normalizeStudySessionView(
  payload: StudySessionPayload,
): StudySessionView {
  if (
    payload &&
    typeof payload === "object" &&
    "studySession" in payload &&
    payload.studySession
  ) {
    return payload.studySession;
  }

  return payload as StudySessionView;
}

export function getStudyActionState({
  turnCount,
  remainingFollowUps,
  status,
}: {
  turnCount: number;
  remainingFollowUps: number;
  status: StudyStatus;
}): StudyActionState {
  if (status === "completed") {
    return {
      canSendMainQuestion: false,
      canSendFollowUp: false,
      canComplete: false,
      helperText: "This study session is complete.",
    };
  }

  if (turnCount === 0) {
    return {
      canSendMainQuestion: true,
      canSendFollowUp: false,
      canComplete: false,
      helperText: "Start with the fixed study question.",
    };
  }

  if (remainingFollowUps > 0) {
    return {
      canSendMainQuestion: false,
      canSendFollowUp: true,
      canComplete: true,
      helperText: getFollowUpLabel(remainingFollowUps),
    };
  }

  return {
    canSendMainQuestion: false,
    canSendFollowUp: false,
    canComplete: true,
    helperText: "You have reached the follow-up limit. Continue to the survey.",
  };
}

