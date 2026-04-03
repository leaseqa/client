import { Citation, ChatMessage, RagSession } from "./types";

export const CHAT_UPLOAD_MAX_MB = 20;
export const CHAT_UPLOAD_ACCEPT = "application/pdf,.docx";
export const AUTO_ANALYZE_QUESTION =
  "Explain this clause in plain language, say whether it appears legal under the tenant-rights handbook, and flag any tenant risks or missing details.";
export const FILE_AUTO_ANALYZE_QUESTION =
  "Summarize this housing-related document in plain language, identify the main legal issues or disputes it raises, and highlight the most important tenant risks, deadlines, or facts that deserve closer review.";

export const FILE_SUGGESTED_PROMPTS = [
  "What are the biggest tenant risks in this lease?",
  "Which clauses should I read most carefully?",
  "Does anything here conflict with Massachusetts tenant-rights rules?",
];

export const TEXT_RETRY_PROMPT_LABEL = "Analyze this clause";

export type PendingDraftSource = {
  sourceName: string;
  sourcePreview: string;
};

export type ResultsPanelState = {
  title: string;
  subtitle: string;
  conversationLabel: string;
};

export type InlineCitationItem = {
  label: string;
  sourceUrl: string | null;
};

type SessionInputOptions = {
  hasFile: boolean;
  sourceText: string;
};

export function getSessionInputPlan({
  hasFile,
  sourceText,
}: SessionInputOptions) {
  const trimmedSourceText = sourceText.trim();

  if (hasFile && trimmedSourceText) {
    return {
      error: "Choose either a file upload or pasted text, not both.",
      initialQuestion: null,
    };
  }

  if (!hasFile && !trimmedSourceText) {
    return {
      error: "Upload a PDF or DOCX file, or paste text first.",
      initialQuestion: null,
    };
  }

  return {
    error: null,
    initialQuestion: hasFile
      ? FILE_AUTO_ANALYZE_QUESTION
      : AUTO_ANALYZE_QUESTION,
  };
}

export function getVisibleMessages(session: RagSession | null): ChatMessage[] {
  if (!session) {
    return [];
  }

  return session.messages.filter((message, index) => {
    return !(
      ["text", "upload"].includes(session.sourceKind) &&
      index === 0 &&
      message.role === "user" &&
      [AUTO_ANALYZE_QUESTION, FILE_AUTO_ANALYZE_QUESTION].includes(
        message.content,
      )
    );
  });
}

export function shouldShowLegacyCitationList(message: ChatMessage) {
  return (
    message.role === "assistant" &&
    message.citations.length > 0 &&
    (!message.summary || !message.bullets?.length)
  );
}

export function getDisplayedSource({
  activeSession,
  pendingDraftSource,
}: {
  activeSession: RagSession | null;
  pendingDraftSource: PendingDraftSource | null;
}) {
  if (pendingDraftSource) {
    return {
      sourceName: pendingDraftSource.sourceName,
      sourcePreview: pendingDraftSource.sourcePreview,
      status: "indexing" as const,
    };
  }

  if (!activeSession) {
    return null;
  }

  return {
    sourceName: activeSession.sourceName,
    sourcePreview: activeSession.sourceTextPreview,
    status: activeSession.status,
  };
}

const toTitleWords = (text: string) =>
  text
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => {
      const normalizedWord = word.toLowerCase() === "deposits" ? "deposit" : word;
      return (
        normalizedWord.charAt(0).toUpperCase() +
        normalizedWord.slice(1).toLowerCase()
      );
    });

export function formatCompactCitationLabel(citation: Citation) {
  if (citation.sourceName === "pasted-text" || citation.sourceGroup === "text") {
    return "Uploaded Clause";
  }

  const baseName = citation.sourceName.replace(/\.[a-z0-9]+$/i, "");
  const normalized = baseName.replace(/^handout_/, "").replace(/^ch\d+_/, "");
  const words = toTitleWords(normalized).slice(0, 3).join(" ");

  if (citation.sourceGroup === "handouts" && citation.chapterRef) {
    return `Handout ${citation.chapterRef} ${words || "Handbook"}`.trim();
  }

  if (citation.chapterRef) {
    return `Chap. ${citation.chapterRef} ${words || "Handbook"}`.trim();
  }

  return words || citation.sourceName;
}

export function getInlineCitationItems({
  citations,
  citationIndices,
}: {
  citations: Citation[];
  citationIndices: number[];
}): InlineCitationItem[] {
  const seen = new Set<string>();

  return citationIndices
    .map((citationIndex) => citations[citationIndex])
    .filter((citation): citation is Citation => Boolean(citation))
    .map((citation) => ({
      label: formatCompactCitationLabel(citation),
      sourceUrl: citation.sourceUrl,
    }))
    .filter((item) => {
      const key = `${item.label}::${item.sourceUrl || ""}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

export function getResultsPanelState({
  activeSession,
  pendingDraftSource,
}: {
  activeSession: RagSession | null;
  pendingDraftSource: PendingDraftSource | null;
}): ResultsPanelState {
  if (pendingDraftSource) {
    return {
      title: "Analyzing new clause",
      subtitle: `Source: ${pendingDraftSource.sourceName}`,
      conversationLabel: "First answer",
    };
  }

  if (activeSession) {
    return {
      title: "Ask follow-up questions",
      subtitle: `Source: ${activeSession.sourceName}`,
      conversationLabel: "Conversation",
    };
  }

  return {
    title: "Chat",
    subtitle: "Create a source above, then ask questions here.",
    conversationLabel: "Conversation",
  };
}

export function getEmptyStateMessage({
  activeSession,
}: {
  activeSession: RagSession | null;
}) {
  if (!activeSession) {
    return "Create a source above, then ask questions here.";
  }

  if (activeSession.sourceKind === "text" && activeSession.status === "ready") {
    return "The first answer failed. Retry the clause analysis or ask your own question.";
  }

  if (activeSession.sourceKind === "upload") {
    return "Pick a suggested question or ask your first question about this file.";
  }

  return "Ask your first question about this source.";
}

export function getRevealChunkSize(totalLength: number) {
  if (totalLength <= 120) {
    return 4;
  }
  if (totalLength <= 360) {
    return 8;
  }
  return 14;
}

export function getNextRevealLength(currentLength: number, fullText: string) {
  return Math.min(
    fullText.length,
    currentLength + getRevealChunkSize(fullText.length),
  );
}
