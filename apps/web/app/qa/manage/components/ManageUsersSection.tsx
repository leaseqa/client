import React from "react";
import UsersTable from "./UsersTable";
import type {User} from "../../types";

type UsersAvailableProps = {
  isDataAvailable: true;
  users: User[];
  currentUserId: string;
  pendingMarkers: string[];
  onChangeRole: (userId: string, role: string) => void;
  onVerifyLawyer: (userId: string) => void;
  onToggleBan: (userId: string, banned: boolean) => void;
  onDelete: (userId: string) => void;
};

type UsersUnavailableProps = {
  isDataAvailable: false;
  error?: string;
  onRetry?: () => void;
  children?: React.ReactNode; // back-compat content
};

type ManageUsersSectionProps = {
  title: string;
  isLoading: boolean;
} & (UsersAvailableProps | UsersUnavailableProps);

export default function ManageUsersSection(props: ManageUsersSectionProps) {
  const {title, isLoading} = props;
  if (!props.isDataAvailable && props.error) {
    return (
      <section id="users" className="admin-v2-section">
        <div className="admin-v2-inline-error">
          <p>{props.error}</p>
          {props.onRetry && (
            <button className="admin-v2-link-btn" onClick={props.onRetry}>
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
      ) : props.isDataAvailable ? (
        props.users.length ? (
          <UsersTable
            users={props.users}
            currentUserId={props.currentUserId}
            pendingMarkers={props.pendingMarkers}
            onChangeRole={props.onChangeRole}
            onVerifyLawyer={props.onVerifyLawyer}
            onToggleBan={props.onToggleBan}
            onDelete={props.onDelete}
          />
        ) : (
          <div className="manage-empty-state">No users found.</div>
        )
      ) : (
        // Back-compat path
        props.children
      )}
    </section>
  );
}
