import React from "react";
import Link from "next/link";
import { format } from "date-fns";

export type ActivityTimelineItem = {
  _id: string;
  type: string;
  title: string;
  summary?: string;
  href?: string;
  createdAt: string;
};

type ActivityTimelineProps = {
  items: ActivityTimelineItem[];
  loading: boolean;
  error: string;
  isGuest: boolean;
  onRetry: () => void;
};

const formatTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : format(date, "MMM d, yyyy 'at' h:mm a");
};

export default function ActivityTimeline({
                                           items,
                                           loading,
                                           error,
                                           isGuest,
                                           onRetry,
                                         }: ActivityTimelineProps) {
  return (
    <section className="account-card h-100" aria-labelledby="account-activity-title">
      <div className="account-card-head">
        <h2 id="account-activity-title" className="account-card-title">Recent activity</h2>
        <p className="account-card-sub">
          {isGuest ? "Sign in to track activity" : "Your latest actions"}
        </p>
      </div>

      {isGuest ? (
        <div className="account-activity-empty">
          <p>Your saved history starts after sign-in.</p>
          <Link href="/auth/login" className="btn-warm-outline">
            Sign in to track
          </Link>
        </div>
      ) : loading ? (
        <div className="review-history-inline">Loading activity…</div>
      ) : error ? (
        <div className="account-activity-empty">
          <p>{error}</p>
          <button type="button" className="btn-warm-outline" onClick={onRetry}>
            Retry activity
          </button>
        </div>
      ) : items.length > 0 ? (
        <ul className="account-activity-list">
          {items.map((item) => {
            const body = (
              <>
                <span className="account-activity-title">{item.title}</span>
                {item.summary ? (
                  <span className="account-activity-summary">{item.summary}</span>
                ) : null}
                <time className="account-activity-time" dateTime={item.createdAt}>
                  {formatTime(item.createdAt)}
                </time>
              </>
            );

            return (
              <li key={item._id}>
                {item.href ? (
                  <Link href={item.href} className="account-activity-item">
                    {body}
                  </Link>
                ) : (
                  <div className="account-activity-item">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="account-activity-empty">
          <p>No saved activity yet. Start a lease review or post a question.</p>
        </div>
      )}
    </section>
  );
}
