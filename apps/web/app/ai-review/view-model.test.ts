import { describe, expect, test } from "vitest";

import {
  applyAnswerEvent,
  AUTO_ANALYZE_QUESTION,
  createAnswerDraft,
  FILE_AUTO_ANALYZE_QUESTION,
  FILE_SUGGESTED_PROMPTS,
  formatAnswerStage,
  formatCompactCitationLabel,
  formatRoleLabel,
  formatSourceName,
  formatStartButtonLabel,
  getDisplayedSource,
  getEmptyStateMessage,
  FIRST_ANSWER_FAILED,
  getInlineCitationItems,
  getPendingAnswerView,
  getResultsPanelState,
  getSessionInputPlan,
  getVisibleMessages,
  hasMissingCitations,
  isAbstentionMessage,
  isRetryableApiError,
  shouldShowLegacyCitationList,
} from "./view-model";

describe("getSessionInputPlan", () => {
  test("uses a general document-analysis prompt for uploaded files", () => {
    expect(FILE_AUTO_ANALYZE_QUESTION).toBe(
      "Summarize this housing-related document in plain language, identify the main legal issues or disputes it raises, and highlight the most important tenant risks, deadlines, or facts that deserve closer review.",
    );
  });

  test("requests an automatic first answer for pasted text", () => {
    expect(
      getSessionInputPlan({
        hasFile: false,
        sourceText: "  The landlord must return the deposit within 30 days.  ",
      }),
    ).toEqual({
      error: null,
      initialQuestion: AUTO_ANALYZE_QUESTION,
    });
  });

  test("requests an automatic first answer for uploaded files", () => {
    expect(
      getSessionInputPlan({
        hasFile: true,
        sourceText: "",
      }),
    ).toEqual({
      error: null,
      initialQuestion: FILE_AUTO_ANALYZE_QUESTION,
    });
  });

  test("rejects mixing a file upload with pasted text", () => {
    expect(
      getSessionInputPlan({
        hasFile: true,
        sourceText: "Tenant must pay late fee",
      }),
    ).toEqual({
      error: "Choose either a file upload or pasted text, not both.",
      initialQuestion: null,
    });
  });
});

describe("getVisibleMessages", () => {
  test("hides the generated starter question from pasted-text chats", () => {
    expect(
      getVisibleMessages({
        _id: "session-1",
        status: "ready",
        error: null,
        sourceKind: "text",
        sourceName: "pasted-text",
        sourceMimeType: "text/plain",
        sourceTextPreview: "The landlord must return the security deposit",
        sourceCharCount: 64,
        createdAt: "2026-03-11T00:00:00.000Z",
        updatedAt: "2026-03-11T00:00:00.000Z",
        messages: [
          {
            role: "user",
            content: AUTO_ANALYZE_QUESTION,
            citations: [],
            createdAt: "2026-03-11T00:00:00.000Z",
          },
          {
            role: "assistant",
            content: "This clause says the landlord has 30 days to return the deposit.",
            citations: [],
            createdAt: "2026-03-11T00:00:01.000Z",
          },
        ],
      }),
    ).toEqual([
      {
        role: "assistant",
        content: "This clause says the landlord has 30 days to return the deposit.",
        citations: [],
        createdAt: "2026-03-11T00:00:01.000Z",
      },
    ]);
  });

  test("hides the generated starter question from uploaded-file chats", () => {
    expect(
      getVisibleMessages({
        _id: "session-3",
        status: "ready",
        error: null,
        sourceKind: "upload",
        sourceName: "lease.pdf",
        sourceMimeType: "application/pdf",
        sourceTextPreview: "Lease preview",
        sourceCharCount: 128,
        createdAt: "2026-03-11T00:00:00.000Z",
        updatedAt: "2026-03-11T00:00:00.000Z",
        messages: [
          {
            role: "user",
            content: FILE_AUTO_ANALYZE_QUESTION,
            citations: [],
            createdAt: "2026-03-11T00:00:00.000Z",
          },
          {
            role: "assistant",
            content:
              "This packet describes a security-deposit dispute and the key deadlines.",
            citations: [],
            createdAt: "2026-03-11T00:00:01.000Z",
          },
        ],
      }),
    ).toEqual([
      {
        role: "assistant",
        content:
          "This packet describes a security-deposit dispute and the key deadlines.",
        citations: [],
        createdAt: "2026-03-11T00:00:01.000Z",
      },
    ]);
  });

  test("preserves ordinary user messages and file suggestions", () => {
    expect(FILE_SUGGESTED_PROMPTS).toHaveLength(3);

    expect(
      getVisibleMessages({
        _id: "session-2",
        status: "ready",
        error: null,
        sourceKind: "upload",
        sourceName: "lease.pdf",
        sourceMimeType: "application/pdf",
        sourceTextPreview: "Lease preview",
        sourceCharCount: 128,
        createdAt: "2026-03-11T00:00:00.000Z",
        updatedAt: "2026-03-11T00:00:00.000Z",
        messages: [
          {
            role: "user",
            content: "Is this clause legal?",
            citations: [],
            createdAt: "2026-03-11T00:00:00.000Z",
          },
        ],
      }),
    ).toHaveLength(1);
  });
});

