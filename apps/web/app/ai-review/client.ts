import axios from "axios";
import {CreateSessionResponse, RagSession, SendMessageResponse,} from "./types";

const axiosWithCredentials = axios.create({withCredentials: true});
const HOST = (process.env.NEXT_PUBLIC_HTTP_SERVER || "").replace(/\/$/, "");
export const API_BASE = HOST ? `${HOST}/api` : "/api";

export async function fetchSessions(): Promise<RagSession[]> {
  const response = await axiosWithCredentials.get(`${API_BASE}/rag/sessions`);
  return response.data.data || [];
}

export async function fetchSessionById(sessionId: string): Promise<RagSession> {
  const response = await axiosWithCredentials.get(
    `${API_BASE}/rag/sessions/${sessionId}`,
  );
  return response.data.data;
}

export async function createSession(
  formData: FormData,
): Promise<CreateSessionResponse> {
  const response = await axiosWithCredentials.post(
    `${API_BASE}/rag/sessions`,
    formData,
    {
      headers: {"Content-Type": "multipart/form-data"},
    },
  );
  return response.data.data;
}

export async function sendMessage(
  sessionId: string,
  message: string,
): Promise<SendMessageResponse> {
  const response = await axiosWithCredentials.post(
    `${API_BASE}/rag/sessions/${sessionId}/messages`,
    {message},
  );
  return response.data.data;
}
