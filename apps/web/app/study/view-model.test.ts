import { describe, expect, test } from "vitest";

import {
  getStudyActionState,
  getStudyShellState,
  normalizeStudySessionView,
} from "./view-model";

describe("getStudyShellState", () => {
  test("shows only the footer cue for the low salience condition", () => {
    expect(
      getStudyShellState({
        scenarioTitle: "Security deposit return",
        boundaryCue: "low",
      }),
    ).toEqual({
      banner: null,
      footerCue:
        "LeaseQA provides legal information for renters. It is not a law firm and it is not legal advice.",
      scenarioLabel: "Security deposit return",
      studyTitle: "LeaseQA study session",
    });
  });

  test("shows a banner and footer cue for the high salience condition", () => {
    expect(
      getStudyShellState({
        scenarioTitle: "Security deposit return",
        boundaryCue: "high",
      }),
    ).toEqual({
      banner:
        "LeaseQA provides legal information, not legal advice. For advice about your specific situation, consult a licensed attorney or legal aid office.",
      footerCue:
        "LeaseQA provides legal information for renters. It is not a law firm and it is not legal advice.",
      scenarioLabel: "Security deposit return",
      studyTitle: "LeaseQA study session",
    });
  });
});

describe("normalizeStudySessionView", () => {
  test("unwraps nested study message payloads", () => {
    expect(
      normalizeStudySessionView({
        studySession: {
          studySessionId: "study-1",
          scenarioId: "security-deposit",
          boundaryCue: "high",
          framing: "professional_personalized",
          turnCount: 1,
          status: "active",
          scenario: {
            scenarioId: "security-deposit",
            title: "Security deposit return",
            introduction: "Intro",
            taskInstructions: "Instructions",
            mainQuestion: "Main question",
          },
          ragSession: {
            _id: "rag-1",
            status: "ready",
            error: null,
            sourceKind: "text",
            sourceName: "study-security-deposit.txt",
            sourceMimeType: "text/plain",
            sourceTextPreview: "Preview",
            sourceCharCount: 20,
            createdAt: "2026-03-21T00:00:00.000Z",
            updatedAt: "2026-03-21T00:00:00.000Z",
            messages: [],
          },
          remainingFollowUps: 2,
          maxFollowUps: 2,
        },
      }).studySessionId,
    ).toBe("study-1");
  });
});

describe("getStudyActionState", () => {
  test("treats turn zero as a fixed main-question state", () => {
    expect(
      getStudyActionState({
        turnCount: 0,
        remainingFollowUps: 2,
        status: "active",
      }),
    ).toEqual({
      canSendMainQuestion: true,
      canSendFollowUp: false,
      canComplete: false,
      helperText: "Start with the fixed study question.",
    });
  });

  test("enables follow-ups and completion after the first answer", () => {
    expect(
      getStudyActionState({
        turnCount: 1,
        remainingFollowUps: 2,
        status: "active",
      }),
    ).toEqual({
      canSendMainQuestion: false,
      canSendFollowUp: true,
      canComplete: true,
      helperText: "You may ask up to 2 follow-up questions.",
    });
  });
});
