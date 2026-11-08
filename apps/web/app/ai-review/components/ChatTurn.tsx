import { ReactNode } from "react";

import { ChatMessage } from "../types";
import { formatRoleLabel } from "../view-model";

type ChatTurnProps = {
  role: ChatMessage["role"];
  /** True while the turn is still arriving. */
  busy?: boolean;
  children: ReactNode;
};

/** One turn in the review log: who is speaking, then what they said. */
export default function ChatTurn({ role, busy = false, children }: ChatTurnProps) {
  return (
    <article
      className={`review-chat-message review-chat-message-${role}`}
      aria-busy={busy || undefined}
    >
      <div className="review-chat-role">{formatRoleLabel(role)}</div>
      {children}
    </article>
  );
}
