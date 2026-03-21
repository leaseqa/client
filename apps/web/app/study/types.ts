import type { Citation, RagSession } from "../ai-review/types";

export type StudyBoundaryCue = "low" | "high";
export type StudyFraming =
  | "professional_personalized"
  | "informational_detached";
export type StudyStatus = "active" | "completed";

export type StudyScenario = {
  scenarioId: string;
  title: string;
  introduction: string;
  taskInstructions: string;
  mainQuestion: string;
};

export type StudySessionView = {
  studySessionId: string;
  participantId?: string;
  scenarioId: string;
  conditionId?: string;
  boundaryCue: StudyBoundaryCue;
  framing: StudyFraming;
  ragSessionId?: string | null;
  turnCount: number;
  status: StudyStatus;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  ragSession: RagSession | null;
  scenario: StudyScenario;
  maxFollowUps: number;
  remainingFollowUps: number;
};

export type StudyMessageResponse = {
  studySession: StudySessionView;
  answer: string;
  citations: Citation[];
};

export type StudySessionPayload =
  | StudySessionView
  | {
      studySession: StudySessionView;
    };

