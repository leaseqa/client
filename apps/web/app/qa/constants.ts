export type ComposeState = {
    summary: string;
    details: string;
    folders: string[];
    postType: "question" | "note" | "announcement";
    audience: "everyone" | "admin";
    urgency: "low" | "medium" | "high";
    isAnonymous: boolean;
    files: File[];
};

export const INITIAL_COMPOSE_STATE: ComposeState = {
    summary: "",
    details: "",
    folders: [],
    postType: "question",
    audience: "everyone",
    urgency: "low",
    isAnonymous: false,
    files: [],
};
