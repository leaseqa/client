import React from "react";
import UsersTable from "./UsersTable";
import type { User } from "../../types";

type ManageUsersSectionProps = {
  title: string;
  isLoading: boolean;
  isDataAvailable: boolean;
  hasLoaded?: boolean;
  error?: string;
  onRetry?: () => void;
  // Owned data and actions
  users?: User[];
  currentUserId?: string;
  pendingMarkers?: string[];
  onChangeRole?: (userId: string, role: string) => void;
  onVerifyLawyer?: (userId: string) => void;
  onToggleBan?: (userId: string, banned: boolean) => void;
  onDelete?: (userId: string) => void;
  // Narrow back-compat escape hatch
  children?: React.ReactNode;
};

export default function ManageUsersSection({
  title,
  isLoading,
  isDataAvailable,
  error,
  onRetry,
  users = [],
  currentUserId = "",
  pendingMarkers = [],
  onChangeRole,
  onVerifyLawyer,
  onToggleBan,
  onDelete,
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
      ) : isDataAvailable ? (
        users.length ? (
          <UsersTable
            users={users}
            currentUserId={currentUserId}
            pendingMarkers={pendingMarkers}
            onChangeRole={onChangeRole!}
            onVerifyLawyer={onVerifyLawyer!}
            onToggleBan={onToggleBan!}
            onDelete={onDelete!}
          />
        ) : (
          <div className="manage-empty-state">No users found.</div>
        )
      ) : (
        // Back-compat path
        children
      )}
    </section>
  );
}
