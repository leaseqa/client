import type { ServerEvent } from "@/app/lib/api/eventStream";
import { AnswerDraft, AnswerStage, ChatMessage, Citation, RagSession } from "./types";

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
/** The server's name for a clause pasted rather than uploaded. */
export const PASTED_TEXT_SOURCE = "pasted-text";

export type PendingDraftSource = {
  sourceName: string;
  sourcePreview: string;
  sourceKind: RagSession["sourceKind"];
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

  if ( hasFile && trimmedSourceText ) {
    return {
      error: "Choose either a file upload or pasted text, not both.",
      initialQuestion: null,
    };
  }

  if ( !hasFile && !trimmedSourceText ) {
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
  if ( !session ) {
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
                                     pendingStage = null,
                                   }: {
  activeSession: RagSession | null;
  pendingDraftSource: PendingDraftSource | null;
  /** How far the first answer has got: past indexing, the source is ready. */
  pendingStage?: AnswerStage | null;
}) {
  if ( pendingDraftSource ) {
    return {
      sourceName: pendingDraftSource.sourceName,
      sourcePreview: pendingDraftSource.sourcePreview,
      status:
        pendingStage && pendingStage !== "indexing"
          ? ("ready" as const)
          : ("indexing" as const),
    };
  }

  if ( !activeSession ) {
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
  if ( citation.sourceName === PASTED_TEXT_SOURCE || citation.sourceGroup === "text" ) {
    return formatSourceName(PASTED_TEXT_SOURCE);
  }

  const baseName = citation.sourceName.replace(/\.[a-z0-9]+$/i, "");
  const normalized = baseName.replace(/^handout_/, "").replace(/^ch\d+_/, "");
  const words = toTitleWords(normalized).slice(0, 3).join(" ");

  if ( citation.sourceGroup === "handouts" && citation.chapterRef ) {
    return `Handout ${citation.chapterRef} ${words || "Handbook"}`.trim();
  }

  if ( citation.chapterRef ) {
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
      if ( seen.has(key) ) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

/** What a renter calls the source: the file they uploaded or the clause they pasted. */
export function sourceNoun(sourceKind: RagSession["sourceKind"]) {
  return sourceKind === "upload" ? "file" : "clause";
}

/**
 * A pasted clause is stored under the internal name `pasted-text`; renters
 * should see what it is, not what the server calls it.
 */
export function formatSourceName(sourceName: string) {
  return sourceName === PASTED_TEXT_SOURCE ? "Pasted clause" : sourceName;
}

export function formatRoleLabel(role: ChatMessage["role"]) {
  return role === "user" ? "You" : "Answer";
}

export function getResultsPanelState({
                                       activeSession,
                                       pendingDraftSource,
                                     }: {
  activeSession: RagSession | null;
  pendingDraftSource: PendingDraftSource | null;
}): ResultsPanelState {
  if ( pendingDraftSource ) {
    return {
      title: `Analyzing new ${sourceNoun(pendingDraftSource.sourceKind)}`,
      subtitle: `Source: ${formatSourceName(pendingDraftSource.sourceName)}`,
      conversationLabel: "First answer",
    };
  }

  if ( activeSession ) {
    // The heading names the source; the composer below already invites questions.
    return {
      title: formatSourceName(activeSession.sourceName),
      subtitle: "",
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
  if ( !activeSession ) {
    return "Create a source above, then ask questions here.";
  }

  if ( activeSession.sourceKind === "text" && activeSession.status === "ready" ) {
    return "The first answer failed. Retry the clause analysis or ask your own question.";
  }

  if ( activeSession.sourceKind === "upload" ) {
    return "Pick a suggested question or ask your first question about this file.";
  }

  return "Ask your first question about this source.";
}

/**
 * The toast when a new review comes back without its first answer. It only
 * says what happened: the empty review under it already says how to go on.
 */
export const FIRST_ANSWER_FAILED = "The first answer failed.";

export const ABSTENTION_SUMMARY =
  "I could not find enough support to answer that reliably from this source and the handbook.";

export function isAbstentionMessage(message: ChatMessage) {
  if ( message.role !== "assistant" ) {
    return false;
  }
  if ( message.summary === ABSTENTION_SUMMARY ) {
    return true;
  }
  return Boolean(message.summary) && message.citations.length === 0;
}

export function hasMissingCitations(message: ChatMessage) {
  if ( message.role !== "assistant" ) {
    return false;
  }
  if ( message.bullets?.length ) {
    return message.bullets.some((bullet) => bullet.citationIndices.length === 0);
  }
  return message.citations.length === 0;
}

const ANSWER_STAGES: readonly AnswerStage[] = ["indexing", "retrieving", "generating"];
// The prompt asks for at most four bullets; anything far past that is noise.
const MAX_DRAFT_BULLETS = 8;

export function createAnswerDraft(stage: AnswerStage): AnswerDraft {
  return { stage, summary: "", bullets: [] };
}

/**
 * Fold one server event into the draft. Events the draft has no use for, or
 * that are malformed, return the same draft object untouched.
 */
export function applyAnswerEvent(draft: AnswerDraft, { event, data }: ServerEvent): AnswerDraft {
  if ( !data || typeof data !== "object" ) {
    return draft;
  }
  const payload = data as Record<string, unknown>;

  if ( event === "status" ) {
    const stage = ANSWER_STAGES.find((candidate) => candidate === payload.stage);
    return stage ? { ...draft, stage } : draft;
  }
  if ( event !== "delta" || typeof payload.text !== "string" ) {
    return draft;
  }
  if ( payload.part === "summary" ) {
    return { ...draft, summary: draft.summary + payload.text };
  }
  const index = payload.index;
  if (
    payload.part === "bullet" &&
    typeof index === "number" &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < MAX_DRAFT_BULLETS
  ) {
    const bullets = Array.from(
      { length: Math.max(draft.bullets.length, index + 1) },
      (_, position) => draft.bullets[position] || "",
    );
    bullets[index] += payload.text;
    return { ...draft, bullets };
  }
  return draft;
}

/** Say what the system is doing, not what a person would be thinking. */
export function formatAnswerStage(stage: AnswerStage, sourceKind: RagSession["sourceKind"]) {
  if ( stage === "indexing" ) {
    return `Reading the ${sourceNoun(sourceKind)}`;
  }
  if ( stage === "retrieving" ) {
    return "Searching the handbook";
  }
  return "Writing the answer";
}

export type PendingAnswerView = {
  stageLabel: string;
  summary: string;
  bullets: string[];
  /** Where the caret sits: after the stage label, the summary, or a bullet. */
  caret: "label" | "summary" | number;
};

export function getPendingAnswerView(
  draft: AnswerDraft,
  sourceKind: RagSession["sourceKind"],
): PendingAnswerView {
  const bullets = draft.bullets.filter(Boolean);
  return {
    stageLabel: formatAnswerStage(draft.stage, sourceKind),
    summary: draft.summary,
    bullets,
    caret: bullets.length > 0 ? bullets.length - 1 : draft.summary ? "summary" : "label",
  };
}

export function formatStartButtonLabel({
  creating,
  pendingSourceKind,
}: {
  creating: boolean;
  pendingSourceKind: RagSession["sourceKind"] | null;
}) {
  return creating && pendingSourceKind
    ? `Analyzing ${sourceNoun(pendingSourceKind)}`
    : "Start review";
}

export function isRetryableApiError(error: unknown) {
  if ( !error || typeof error !== "object" ) {
    return false;
  }
  const status = "status" in error ? error.status : undefined;
  const code = "code" in error ? error.code : undefined;
  if ( status === 503 ) {
    return true;
  }
  if ( code === "TIMEOUT" || code === "NETWORK" || code === "ABORTED" ) {
    return true;
  }
  return typeof code === "string" && code.endsWith("_RETRYABLE");
}

export function formatStatusLabel(status: RagSession["status"]) {
  if ( status === "ready" ) {
    return "Ready";
  }
  if ( status === "failed" ) {
    return "Failed";
  }
  return "Indexing";
}
