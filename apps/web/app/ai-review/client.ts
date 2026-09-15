import { apiDelete, apiGet, apiPost, unwrapData } from "@/app/lib/api/client";
import { CreateSessionResponse, RagSession, SendMessageResponse } from "./types";

// Creating a session embeds and indexes the uploaded or pasted source, and
// answering runs retrieval plus generation. Creation measured 18-21s against
// production, either side of the shared 20s default, so both calls need their
// own ceiling — high enough to let the work finish, low enough that a genuinely
// stuck request still gives up.
const RAG_TIMEOUT_MS = 90_000;

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
      timeout: RAG_TIMEOUT_MS,
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
    { timeout: RAG_TIMEOUT_MS },
  );
  return unwrapData(response);
}

export async function deleteSession(sessionId: string): Promise<unknown> {
  const response = await apiDelete(`/rag/sessions/${sessionId}`);
  return unwrapData(response);
}