describe("getDisplayedSource", () => {
  test("prefers the pending pasted-text draft over the previously active session", () => {
    expect(
      getDisplayedSource({
        pendingDraftSource: {
          sourceName: "pasted-text",
          sourcePreview: "Pending draft clause",
          sourceKind: "text",
        },
        activeSession: {
          _id: "session-2",
          status: "ready",
          error: null,
          sourceKind: "upload",
          sourceName: "existing.pdf",
          sourceMimeType: "application/pdf",
          sourceTextPreview: "Existing PDF preview",
          sourceCharCount: 128,
          createdAt: "2026-03-11T00:00:00.000Z",
          updatedAt: "2026-03-11T00:00:00.000Z",
          messages: [],
        },
      }),
    ).toEqual({
      sourceName: "pasted-text",
      sourcePreview: "Pending draft clause",
      status: "indexing",
    });
  });

  test("reports the pending source as ready once the first answer is past indexing", () => {
    const pendingDraftSource = {
      sourceName: "pasted-text",
      sourcePreview: "Pending draft clause",
      sourceKind: "text" as const,
    };
    const statusAt = (pendingStage: "indexing" | "retrieving" | "generating" | null) =>
      getDisplayedSource({ activeSession: null, pendingDraftSource, pendingStage })?.status;

    expect(statusAt(null)).toBe("indexing");
    expect(statusAt("indexing")).toBe("indexing");
    expect(statusAt("retrieving")).toBe("ready");
    expect(statusAt("generating")).toBe("ready");
  });
});

describe("getResultsPanelState", () => {
  test("shows a dedicated analyzing state for a new pasted clause draft", () => {
    expect(
      getResultsPanelState({
        activeSession: {
          _id: "session-2",
          status: "ready",
          error: null,
          sourceKind: "upload",
          sourceName: "existing.pdf",
          sourceMimeType: "application/pdf",
          sourceTextPreview: "Existing PDF preview",
          sourceCharCount: 128,
          createdAt: "2026-03-11T00:00:00.000Z",
          updatedAt: "2026-03-11T00:00:00.000Z",
          messages: [],
        },
        pendingDraftSource: {
          sourceName: "pasted-text",
          sourcePreview: "Pending draft clause",
          sourceKind: "text",
        },
      }),
    ).toEqual({
      title: "Analyzing new clause",
      subtitle: "Source: Pasted clause",
      conversationLabel: "First answer",
    });
  });

  test("names an uploaded file as a file while it is analyzed", () => {
    expect(
      getResultsPanelState({
        activeSession: null,
        pendingDraftSource: {
          sourceName: "lease-2026.pdf",
          sourcePreview: "",
          sourceKind: "upload",
        },
      }),
    ).toEqual({
      title: "Analyzing new file",
      subtitle: "Source: lease-2026.pdf",
      conversationLabel: "First answer",
    });
  });

  test("names an open review after its source, with no instruction above it", () => {
    expect(
      getResultsPanelState({
        activeSession: {
          _id: "session-3",
          status: "ready",
          error: null,
          sourceKind: "text",
          sourceName: "pasted-text",
          sourceMimeType: null,
          sourceTextPreview: "Tenant shall pay two months' rent as a deposit.",
          sourceCharCount: 46,
          createdAt: "2026-03-11T00:00:00.000Z",
          updatedAt: "2026-03-11T00:00:00.000Z",
          messages: [],
        },
        pendingDraftSource: null,
      }),
    ).toEqual({
      title: "Pasted clause",
      subtitle: "",
      conversationLabel: "Conversation",
    });
  });
});

