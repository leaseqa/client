import { describe, expect, test } from "vitest";

import {
  AUTO_ANALYZE_QUESTION,
  FILE_SUGGESTED_PROMPTS,
  formatCompactCitationLabel,
  getEmptyStateMessage,
  getDisplayedSource,
  getInlineCitationItems,
  getNextRevealLength,
  getResultsPanelState,
  SALIENT_BOUNDARY_LABEL,
  shouldShowLegacyCitationList,
  getSessionInputPlan,
  getVisibleMessages,
} from "./view-model";

describe("getSessionInputPlan", () => {
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

  test("does not auto-ask when the source is a file upload", () => {
    expect(
      getSessionInputPlan({
        hasFile: true,
        sourceText: "",
      }),
    ).toEqual({
      error: null,
      initialQuestion: null,
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
        },
      }),
    ).toEqual({
      title: "Analyzing new clause",
      subtitle: "Source: pasted-text",
      conversationLabel: "First answer",
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

  test("gives pasted text a short uploaded-clause label", () => {
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
    ).toBe("Uploaded Clause");
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

describe("getNextRevealLength", () => {
  test("moves a pending assistant reply forward in chunks", () => {
    const reply = "This clause appears broadly consistent with the handbook.";

    expect(getNextRevealLength(0, reply)).toBeGreaterThan(0);
    expect(getNextRevealLength(reply.length - 2, reply)).toBe(reply.length);
  });
});

describe("SALIENT_BOUNDARY_LABEL", () => {
  test("states the legal-information boundary in prominent banner copy", () => {
    expect(SALIENT_BOUNDARY_LABEL).toBe(
      "LeaseQA provides legal information, not legal advice. For advice about your specific situation, consult a licensed attorney or legal aid office.",
    );
  });
});
