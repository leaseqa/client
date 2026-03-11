type ReviewPayload = {
    summary: string;
    highRisk: string[];
    mediumRisk: string[];
    lowRisk: string[];
    recommendations: string[];
};

type TopicRule = {
    topic: string;
    label: string;
    keywords: string[];
    resourceLabel: string;
};

type TopicMatch = {
    topic: string;
    label: string;
};

type ResourceMatch = {
    href: string;
    label: string;
};

type ReviewFollowUp = {
    sections: TopicMatch[];
    resources: ResourceMatch[];
    draftSummary: string;
    draftDetails: string;
    draftFolders: string[];
    urgency: "low" | "medium" | "high";
};

const TOPIC_RULES: TopicRule[] = [
    {
        topic: "security_deposit",
        label: "Security Deposit",
        keywords: ["deposit", "escrow", "refund", "deduction", "last month's rent"],
        resourceLabel: "Deposit rules and timelines",
    },
    {
        topic: "maintenance",
        label: "Maintenance & Repairs",
        keywords: ["repair", "maintenance", "mold", "heat", "water", "pest", "habitability"],
        resourceLabel: "Repair and habitability basics",
    },
    {
        topic: "eviction",
        label: "Eviction Risk",
        keywords: ["eviction", "quit", "notice", "court", "lockout", "possession"],
        resourceLabel: "Eviction process and help",
    },
    {
        topic: "fees",
        label: "Late Fees / Rent",
        keywords: ["late fee", "fee", "penalty", "rent due", "nonpayment", "payment"],
        resourceLabel: "Fees and rent rules",
    },
    {
        topic: "rent_increase",
        label: "Rent Increase",
        keywords: ["rent increase", "renewal", "renew", "raise", "increase", "adjustment"],
        resourceLabel: "Rent increase questions",
    },
    {
        topic: "roommates",
        label: "Roommates & Sublease",
        keywords: ["roommate", "sublet", "sublease", "occupant", "guest", "assignment"],
        resourceLabel: "Roommate and sublease basics",
    },
    {
        topic: "utilities",
        label: "Utilities",
        keywords: ["utility", "utilities", "heat", "electric", "water", "internet", "gas"],
        resourceLabel: "Utility responsibility",
    },
    {
        topic: "pets",
        label: "Pet Policies",
        keywords: ["pet", "pets", "animal", "dog", "cat", "service animal"],
        resourceLabel: "Pet clauses and exceptions",
    },
    {
        topic: "harassment",
        label: "Landlord Harassment",
        keywords: ["harassment", "retaliation", "privacy", "entry", "threat", "lockout"],
        resourceLabel: "Harassment and privacy",
    },
    {
        topic: "leasebreak",
        label: "Breaking a Lease",
        keywords: ["break lease", "termination", "early end", "move out", "lease break"],
        resourceLabel: "Ending a lease early",
    },
    {
        topic: "lease_basics",
        label: "Lease Basics",
        keywords: ["clause", "term", "lease", "landlord", "tenant", "agreement"],
        resourceLabel: "Lease basics",
    },
];

const MAX_DETAIL_ITEMS = 3;
const MAX_DETAIL_TEXT = 900;

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

function dedupeByTopic<T extends {topic: string}>(items: T[]): T[] {
    const seen = new Set<string>();
    return items.filter((item) => {
        if (seen.has(item.topic)) {
            return false;
        }
        seen.add(item.topic);
        return true;
    });
}

function dedupeStrings(items: string[]): string[] {
    return Array.from(new Set(items.filter(Boolean)));
}

function compactText(payload: ReviewPayload): string {
    return [
        payload.summary,
        ...payload.highRisk,
        ...payload.mediumRisk,
        ...payload.lowRisk,
        ...payload.recommendations,
    ]
        .join(" ")
        .toLowerCase();
}

