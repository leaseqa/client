import React from "react";
import { FaCheck } from "react-icons/fa";

type FolderDraft = {
  name: string;
  displayName: string;
  description?: string;
  color?: string;
};

type CreateSectionFormProps = {
  draft: FolderDraft;
  loading: boolean;
  onDraftChange: (draft: FolderDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  // Widened contract
  mode?: "create" | "edit";
  disabled?: boolean;
  errors?: Partial<Record<keyof FolderDraft, string>>;
  submitError?: string;
  refetchError?: string;
  onRetryRefetch?: () => void;
};

export default function CreateSectionForm({
                                            draft,
                                            loading,
                                            onDraftChange,
                                            onSave,
                                            onCancel,
                                            mode = "create",
                                            disabled = false,
                                            errors = {},
                                            submitError = "",
                                            refetchError = "",
                                            onRetryRefetch,
                                          }: CreateSectionFormProps) {
  return (
    <div className="manage-card">
      <div className="manage-card-header">
        <h2>{mode === "edit" ? "Edit section" : "Create New Section"}</h2>
      </div>
      <div className="manage-card-body">
        <div className="manage-form-grid">
          <div className="manage-form-group">
            <label>Name (slug)</label>
            <input
              type="text"
              placeholder="e.g. repairs"
              value={draft.name}
              name="name"
              readOnly={mode === "edit"}
              disabled={disabled}
              onChange={(e) => onDraftChange({ ...draft, name: e.target.value.trim() })}
            />
            <span className="manage-form-hint">Used in URLs and code</span>
            {errors.name && <div className="manage-field-error">{errors.name}</div>}
          </div>
          <div className="manage-form-group">
            <label>Display Name</label>
            <input
              type="text"
              placeholder="Repairs & Habitability"
              value={draft.displayName}
              disabled={disabled}
              onChange={(e) => onDraftChange({ ...draft, displayName: e.target.value })}
            />
            <span className="manage-form-hint">Shown to users</span>
            {errors.displayName && <div className="manage-field-error">{errors.displayName}</div>}
          </div>
          <div className="manage-form-group full-width">
            <label>Description</label>
            <textarea
              rows={2}
              placeholder="Optional helper text for this section"
              value={draft.description}
              disabled={disabled}
              onChange={(e) => onDraftChange({ ...draft, description: e.target.value })}
            />
            {errors.description && <div className="manage-field-error">{errors.description}</div>}
          </div>
        </div>
        <div className="manage-form-actions">
          <button className="manage-btn secondary" onClick={onCancel} disabled={disabled}>
            Cancel
          </button>
          <button className="manage-btn primary" onClick={onSave} disabled={loading || disabled}>
            <FaCheck size={12}/>
            <span>{mode === "edit" ? "Save Changes" : "Create Section"}</span>
          </button>
        </div>
        {(submitError || refetchError) && (
          <div className="manage-inline-errors">
            {submitError && <div className="manage-alert error">{submitError}</div>}
            {refetchError && (
              <div className="manage-alert error">
                {refetchError}
                {onRetryRefetch && (
                  <button className="admin-v2-link-btn" onClick={onRetryRefetch}>Retry refetch</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