describe("formatCompactCitationLabel", () => {
  test("shortens handbook chapter citations", () => {
    expect(
      formatCompactCitationLabel({
        sourceName: "ch03_security_deposits.pdf",
        sourceGroup: "chapters",
        sourceType: "knowledge",
        chapterRef: "3",
        filePath: null,
        sourceUrl: "https://example.com/ch03",
        snippet: "Security deposit handbook snippet",
      }),
    ).toBe("Chap. 3 Security Deposit");
  });

  test("labels a pasted clause the way the history does", () => {
    expect(
      formatCompactCitationLabel({
        sourceName: "pasted-text",
        sourceGroup: "text",
        sourceType: "text",
        chapterRef: null,
        filePath: null,
        sourceUrl: null,
        snippet: "Uploaded clause text",
      }),
    ).toBe("Pasted clause");
  });

  test("gives handout citations a short handout label", () => {
    expect(
      formatCompactCitationLabel({
        sourceName: "handout_ch03_security_deposits.pdf",
        sourceGroup: "handouts",
        sourceType: "handout",
        chapterRef: "3",
        filePath: null,
        sourceUrl: "https://example.com/handout3",
        snippet: "Handout snippet",
      }),
    ).toBe("Handout 3 Security Deposit");
  });
});

describe("getInlineCitationItems", () => {
  test("dedupes repeated handbook labels for a bullet", () => {
    expect(
      getInlineCitationItems({
        citations: [
          {
            sourceName: "ch03_security_deposits.pdf",
            sourceGroup: "chapters",
            sourceType: "chapter",
            chapterRef: "3",
            filePath: null,
            sourceUrl: "https://example.com/ch03",
            snippet: "Chapter snippet A",
          },
          {
            sourceName: "ch03_security_deposits.pdf",
            sourceGroup: "chapters",
            sourceType: "chapter",
            chapterRef: "3",
            filePath: null,
            sourceUrl: "https://example.com/ch03",
            snippet: "Chapter snippet B",
          },
          {
            sourceName: "handout_ch03_security_deposits.pdf",
            sourceGroup: "handouts",
            sourceType: "handout",
            chapterRef: "3",
            filePath: null,
            sourceUrl: "https://example.com/handout3",
            snippet: "Handout snippet",
          },
        ],
        citationIndices: [0, 1, 2],
      }),
    ).toEqual([
      {
        label: "Chap. 3 Security Deposit",
        sourceUrl: "https://example.com/ch03",
      },
      {
        label: "Handout 3 Security Deposit",
        sourceUrl: "https://example.com/handout3",
      },
    ]);
  });
});

describe("legacy citation fallback", () => {
  test("keeps citations visible for non-structured assistant messages", () => {
    expect(
      shouldShowLegacyCitationList({
        role: "assistant",
        content: "Plain text answer",
        citations: [
          {
            sourceName: "ch03_security_deposits.pdf",
            sourceGroup: "chapters",
            sourceType: "chapter",
            chapterRef: "3",
            filePath: null,
            sourceUrl: "https://example.com/ch03",
            snippet: "snippet",
          },
        ],
        createdAt: "2026-03-11T00:00:00.000Z",
      }),
    ).toBe(true);
  });
});