function getMatchedTopics(payload: ReviewPayload): TopicMatch[] {
    const text = compactText(payload);
    const matches = TOPIC_RULES.filter((rule) =>
        rule.keywords.some((keyword) => text.includes(keyword.toLowerCase())),
    ).map((rule) => ({
        topic: rule.topic,
        label: rule.label,
    }));

    const uniqueMatches = dedupeByTopic(matches).slice(0, 3);
    if (uniqueMatches.length > 0) {
        return uniqueMatches;
    }

    return [{topic: "lease_basics", label: "Lease Basics"}];
}

function getUrgency(payload: ReviewPayload): "low" | "medium" | "high" {
    if (payload.highRisk.length > 0) {
        return "high";
    }
    if (payload.mediumRisk.length > 0) {
        return "medium";
    }
    return "low";
}

function trimText(value: string): string {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length <= MAX_DETAIL_TEXT) {
        return normalized;
    }
    return `${normalized.slice(0, MAX_DETAIL_TEXT - 3).trimEnd()}...`;
}

function makeDraftSummary(topics: TopicMatch[]): string {
    const primaryTopic = topics[0]?.label || "lease review";
    const normalizedTopic = primaryTopic.toLowerCase();
    return `Question about ${normalizedTopic}`.slice(0, 100);
}

function makeBulletList(items: string[]): string {
    const safeItems = items
        .slice(0, MAX_DETAIL_ITEMS)
        .map((item) => `<li>${escapeHtml(trimText(item))}</li>`)
        .join("");

    if (!safeItems) {
        return "";
    }

    return `<ul>${safeItems}</ul>`;
}

function makeDraftDetails(payload: ReviewPayload, topics: TopicMatch[]): string {
    const parts: string[] = [
        "<p>I reviewed my lease and want help checking these points.</p>",
    ];

    if (payload.summary.trim()) {
        parts.push(`<p><strong>Summary:</strong> ${escapeHtml(trimText(payload.summary))}</p>`);
    }

    const issues = [...payload.highRisk, ...payload.mediumRisk, ...payload.lowRisk];
    if (issues.length > 0) {
        parts.push("<p><strong>Points I want to check:</strong></p>");
        parts.push(makeBulletList(issues));
    }

    if (payload.recommendations.length > 0) {
        parts.push("<p><strong>Suggested follow-up:</strong></p>");
        parts.push(makeBulletList(payload.recommendations));
    }

    if (topics.length > 0) {
        parts.push(`<p><strong>Related sections:</strong> ${escapeHtml(topics.map((topic) => topic.label).join(", "))}</p>`);
    }

    parts.push("<p><strong>My question:</strong> Is this clause normal, and what should I ask next?</p>");

    return parts.filter(Boolean).join("");
}

function buildResourceMatches(topics: TopicMatch[]): ResourceMatch[] {
    return topics.map((topic) => {
        const rule = TOPIC_RULES.find((candidate) => candidate.topic === topic.topic);
        return {
            href: `/qa/resources?topic=${topic.topic}`,
            label: rule?.resourceLabel || topic.label,
        };
    });
}

export function getTopicLabel(topic: string): string {
    return TOPIC_RULES.find((rule) => rule.topic === topic)?.label || topic;
}

export function getReviewFollowUp(payload: ReviewPayload): ReviewFollowUp {
    const sections = getMatchedTopics(payload);
    const draftFolders = dedupeStrings(["ai_review", ...sections.map((section) => section.topic)]);

    return {
        sections,
        resources: buildResourceMatches(sections).slice(0, 3),
        draftSummary: makeDraftSummary(sections),
        draftDetails: makeDraftDetails(payload, sections),
        draftFolders,
        urgency: getUrgency(payload),
    };
}

export function buildReviewDraftHref(payload: ReviewPayload): string {
    const followUp = getReviewFollowUp(payload);
    const searchParams = new URLSearchParams({
        compose: "1",
        draftSource: "ai-review",
        draftSummary: followUp.draftSummary,
        draftDetails: followUp.draftDetails,
        draftFolders: followUp.draftFolders.join(","),
        draftUrgency: followUp.urgency,
    });

    return `/qa?${searchParams.toString()}`;
}
