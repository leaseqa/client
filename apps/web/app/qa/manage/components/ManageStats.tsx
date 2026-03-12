import React from "react";
import type { ManageSidebarStats } from "./ManageSidebar";

type ManageStatsProps = {
  stats: ManageSidebarStats;
};

export default function ManageStats({ stats }: ManageStatsProps) {
  return (
    <section id="overview" className="admin-v2-section">
      <div className="admin-v2-section-heading">
        <h2>Overview</h2>
      </div>
      <div className="admin-v2-stats-grid">
        <div className="admin-v2-card">
          <div className="admin-v2-card-title">Users</div>
          <div className="admin-v2-card-value">{stats.totalUsers ?? "—"}</div>
        </div>
        <div className="admin-v2-card">
          <div className="admin-v2-card-title">Sections</div>
          <div className="admin-v2-card-value">{stats.totalSections ?? "—"}</div>
        </div>
        <div className="admin-v2-card">
          <div className="admin-v2-card-title">Pending Verification</div>
          <div className="admin-v2-card-value">{stats.pendingLawyerCount ?? "—"}</div>
        </div>
        <div className="admin-v2-card">
          <div className="admin-v2-card-title">Banned Users</div>
          <div className="admin-v2-card-value">{stats.bannedUserCount ?? "—"}</div>
        </div>
      </div>
    </section>
  );
}

