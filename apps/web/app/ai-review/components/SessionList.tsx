import { Clock3 } from "lucide-react";

import { RagSession } from "../types";
import RemoteDataState from "@/components/ui/RemoteDataState";
import styles from "../ai-review.module.css";

type SessionListProps = {
  sessions: RagSession[];
  activeSessionId: string | null;
  loading: boolean;
  isGuest: boolean;
  error?: string | null;
  onSelect: (session: RagSession) => void;
  onRetry?: () => void;
};

export default function SessionList({
  sessions,
  activeSessionId,
  loading,
  isGuest,
  error,
  onSelect,
  onRetry,
}: SessionListProps) {
  const renderSessions = () => {
    if ( loading ) {
      return (
        <RemoteDataState
          kind="loading"
          title="Loading reviews"
          compact
          className={styles.historyState}
        />
      );
    }
    if ( error ) {
      return (
        <RemoteDataState
          kind="error"
          title={error}
          description="Nothing was lost. Opening the list again will retry."
          action={onRetry ? { label: "Try again", onClick: onRetry } : undefined}
          compact
          className={styles.historyState}
        />
      );
    }
    if ( sessions.length === 0 ) {
      return (
        <RemoteDataState
          kind="empty"
          title="No saved reviews yet"
          description="Your first source will appear here."
          compact
          className={styles.historyState}
        />
      );
    }
    return (
      <div className={styles.historyList}>
        {sessions.map((item) => {
          const isActive = activeSessionId === item._id;
          return (
            <button
              key={item._id}
              type="button"
              onClick={() => onSelect(item)}
              className={styles.historyItem}
              aria-current={isActive ? "true" : undefined}
            >
              <span>{item.sourceName}</span>
              <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <section className={styles.desktopHistory} aria-labelledby="review-history-title">
        <div className={styles.historyHeader}>
          <div id="review-history-title" className={styles.sectionLabel}>
            <Clock3 size={12}/>
            <span>Review History</span>
          </div>
          <span aria-hidden="true">+</span>
        </div>
        {isGuest ? (
          <span className={styles.historyHint}>Temporary for this guest session</span>
        ) : null}
        {renderSessions()}
      </section>

      <details className={styles.mobileHistory}>
        <summary>
          <span>Review History</span>
          <span>{sessions.length} saved</span>
        </summary>
        <div className={styles.mobileHistoryBody}>{renderSessions()}</div>
      </details>
    </>
  );
}
