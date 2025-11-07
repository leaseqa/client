"use client";

import { useState } from "react";

type Folder = {
  id: string;
  name: string;
  displayName: string;
};

const defaultFolders: Folder[] = [
  { id: "lease_review", name: "lease_review", displayName: "Lease Review" },
  { id: "security_deposit", name: "security_deposit", displayName: "Security Deposits" },
  { id: "maintenance", name: "maintenance", displayName: "Maintenance Duties" },
  { id: "eviction", name: "eviction", displayName: "Evictions & Terminations" },
  { id: "utilities", name: "utilities", displayName: "Utilities" },
  { id: "roommate_disputes", name: "roommate_disputes", displayName: "Roommate Disputes" },
  { id: "lease_termination", name: "lease_termination", displayName: "Early Termination" },
  { id: "rent_increase", name: "rent_increase", displayName: "Rent Increases" },
  { id: "other", name: "other", displayName: "Other" },
];

export default function AdminPage() {
  const [folders, setFolders] = useState<Folder[]>(defaultFolders);
  const [newFolder, setNewFolder] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleAddFolder = () => {
    if (!newFolder.trim()) return;
    setFolders((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newFolder.trim(), displayName: newFolder.trim() },
    ]);
    setNewFolder("");
  };

  const handleDelete = (id: string) => {
    setFolders((prev) => prev.filter((folder) => folder.id !== id));
  };

  const handleStartEdit = (folder: Folder) => {
    setEditingId(folder.id);
    setEditingValue(folder.displayName);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === editingId
          ? { ...folder, displayName: editingValue.trim() || folder.displayName }
          : folder,
      ),
    );
    setEditingId(null);
    setEditingValue("");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 text-slate-100">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Operations</p>
        <h1 className="text-3xl font-semibold text-white">Admin console</h1>
        <p className="text-sm text-slate-400">
          Admin-only view for maintaining the housing topics and keeping the community tidy.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <AdminStat label="Posts pending review" value="6" />
        <AdminStat label="Reports to triage" value="2" />
        <AdminStat label="New users (7d)" value="38" />
      </section>

      <section className="rounded-2xl border border-white/5 bg-[var(--app-panel)] p-6 shadow-2xl shadow-black/30">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Manage Folders</h2>
            <p className="text-xs text-slate-500">
              Nine default folders cover the rent topics. Add, rename, or remove as needed.
            </p>
          </div>
          <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-white/10">
            Sync to database
          </button>
        </header>

        <div className="mt-6 flex gap-3">
          <input
            className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-blue)] focus:ring-opacity-40"
            placeholder="New folder name, e.g., Lease Extension"
            value={newFolder}
            onChange={(event) => setNewFolder(event.target.value)}
          />
          <button
            className="rounded-xl bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-blue-hover)]"
            onClick={handleAddFolder}
          >
            Add
          </button>
        </div>

        <ul className="mt-6 divide-y divide-white/10 text-sm text-slate-200">
          {folders.map((folder) => {
            const editing = editingId === folder.id;
            return (
              <li key={folder.id} className="flex items-center gap-3 py-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--pill-bg)] text-xs font-semibold text-slate-200">
                  {folder.displayName.slice(0, 2)}
                </span>
                <div className="flex-1">
                  {editing ? (
                    <input
                      className="w-full rounded border border-white/10 bg-black/20 px-2 py-1 text-sm text-white focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-blue)] focus:ring-opacity-40"
                      value={editingValue}
                      onChange={(event) => setEditingValue(event.target.value)}
                    />
                  ) : (
                    <p className="font-medium text-white">{folder.displayName}</p>
                  )}
                  <p className="text-xs text-slate-500">{folder.name}</p>
                </div>
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <button
                        className="rounded bg-[var(--badge-bg)] px-3 py-1 text-xs font-medium text-slate-100 hover:opacity-90"
                        onClick={handleSaveEdit}
                      >
                        Save
                      </button>
                      <button
                        className="rounded border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/5"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="rounded border border-white/10 px-3 py-1 text-xs text-slate-300 hover:border-[var(--accent-blue)] hover:text-white"
                        onClick={() => handleStartEdit(folder)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded border border-red-400/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDelete(folder.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function AdminStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[var(--app-panel)] p-6 text-sm shadow-lg shadow-black/20">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
