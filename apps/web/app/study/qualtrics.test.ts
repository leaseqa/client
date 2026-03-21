import { describe, expect, test } from "vitest";

import { buildQualtricsReturnUrl } from "./qualtrics";

describe("buildQualtricsReturnUrl", () => {
  test("returns null when no base URL is configured", () => {
    expect(
      buildQualtricsReturnUrl({
        baseUrl: "",
        participantId: "R_123",
        studySessionId: "study-1",
        conditionId: "condition-high-professional_personalized",
      }),
    ).toBeNull();
  });

  test("adds study metadata as query params", () => {
    expect(
      buildQualtricsReturnUrl({
        baseUrl: "https://qualtrics.example.com/jfe/form/SV_test",
        participantId: "R_123",
        studySessionId: "study-1",
        conditionId: "condition-high-professional_personalized",
      }),
    ).toBe(
      "https://qualtrics.example.com/jfe/form/SV_test?participantId=R_123&studySessionId=study-1&conditionId=condition-high-professional_personalized&completed=1",
    );
  });
});
