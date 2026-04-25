import React from "react";

type StatsMetrics = {
  totalUsers: number | null;
  totalSections: number | null;
  verifiedLawyers: number | null;
};

type ManageStatsProps = {
  stats: StatsMetrics;
};

export default function ManageStats({stats}: ManageStatsProps) {
  return (
    <section id="overview" className="admin-v2-section">
      <div className="admin-v2-section-heading">
        <h2>Overview</h2>
      </div>
      <div className="admin-v2-stats-grid">
        {stats.totalUsers !== null && (
          <div className="admin-v2-card">
            <div className="admin-v2-card-title">Users</div>
            <div className="admin-v2-card-value">{stats.totalUsers}</div>
          </div>
        )}
        {stats.totalSections !== null && (
          <div className="admin-v2-card">
            <div className="admin-v2-card-title">Sections</div>
            <div className="admin-v2-card-value">{stats.totalSections}</div>
          </div>
        )}
        {stats.verifiedLawyers !== null && (
          <div className="admin-v2-card">
            <div className="admin-v2-card-title">Verified Lawyers</div>
            <div className="admin-v2-card-value">{stats.verifiedLawyers}</div>
          </div>
        )}
      </div>
    </section>
  );
}
