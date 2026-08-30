import React from "react";
import { User } from "../../types";
import { Ban, Check, Trash2, UserCheck } from "lucide-react";
import RemoteDataState from "@/components/ui/RemoteDataState";

type UsersTableProps = {
  users: User[];
  currentUserId: string;
  // New contract: action-scoped markers: `${userId}:role|verify|ban|delete`
  pendingMarkers?: string[];
  onChangeRole: (userId: string, role: string) => void;
  onVerifyLawyer: (userId: string) => void;
  onToggleBan: (userId: string, banned: boolean) => void;
  onDelete: (userId: string) => void;
  // Back-compat (weak) for legacy callers; if present, OR into pending computation
  pendingIds?: string[];
};

export default function UsersTable({
                                     users,
                                     currentUserId,
                                     pendingMarkers = [],
                                     onChangeRole,
                                     onVerifyLawyer,
                                     onToggleBan,
                                     onDelete,
                                     pendingIds = [],
                                   }: UsersTableProps) {
  return (
    <div className="manage-card">
      <div className="manage-card-header">
        <h2>Users</h2>
        <span className="manage-count">{users.length} users</span>
      </div>
      <div className="manage-card-body no-padding scrollable">
        {!users.length ? (
          <RemoteDataState kind="empty" title="No users found" compact/>
        ) : (
          <div className="manage-table">
            <div className="manage-table-header">
              <div className="manage-table-cell user-name">User</div>
              <div className="manage-table-cell user-email">Email</div>
              <div className="manage-table-cell user-role">Role</div>
              <div className="manage-table-cell user-status">Status</div>
              <div className="manage-table-cell actions">Actions</div>
            </div>
            {users.map((user) => {
              const isSelf = user._id === currentUserId;
              const isPending = pendingMarkers.some((m) => m.startsWith(`${user._id}:`)) || pendingIds.includes(user._id);
              return (
                <div key={user._id}
                     className={`manage-table-row ${user.banned ? "banned" : ""} ${isPending ? "pending" : ""}`}>
                  <div className="manage-table-cell user-name">
                    <div className="user-info">
                                            <span className="icon-circle icon-circle-sm icon-bg-purple">
                                                {user.username?.charAt(0).toUpperCase() || "?"}
                                            </span>
                      <span className="manage-folder-name">{user.username}</span>
                    </div>
                  </div>
                  <div className="manage-table-cell user-email">
                    <span className="manage-description">{user.email}</span>
                  </div>
                  <div className="manage-table-cell user-role">
                    <select
                      className="user-role-select"
                      value={user.role}
                      onChange={(e) => onChangeRole(user._id, e.target.value)}
                      disabled={isSelf || isPending}
                    >
                      <option value="tenant">Tenant</option>
                      <option value="lawyer">Lawyer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="manage-table-cell user-status">
                    <div className="user-status-badges">
                      {user.banned && (
                        <span className="user-badge banned">Banned</span>
                      )}
                      {user.role === "lawyer" && user.lawyerVerified && (
                        <span className="user-badge verified">Verified</span>
                      )}
                      {user.role === "lawyer" && !user.lawyerVerified && (
                        <span className="user-badge unverified">Unverified</span>
                      )}
                    </div>
                  </div>
                  <div className="manage-table-cell actions">
                    {user.role === "lawyer" && !user.lawyerVerified && (
                      <button
                        className="manage-icon-btn verify"
                        onClick={() => onVerifyLawyer(user._id)}
                        disabled={isPending}
                        title="Verify lawyer"
                      >
                        <UserCheck size={12}/>
                      </button>
                    )}
                    {!isSelf && (
                      <>
                        <button
                          className={`manage-icon-btn ${user.banned ? "unban" : "ban"}`}
                          onClick={() => onToggleBan(user._id, !user.banned)}
                          disabled={isPending}
                          title={user.banned ? "Unban user" : "Ban user"}
                        >
                          {user.banned ? <Check size={12}/> : <Ban size={12}/>}
                        </button>
                        <button
                          className="manage-icon-btn delete"
                          onClick={() => onDelete(user._id)}
                          disabled={isPending}
                          title="Delete user"
                        >
                          <Trash2 size={12}/>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
