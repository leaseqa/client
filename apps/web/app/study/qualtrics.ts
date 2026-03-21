export function buildQualtricsReturnUrl({
  baseUrl,
  participantId,
  studySessionId,
  conditionId,
}: {
  baseUrl: string;
  participantId: string;
  studySessionId: string;
  conditionId?: string;
}) {
  const trimmedBaseUrl = baseUrl.trim();
  if (!trimmedBaseUrl) {
    return null;
  }

  const url = new URL(trimmedBaseUrl);
  url.searchParams.set("participantId", participantId);
  url.searchParams.set("studySessionId", studySessionId);
  if (conditionId) {
    url.searchParams.set("conditionId", conditionId);
  }
  url.searchParams.set("completed", "1");
  return url.toString();
}

