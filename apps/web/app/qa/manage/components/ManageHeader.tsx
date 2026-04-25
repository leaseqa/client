import React from "react";
import { FaPlus, FaSync } from "react-icons/fa";

type FormMode = "closed" | "create" | "edit";

type ManageHeaderProps = {
  // Old props (back-compat)
  loading?: boolean;
  showCreateForm?: boolean;
  onRefresh: () => void;
  onShowCreate: () => void;
  // New widened props
  isRefreshing?: boolean;
  isRefreshDisabled?: boolean;
  formMode?: FormMode;
  sectionsAvailable?: boolean;
};

export default function ManageHeader({
                                       loading = false,
                                       showCreateForm = false,
                                       onRefresh,
                                       onShowCreate,
                                       isRefreshing,
                                       isRefreshDisabled,
                                       formMode,
                                       sectionsAvailable,
                                     }: ManageHeaderProps) {
  // Derive refresh UI state from widened props when present
  const refreshing = isRefreshing ?? loading;
  const refreshDisabled = isRefreshDisabled ?? loading;

  // Determine whether create CTA is visible
  const isFormOpen = (formMode && formMode !== "closed") || showCreateForm;
  const createDisabled = sectionsAvailable === false;

  return (
    <div className="manage-header">
      <div className="manage-header-content">
        <h1 className="manage-title">LeaseQA Admin</h1>
        <p className="manage-subtitle">
          Control the scenario buckets used across Q&amp;A. Deleting a section moves its posts to
          &quot;Uncategorized&quot;.
        </p>
      </div>
      <div className="manage-header-actions">
        <button className="manage-btn secondary" onClick={onRefresh} disabled={refreshDisabled}>
          <FaSync size={12} className={refreshing ? "spin" : ""}/>
          <span>Refresh</span>
        </button>
        {!isFormOpen && (
          <button className="manage-btn primary" onClick={onShowCreate} disabled={createDisabled}>
            <FaPlus size={12}/>
            <span>New Section</span>
          </button>
        )}
      </div>
    </div>
  );
}
