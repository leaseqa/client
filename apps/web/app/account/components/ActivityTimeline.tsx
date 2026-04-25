import React from "react";
import Link from "next/link";
import { Stack } from "react-bootstrap";
import { FaComments, FaFileAlt, FaHistory, FaRobot, } from "react-icons/fa";

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

const getActivityIcon = (type: string) => {
  if ( type === "ai_review_created" ) {
    return FaRobot;
  }
  if ( type === "answer_received" || type === "discussion_received" ) {
    return FaComments;
  }
  return FaFileAlt;
};

const formatTime = (value: string) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function ActivityTimeline({
                                           items,
                                           loading,
                                           error,
                                           isGuest,
                                           onRetry,
                                         }: ActivityTimelineProps) {
  return (
    <div className="account-card h-100">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="info-team-icon info-team-icon--terra">
          <FaHistory size={18}/>
        </div>
        <div>
          <div className="fw-bold">Recent Activity</div>
          <div className="text-secondary small">
            {isGuest ? "Sign in to track activity" : "Your latest actions"}
          </div>
        </div>
      </div>

      {isGuest ? (
        <div className="text-center py-4">
          <p className="text-secondary mb-3">
            Your saved history starts after sign-in.
          </p>
          <a href="/auth/login" className="btn-warm-outline">
            Sign in to track
          </a>
        </div>
      ) : loading ? (
        <div className="review-history-inline">Loading activity...</div>
      ) : error ? (
        <div className="account-activity-empty">
          <p className="text-secondary mb-3">{error}</p>
          <button type="button" className="btn-warm-outline" onClick={onRetry}>
            Retry activity
          </button>
        </div>
      ) : items.length > 0 ? (
        <Stack gap={3} className="account-activity-list">
          {items.map((item) => {
            const Icon = getActivityIcon(item.type);
            const body = (
              <div className="account-field">
                <div
                  className="info-team-icon info-team-icon--muted"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    marginBottom: 0,
                  }}
                >
                  <Icon size={14}/>
                </div>
                <div className="flex-grow-1">
                  <div className="small fw-semibold">{item.title}</div>
                  {item.summary ? (
                    <div className="text-secondary small">{item.summary}</div>
                  ) : null}
                  <div className="text-secondary small">
                    {formatTime(item.createdAt)}
                  </div>
                </div>
              </div>
            );

            return item.href ? (
              <Link key={item._id} href={item.href} className="text-decoration-none">
                {body}
              </Link>
            ) : (
              <div key={item._id}>{body}</div>
            );
          })}
        </Stack>
      ) : (
        <div className="account-activity-empty">
          <p className="text-secondary mb-0">
            No saved activity yet. Start an AI review or post a question.
          </p>
        </div>
      )}
    </div>
  );
}
