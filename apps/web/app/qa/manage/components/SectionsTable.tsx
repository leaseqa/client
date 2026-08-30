import React from "react";
import { Folder, FolderDraft } from "../../types";
import { SquarePen, Trash2 } from "lucide-react";
import RemoteDataState from "@/components/ui/RemoteDataState";

type SectionsTableProps = {
  folders: Folder[];
  // New contract (Task 2): list-only behavior with edit/delete intents
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  // Pending markers `${folderId}:delete|edit`
  pendingMarkers?: string[];
  // Back-compat props to keep old page.tsx compiling (ignored at runtime in Task 2)
  mode?: "list-only" | "inline-edit";
  editingId?: string | null;
  drafts?: Record<string, FolderDraft>;
  onDraftChange?: (id: string, field: keyof FolderDraft, value: string) => void;
  onSave?: (id: string) => void;
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
        <h2>Existing sections</h2>
        <span className="manage-count">{folders.length} sections</span>
      </div>
      <div className="manage-card-body no-padding scrollable">
        {!folders.length ? (
          <RemoteDataState
            kind="empty"
            title="No sections yet"
            description="Create one to start grouping questions."
            compact
          />
        ) : (
          <div className="manage-table">
            <div className="manage-table-header">
              <div className="manage-table-cell name">Display name</div>
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
                    <button className="manage-icon-btn edit" onClick={() => onEdit(folder._id)} title="Edit"
                            disabled={rowPending}>
                      <SquarePen size={12}/>
                    </button>
                    <button
                      className="manage-icon-btn delete"
                      onClick={() => onDelete(folder._id)}
                      disabled={locked || rowPending}
                      title={locked ? "Default section cannot be deleted" : "Delete"}
                    >
                      <Trash2 size={12}/>
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
