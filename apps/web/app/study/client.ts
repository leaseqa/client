import axios from "axios";

import {
  StudyMessageResponse,
  StudySessionPayload,
  StudySessionView,
} from "./types";
import { normalizeStudySessionView } from "./view-model";

const axiosWithCredentials = axios.create({ withCredentials: true });
const HOST = (process.env.NEXT_PUBLIC_HTTP_SERVER || "").replace(/\/$/, "");
export const API_BASE = HOST ? `${HOST}/api` : "/api";

function unwrapResponseData<T>(response: { data?: { data?: T } | T }): T {
  const payload = response.data as { data?: T } | T;
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: T }).data ?? (payload as T);
  }

  return payload as T;
}

export async function createStudySession(
  participantId: string,
  scenarioId: string,
): Promise<StudySessionView> {
  const response = await axiosWithCredentials.post(`${API_BASE}/study/sessions`, {
    participantId,
    scenarioId,
  });

  return normalizeStudySessionView(unwrapResponseData<StudySessionPayload>(response));
}

export async function fetchStudySession(
  studySessionId: string,
): Promise<StudySessionView> {
  const response = await axiosWithCredentials.get(
    `${API_BASE}/study/sessions/${studySessionId}`,
  );

  return normalizeStudySessionView(unwrapResponseData<StudySessionPayload>(response));
}

export async function sendStudyMessage(
  studySessionId: string,
  message: string,
): Promise<StudyMessageResponse> {
  const response = await axiosWithCredentials.post(
    `${API_BASE}/study/sessions/${studySessionId}/messages`,
    { message },
  );
  const payload = unwrapResponseData<StudyMessageResponse>(response);

  return {
    ...payload,
    studySession: normalizeStudySessionView(payload.studySession),
  };
}

export async function completeStudySession(
  studySessionId: string,
): Promise<Partial<StudySessionView>> {
  const response = await axiosWithCredentials.post(
    `${API_BASE}/study/sessions/${studySessionId}/complete`,
  );

  return unwrapResponseData<Partial<StudySessionView>>(response);
}