describe("getEmptyStateMessage", () => {
  test("shows a retry cue when pasted-clause auto-analysis returned no assistant answer", () => {
    expect(
      getEmptyStateMessage({
        activeSession: {
          _id: "session-3",
          status: "ready",
          error: null,
          sourceKind: "text",
          sourceName: "pasted-text",
          sourceMimeType: "text/plain",
          sourceTextPreview: "Clause preview",
          sourceCharCount: 20,
          createdAt: "2026-03-11T00:00:00.000Z",
          updatedAt: "2026-03-11T00:00:00.000Z",
          messages: [],
        },
      }),
    ).toBe("The first answer failed. Retry the clause analysis or ask your own question.");
  });
});

describe("conversation fixtures", () => {
  const abstentionMessage = {
    role: "assistant" as const,
    content: "I could not find enough support to answer that reliably from this source and the handbook.",
    summary: "I could not find enough support to answer that reliably from this source and the handbook.",
    bullets: [
      {
        text: "Ask a narrower question or quote the specific clause you want reviewed.",
        citationIndices: [],
      },
    ],
    citations: [],
    createdAt: "2026-08-19T00:00:02.000Z",
  };

  test("detects an abstention with no citations", () => {
    expect(isAbstentionMessage(abstentionMessage)).toBe(true);
  });

  test("flags bullets that omit citation support", () => {
    expect(hasMissingCitations(abstentionMessage)).toBe(true);
    expect(
      hasMissingCitations({
        role: "assistant",
        content: "The 30-day deadline matches the handbook.",
        summary: "The 30-day deadline matches the handbook.",
        bullets: [{ text: "The deadline is 30 days.", citationIndices: [0] }],
        citations: [
          {
            sourceName: "ch03_security_deposits.pdf",
            sourceGroup: "chapters",
            sourceType: "chapter",
            chapterRef: "3",
            filePath: null,
            sourceUrl: "https://example.com/ch03",
            snippet: "Security deposit handbook snippet",
          },
        ],
        createdAt: "2026-08-19T00:00:02.000Z",
      }),
    ).toBe(false);
  });

  test("treats 503 and *_RETRYABLE codes as retryable", () => {
    expect(
      isRetryableApiError({
        name: "ApiError",
        status: 503,
        code: "RAG_SESSION_DELETE_RETRYABLE",
        message: "Session deletion did not complete. Retry the request.",
      }),
    ).toBe(true);
    expect(
      isRetryableApiError({
        name: "ApiError",
        status: 403,
        code: "FORBIDDEN",
        message: "Denied",
      }),
    ).toBe(false);
  });
});

describe("formatSourceName", () => {
  test("names a pasted clause for the renter", () => {
    expect(formatSourceName("pasted-text")).toBe("Pasted clause");
  });

  test("keeps an uploaded file's own name", () => {
    expect(formatSourceName("lease-2026.pdf")).toBe("lease-2026.pdf");
  });
});

describe("formatRoleLabel", () => {
  test("labels the renter's turn and the answer", () => {
    expect(formatRoleLabel("user")).toBe("You");
    expect(formatRoleLabel("assistant")).toBe("Answer");
  });
});

