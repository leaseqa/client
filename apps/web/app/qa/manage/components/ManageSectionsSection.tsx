import React from "react";
import SectionsTable from "./SectionsTable";
import type { Folder } from "../../types";

type SectionsAvailableProps = {
  isDataAvailable: true;
  sections: Folder[];
  pendingMarkers: string[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

type SectionsUnavailableProps = {
  isDataAvailable: false;
  error?: string;
  onRetry?: () => void;
  children?: React.ReactNode; // back-compat content
};

type ManageSectionsSectionProps = {
  title: string;
  isLoading: boolean;
} & (SectionsAvailableProps | SectionsUnavailableProps);

export default function ManageSectionsSection(props: ManageSectionsSectionProps) {
  const { title, isLoading } = props;
  if ( !props.isDataAvailable && props.error ) {
    return (
      <section id="sections" className="admin-v2-section">
        <div className="admin-v2-inline-error">
          <p>{props.error}</p>
          {props.onRetry && (
            <button className="admin-v2-link-btn" onClick={props.onRetry}>
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
      ) : props.isDataAvailable ? (
        props.sections.length ? (
          <SectionsTable
            folders={props.sections}
            pendingMarkers={props.pendingMarkers}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
          />
        ) : (
          <div className="manage-empty-state">No sections found. Create one to get started.</div>
        )
      ) : (
        // Back-compat path
        props.children
      )}
    </section>
  );
}
