export type Citation = {
  sourceName: string;
  sourceGroup: string;
  sourceType: string;
  chapterRef: string | null;
  filePath: string | null;
  sourceUrl: string | null;
  snippet: string;
};

export type AnswerBullet = {
  text: string;
  citationIndices: number[];
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  summary?: string | null;
  bullets?: AnswerBullet[];
  citations: Citation[];
  createdAt: string;
};

export type RagSession = {
  _id: string;
  status: "indexing" | "ready" | "failed";
  error: string | null;
  sourceKind: "upload" | "text";
  sourceName: string;
  sourceMimeType: string | null;
  sourceTextPreview: string;
  sourceCharCount: number;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

/** Where an answer has got to, as the server's `status` events report it. */
export type AnswerStage = "indexing" | "retrieving" | "generating";

/**
 * The part of an answer that has streamed in so far. It is a draft: the
 * finished answer replaces it and may drop bullets the evidence does not
 * support.
 */
export type AnswerDraft = {
  stage: AnswerStage;
  summary: string;
  bullets: string[];
};

export type CreateSessionResponse = RagSession;

export type SendMessageResponse = {
  session: RagSession;
  answer: string;
  citations: Citation[];
};

export type RiskCardProps = {
  tone: "danger" | "warning" | "success";
  title: string;
  items: string[];
};
