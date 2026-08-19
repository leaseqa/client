import { apiDelete, apiGet, apiPost, unwrapData } from "@/app/lib/api/client";
import { CreateSessionResponse, RagSession, SendMessageResponse } from "./types";

export async function fetchSessions(): Promise<RagSession[]> {
  const response = await apiGet<{ data?: RagSession[] }>("/rag/sessions");
  return unwrapData(response) || [];
}

export async function fetchSessionById(
  sessionId: string,
  signal?: AbortSignal,
): Promise<RagSession> {
  const response = await apiGet<{ data?: RagSession }>(`/rag/sessions/${sessionId}`, {
    signal,
  });
  return unwrapData(response);
}

export async function createSession(
  formData: FormData,
): Promise<CreateSessionResponse> {
  const response = await apiPost<{ data?: CreateSessionResponse }>(
    "/rag/sessions",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return unwrapData(response);
}

export async function sendMessage(
  sessionId: string,
  message: string,
): Promise<SendMessageResponse> {
  const response = await apiPost<{ data?: SendMessageResponse }>(
    `/rag/sessions/${sessionId}/messages`,
    { message },
  );
  return unwrapData(response);
}

export async function deleteSession(sessionId: string): Promise<unknown> {
  const response = await apiDelete(`/rag/sessions/${sessionId}`);
  return unwrapData(response);
}
