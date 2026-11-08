import { apiDelete, apiGet, unwrapData } from "@/app/lib/api/client";
import { postEventStream, ServerEventListener } from "@/app/lib/api/eventStream";
import { CreateSessionResponse, RagSession, SendMessageResponse } from "./types";

// Creating a session embeds and indexes the uploaded or pasted source, and
// answering runs retrieval plus generation. Both stream their progress, but
// creation alone measured 18-21s against production before the first answer
// even starts, so each keeps a ceiling for the whole exchange: high enough to
// let the work finish, low enough that a genuinely stuck stream still gives up.
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

export function createSession(
  formData: FormData,
  onEvent?: ServerEventListener,
): Promise<CreateSessionResponse> {
  return postEventStream<CreateSessionResponse>("/rag/sessions", formData, {
    onEvent,
    timeout: RAG_TIMEOUT_MS,
  });
}

export function sendMessage(
  sessionId: string,
  message: string,
  onEvent?: ServerEventListener,
): Promise<SendMessageResponse> {
  return postEventStream<SendMessageResponse>(
    `/rag/sessions/${sessionId}/messages`,
    { message },
    { onEvent, timeout: RAG_TIMEOUT_MS },
  );
}

export async function deleteSession(sessionId: string): Promise<unknown> {
  const response = await apiDelete(`/rag/sessions/${sessionId}`);
  return unwrapData(response);
}