describe("answer drafts", () => {
  const status = (stage: string) => ({ event: "status", data: { stage } });
  const summary = (text: string) => ({ event: "delta", data: { part: "summary", text } });
  const bullet = (index: number, text: string) => ({
    event: "delta",
    data: { part: "bullet", index, text },
  });

  test("a draft follows the stages and appends each delta where it belongs", () => {
    const events = [
      status("retrieving"),
      status("generating"),
      summary("The deposit"),
      summary(" is too high."),
      bullet(0, "Two months"),
      bullet(0, " is over the cap."),
      bullet(1, "The fee"),
    ];
    const draft = events.reduce(applyAnswerEvent, createAnswerDraft("indexing"));

    expect(draft).toEqual({
      stage: "generating",
      summary: "The deposit is too high.",
      bullets: ["Two months is over the cap.", "The fee"],
    });
  });

  test("a bullet that arrives ahead of the one before it leaves a gap, not a crash", () => {
    const draft = applyAnswerEvent(createAnswerDraft("generating"), bullet(1, "Second"));
    expect(draft.bullets).toEqual(["", "Second"]);
  });

  test("unknown or malformed events leave the draft as it was", () => {
    const start = createAnswerDraft("retrieving");
    for ( const event of [
      { event: "status", data: { stage: "dreaming" } },
      { event: "delta", data: { part: "summary" } },
      { event: "delta", data: { part: "bullet", index: -1, text: "x" } },
      { event: "delta", data: { part: "bullet", index: 1.5, text: "x" } },
      { event: "delta", data: { part: "bullet", index: 500, text: "x" } },
      { event: "delta", data: null },
      { event: "message", data: { text: "x" } },
    ] ) {
      expect(applyAnswerEvent(start, event)).toBe(start);
    }
  });

  test("stage labels say what the system is doing, naming a file as a file", () => {
    expect(formatAnswerStage("indexing", "text")).toBe("Reading the clause");
    expect(formatAnswerStage("indexing", "upload")).toBe("Reading the file");
    expect(formatAnswerStage("retrieving", "text")).toBe("Searching the handbook");
    expect(formatAnswerStage("generating", "upload")).toBe("Writing the answer");
  });

  test("before any text the caret follows the stage label", () => {
    expect(getPendingAnswerView(createAnswerDraft("retrieving"), "text")).toEqual({
      stageLabel: "Searching the handbook",
      summary: "",
      bullets: [],
      caret: "label",
    });
  });

  test("once text arrives the caret follows whatever is still being written", () => {
    const withSummary = { stage: "generating" as const, summary: "The deposit is", bullets: [] };
    expect(getPendingAnswerView(withSummary, "text").caret).toBe("summary");

    const withBullets = {
      stage: "generating" as const,
      summary: "The deposit is too high.",
      bullets: ["Two months is over the cap.", "", "The fee"],
    };
    expect(getPendingAnswerView(withBullets, "text")).toEqual({
      stageLabel: "Writing the answer",
      summary: "The deposit is too high.",
      bullets: ["Two months is over the cap.", "The fee"],
      caret: 1,
    });
  });
});

describe("formatStartButtonLabel", () => {
  test("names what is being analyzed while a review starts", () => {
    expect(formatStartButtonLabel({ creating: false, pendingSourceKind: null })).toBe("Start review");
    expect(formatStartButtonLabel({ creating: true, pendingSourceKind: "text" })).toBe("Analyzing clause");
    expect(formatStartButtonLabel({ creating: true, pendingSourceKind: "upload" })).toBe("Analyzing file");
  });
});

describe("FIRST_ANSWER_FAILED", () => {
  test("the toast leaves the guidance to the empty review under it", () => {
    expect(FIRST_ANSWER_FAILED).toBe("The first answer failed.");
    for ( const sourceKind of ["text", "upload"] as const ) {
      const emptyState = getEmptyStateMessage({
        activeSession: {
          _id: "s1",
          status: "ready",
          error: null,
          sourceKind,
          sourceName: sourceKind === "text" ? "pasted-text" : "lease.pdf",
          sourceMimeType: null,
          sourceTextPreview: "",
          sourceCharCount: 0,
          messages: [],
          createdAt: "2026-11-08T00:00:00.000Z",
          updatedAt: "2026-11-08T00:00:00.000Z",
        },
      });
      expect(emptyState).toMatch(/question/);
    }
  });
});
