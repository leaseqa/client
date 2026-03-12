import React from "react";
import { FaCheck, FaEdit, FaTimes, FaTrash } from "react-icons/fa";
import { Folder, FolderDraft } from "../../types";

type SectionsTableProps = {
  folders: Folder[];
  // New contract (Task 2): list-only behavior with edit/delete intents
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  // Pending markers `${folderId}:delete|edit`
  pendingMarkers?: string[];
  // Back-compat props to keep old page.tsx compiling (ignored at runtime in Task 2)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mode?: "list-only" | "inline-edit";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  editingId?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  drafts?: Record<string, FolderDraft>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDraftChange?: (id: string, field: keyof FolderDraft, value: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSave?: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCancelEdit?: (id: string) => void;
};

export default function SectionsTable({
  folders,
  onEdit,
  onDelete,
  pendingMarkers = [],
}: SectionsTableProps) {
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
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
