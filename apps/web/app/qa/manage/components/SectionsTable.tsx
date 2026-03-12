import React from "react";
import { FaCheck, FaEdit, FaTimes, FaTrash } from "react-icons/fa";
import { Folder, FolderDraft } from "../../types";

type SectionsTableProps = {
  folders: Folder[];
  // New simplified contract
  mode?: "list-only" | "inline-edit";
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  // Back-compat props to keep old page.tsx working
  editingId?: string | null;
  drafts?: Record<string, FolderDraft>;
  onDraftChange?: (id: string, field: keyof FolderDraft, value: string) => void;
  onSave?: (id: string) => void;
  onCancelEdit?: (id: string) => void;
  // New contract: pending markers `${folderId}:delete|edit`
  pendingMarkers?: string[];
};

export default function SectionsTable({
  folders,
  mode,
  onEdit,
  onDelete,
  editingId = null,
  drafts = {},
  onDraftChange,
  onSave,
  onCancelEdit,
  pendingMarkers = [],
}: SectionsTableProps) {
    const inferredInline = Boolean(onDraftChange && onSave && onCancelEdit);
    const effectiveMode: "list-only" | "inline-edit" = mode ?? (inferredInline ? "inline-edit" : "list-only");
    return (
        <div className="manage-card">
            <div className="manage-card-header">
                <h2>Existing Sections</h2>
                <span className="manage-count">{folders.length} sections</span>
            </div>
            <div className="manage-card-body no-padding scrollable">
                {!folders.length ? (
                    <div className="manage-empty-state">
                        No sections found. Create one to get started.
                    </div>
                ) : (
                    <div className="manage-table">
                        <div className="manage-table-header">
                            <div className="manage-table-cell name">Display Name</div>
                            <div className="manage-table-cell slug">Slug</div>
                            <div className="manage-table-cell desc">Description</div>
                            <div className="manage-table-cell actions">Actions</div>
                        </div>
                        {folders.map((folder) => {
                            const locked = folder.name === "uncategorized";
                            const rowPending = pendingMarkers.some((m) => m.startsWith(`${folder._id}:`));
                            if (effectiveMode === "list-only") {
                                return (
                                    <div key={folder._id} className={`manage-table-row ${rowPending ? "pending" : ""}`}>
                                        <div className="manage-table-cell name">
                                            <span className="manage-folder-name">{folder.displayName}</span>
                                        </div>
                                        <div className="manage-table-cell slug">
                                            <span className="manage-slug">{folder.name}</span>
                                        </div>
                                        <div className="manage-table-cell desc">
                                            <span className="manage-description">{folder.description || "—"}</span>
                                        </div>
                                        <div className="manage-table-cell actions">
                                            <button className="manage-icon-btn edit" onClick={() => onEdit(folder._id)} title="Edit" disabled={rowPending}>
                                                <FaEdit size={12} />
                                            </button>
                                            <button
                                                className="manage-icon-btn delete"
                                                onClick={() => onDelete(folder._id)}
                                                disabled={locked || rowPending}
                                                title={locked ? "Default section cannot be deleted" : "Delete"}
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            // inline-edit back-compat path
                            const editing = editingId === folder._id;
                            const draft = drafts[folder._id] || {
                                name: folder.name,
                                displayName: folder.displayName,
                                description: folder.description,
                                color: folder.color,
                            };
                            return (
                                <div key={folder._id} className={`manage-table-row ${editing ? "editing" : ""} ${rowPending ? "pending" : ""}`}>
                                    <div className="manage-table-cell name">
                                        {editing ? (
                                            <input
                                                type="text"
                                                value={draft.displayName}
                                                onChange={(e) => onDraftChange && onDraftChange(folder._id, "displayName", e.target.value)}
                                            />
                                        ) : (
                                            <span className="manage-folder-name">{folder.displayName}</span>
                                        )}
                                    </div>
                                    <div className="manage-table-cell slug">
                                        <span className="manage-slug">{folder.name}</span>
                                    </div>
                                    <div className="manage-table-cell desc">
                                        {editing ? (
                                            <textarea
                                                rows={2}
                                                value={draft.description}
                                                onChange={(e) => onDraftChange && onDraftChange(folder._id, "description", e.target.value)}
                                            />
                                        ) : (
                                            <span className="manage-description">{folder.description || "—"}</span>
                                        )}
                                    </div>
                                    <div className="manage-table-cell actions">
                                        {editing ? (
                                            <>
                                                <button className="manage-icon-btn save" onClick={() => onSave && onSave(folder._id)} title="Save" disabled={rowPending}>
                                                    <FaCheck size={12} />
                                                </button>
                                                <button className="manage-icon-btn cancel" onClick={() => onCancelEdit && onCancelEdit(folder._id)} title="Cancel" disabled={rowPending}>
                                                    <FaTimes size={12} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="manage-icon-btn edit" onClick={() => onEdit(folder._id)} title="Edit" disabled={rowPending}>
                                                    <FaEdit size={12} />
                                                </button>
                                                <button
                                                    className="manage-icon-btn delete"
                                                    onClick={() => onDelete(folder._id)}
                                                    disabled={locked || rowPending}
                                                    title={locked ? "Default section cannot be deleted" : "Delete"}
                                                >
                                                    <FaTrash size={12} />
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
