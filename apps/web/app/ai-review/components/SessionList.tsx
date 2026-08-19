import { Spinner } from "react-bootstrap";
import { Clock3 } from "lucide-react";

import { RagSession } from "../types";

type SessionListProps = {
  sessions: RagSession[];
  activeSessionId: string | null;
  loading: boolean;
  isGuest: boolean;
  error?: string | null;
  onSelect: (session: RagSession) => void;
};

export default function SessionList({
  sessions,
  activeSessionId,
  loading,
  isGuest,
  error,
  onSelect,
}: SessionListProps) {
  return (
    <section className="review-history-section">
      <div className="review-history-header">
        <div className="qa-sidebar-label">
          <Clock3 size={12}/>
          <span>History</span>
        </div>
        {isGuest ? (
          <span className="review-history-hint">Temporary for this guest session</span>
        ) : null}
      </div>

      {loading ? (
        <div className="review-history-inline">
          <Spinner size="sm"/>
          <span>Loading...</span>
        </div>
      ) : error ? (
        <div className="review-history-inline">{error}</div>
      ) : sessions.length > 0 ? (
        <div className="review-history-chips">
          {sessions.map((item) => {
            const isActive = activeSessionId === item._id;
            return (
              <button
                key={item._id}
                type="button"
                onClick={() => onSelect(item)}
                className={`review-history-chip ${isActive ? "is-active" : ""}`}
              >
                <span>{item.sourceName}</span>
                <span className="review-history-chip-date">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="review-history-inline">
          No chats yet. Start one above.
        </div>
      )}
    </section>
  );
}
