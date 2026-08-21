import { Spinner } from "react-bootstrap";
import { Clock3 } from "lucide-react";

import { RagSession } from "../types";
import styles from "../ai-review.module.css";

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
  const renderSessions = () => {
    if ( loading ) {
      return (
        <div className={styles.historyState}>
          <Spinner size="sm"/>
          <span>Loading Reviews...</span>
        </div>
      );
    }
    if ( error ) {
      return <div className={styles.historyState}>{error}</div>;
    }
    if ( sessions.length === 0 ) {
      return (
        <div className={styles.historyState}>
          <span>No saved reviews yet.</span>
          <span>Your first source will appear here.</span>
        </div>
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
