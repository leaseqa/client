import React from "react";

type ManageUsersSectionProps = {
  title: string;
  isLoading: boolean;
  isDataAvailable: boolean;
  hasLoaded?: boolean;
  error?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
};

export default function ManageUsersSection({
  title,
  isLoading,
  isDataAvailable,
  error,
  onRetry,
  children,
}: ManageUsersSectionProps) {
  if (!isDataAvailable && error) {
    return (
      <section id="users" className="admin-v2-section">
        <div className="admin-v2-inline-error">
          <p>{error}</p>
          {onRetry && (
            <button className="admin-v2-link-btn" onClick={onRetry}>
              Retry users
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="users" className="admin-v2-section">
      <div className="admin-v2-section-heading">
        <h2>{title}</h2>
      </div>
      {isLoading ? (
        <p className="admin-v2-loading-copy">Loading users…</p>
      ) : (
        children
      )}
    </section>
  );
}

