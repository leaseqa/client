import React from "react";

export type ManageSidebarStats = {
  pendingLawyerCount: number | null;
  // verifiedLawyers intentionally unused in Sidebar per spec for Task 2
  verifiedLawyers: number | null;
  bannedUserCount: number | null;
  totalUsers: number | null;
  totalSections: number | null;
};

type ManageSidebarProps = {
  overviewHref?: string;
  usersHref?: string;
  sectionsHref?: string;
  moderationHref?: string;
  stats: ManageSidebarStats;
};

export default function ManageSidebar({
  overviewHref = "#overview",
  usersHref = "#users",
  sectionsHref = "#sections",
  moderationHref = "/qa",
  stats,
}: ManageSidebarProps) {
  return (
    <aside className="admin-v2-sidebar">
      <nav className="admin-v2-nav">
        <a href={overviewHref}>Overview</a>
        <a href={usersHref}>Users</a>
        <a href={sectionsHref}>Sections</a>
      </nav>

      <div className="admin-v2-cards">
        {stats.pendingLawyerCount !== null && (
          <div className="admin-v2-card">
            <div className="admin-v2-card-title">Pending Verification</div>
            <div className="admin-v2-card-value">{stats.pendingLawyerCount}</div>
          </div>
        )}
        {stats.bannedUserCount !== null && (
          <div className="admin-v2-card">
            <div className="admin-v2-card-title">Banned Users</div>
            <div className="admin-v2-card-value">{stats.bannedUserCount}</div>
          </div>
        )}
      </div>

      <div className="admin-v2-secondary">
        <a className="admin-v2-link-btn" href={moderationHref}>
          Open Moderation
        </a>
      </div>
    </aside>
  );
}
