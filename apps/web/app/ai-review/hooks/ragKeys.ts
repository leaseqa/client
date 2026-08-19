export const ragKeys = {
  all: ["rag"] as const,
  sessions: ["rag", "sessions"] as const,
  session: (id: string) => ["rag", "session", id] as const,
};

export const RAG_SESSION_POLL_MS = 2000;
