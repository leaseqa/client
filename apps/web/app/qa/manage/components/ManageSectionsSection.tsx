import React from "react";
import SectionsTable from "./SectionsTable";
import type { Folder } from "../../types";

type ManageSectionsSectionProps = {
  title: string;
  isLoading: boolean;
  isDataAvailable: boolean;
  hasLoaded?: boolean;
  error?: string;
  onRetry?: () => void;
  // Owned data/actions
  sections?: Folder[];
  pendingMarkers?: string[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  // Back-compat escape hatch
  children?: React.ReactNode;
};

export default function ManageSectionsSection({
  title,
  isLoading,
  isDataAvailable,
  error,
  onRetry,
  sections = [],
  pendingMarkers = [],
  onEdit,
  onDelete,
  children,
}: ManageSectionsSectionProps) {
  if (!isDataAvailable && error) {
    return (
      <section id="sections" className="admin-v2-section">
        <div className="admin-v2-inline-error">
          <p>{error}</p>
          {onRetry && (
            <button className="admin-v2-link-btn" onClick={onRetry}>
              Retry sections
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="sections" className="admin-v2-section">
      <div className="admin-v2-section-heading">
        <h2>{title}</h2>
      </div>
      {isLoading ? (
        <p className="admin-v2-loading-copy">Loading sections…</p>
      ) : isDataAvailable ? (
        sections.length ? (
          <SectionsTable
            folders={sections}
            pendingMarkers={pendingMarkers}
            onEdit={onEdit || (() => {})}
            onDelete={onDelete || (() => {})}
          />
        ) : (
          <div className="manage-empty-state">No sections found. Create one to get started.</div>
        )
      ) : (
        // Back-compat path
        children
      )}
    </section>
  );
}
