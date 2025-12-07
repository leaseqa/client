"use client";

import {useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {useRouter} from "next/navigation";
import * as client from "../client";
import {RootState} from "@/app/store";
import {Folder, FolderDraft, User} from "../types";
import {CreateSectionForm, ManageAlerts, ManageHeader, SectionsTable, UsersTable} from "./components";

const EMPTY_DRAFT: FolderDraft = {name: "", displayName: "", description: "", color: ""};

export default function ManageSectionsPage() {
    const router = useRouter();
    const session = useSelector((state: RootState) => state.session);
    const isAdmin = session.user?.role === "admin";
    const currentUserId = session.user?.id || (session.user as any)?._id || "";

    const [folders, setFolders] = useState<Folder[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newFolder, setNewFolder] = useState<FolderDraft>(EMPTY_DRAFT);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, FolderDraft>>({});

    const sortedFolders = useMemo(
        () => [...folders].sort((a, b) => a.displayName.localeCompare(b.displayName)),
        [folders]
    );

    const sortedUsers = useMemo(
        () => [...users].sort((a, b) => a.username.localeCompare(b.username)),
        [users]
    );

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const [foldersRes, usersRes] = await Promise.all([
                client.fetchFolders(),
                client.fetchAllUsers(),
            ]);
            setFolders((foldersRes as any)?.data || foldersRes || []);
            setUsers((usersRes as any)?.data || usersRes || []);
        } catch (err: any) {
            setError(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAdmin) {
            router.push("/qa");
            return;
        }
        loadData();
    }, [isAdmin]);

    if (!isAdmin) return null;

    const handleSaveNew = async () => {
        setError("");
        setSuccess("");
        if (!newFolder.name.trim() || !newFolder.displayName.trim()) {
            setError("Name and Display Name are required.");
            return;
        }
        try {
            await client.createFolder({
                name: newFolder.name.trim(),
                displayName: newFolder.displayName.trim(),
                description: newFolder.description?.trim() || "",
                color: newFolder.color || undefined,
            });
            setNewFolder(EMPTY_DRAFT);
            setShowCreateForm(false);
            setSuccess("Section created successfully.");
            await loadData();
        } catch (err: any) {
            setError(err.message || "Failed to create section");
        }
    };

    const handleCancelCreate = () => {
        setNewFolder(EMPTY_DRAFT);
        setShowCreateForm(false);
        setError("");
    };

    const handleEdit = (id: string) => {
        const folder = folders.find((f) => f._id === id);
        if (folder) {
            setDrafts((prev) => ({
                ...prev,
                [id]: {
                    name: folder.name,
                    displayName: folder.displayName,
                    description: folder.description || "",
                    color: folder.color,
                },
            }));
            setEditingId(id);
        }
    };

    const handleDraftChange = (id: string, field: keyof FolderDraft, value: string) => {
        setDrafts((prev) => ({
            ...prev,
            [id]: {...prev[id], [field]: value},
        }));
    };

    const handleSaveEdit = async (id: string) => {
        setError("");
        setSuccess("");
        const draft = drafts[id];
        if (!draft?.displayName?.trim()) {
            setError("Display Name is required.");
            return;
        }
        try {
            await client.updateFolder(id, {
                displayName: draft.displayName.trim(),
                description: draft.description?.trim() || "",
                color: draft.color,
            });
            setEditingId(null);
            setDrafts((prev) => {
                const next = {...prev};
                delete next[id];
                return next;
            });
            setSuccess("Section updated successfully.");
            await loadData();
        } catch (err: any) {
            setError(err.message || "Failed to update section");
        }
    };

    const handleCancelEdit = (id: string) => {
        setEditingId(null);
        setDrafts((prev) => {
            const next = {...prev};
            delete next[id];
            return next;
        });
    };

    const handleDeleteFolder = async (id: string) => {
        setError("");
        setSuccess("");
        const target = folders.find((f) => f._id === id);
        if (!window.confirm(`Delete section "${target?.displayName || ""}"?`)) return;
        try {
            await client.deleteFolder(id);
            setSuccess("Section deleted.");
            await loadData();
        } catch (err: any) {
            setError(err.message || "Failed to delete section");
        }
    };

    const handleChangeRole = async (userId: string, role: string) => {
        setError("");
        setSuccess("");
        try {
            await client.updateUserRole(userId, role);
            setSuccess("User role updated.");
            await loadData();
        } catch (err: any) {
            setError(err.message || "Failed to update user role");
        }
    };

    const handleVerifyLawyer = async (userId: string) => {
        setError("");
        setSuccess("");
        try {
            await client.verifyLawyer(userId);
            setSuccess("Lawyer verified.");
            await loadData();
        } catch (err: any) {
            setError(err.message || "Failed to verify lawyer");
        }
    };

    const handleToggleBan = async (userId: string, banned: boolean) => {
        setError("");
        setSuccess("");
        const action = banned ? "ban" : "unban";
        const target = users.find((u) => u._id === userId);
        if (!window.confirm(`Are you sure you want to ${action} "${target?.username || ""}"?`)) return;
        try {
            await client.banUser(userId, banned);
            setSuccess(`User ${banned ? "banned" : "unbanned"}.`);
            await loadData();
        } catch (err: any) {
            setError(err.message || `Failed to ${action} user`);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        setError("");
        setSuccess("");
        const target = users.find((u) => u._id === userId);
        if (!window.confirm(`Delete user "${target?.username || ""}"? This cannot be undone.`)) return;
        try {
            await client.deleteUser(userId);
            setSuccess("User deleted.");
            await loadData();
        } catch (err: any) {
            setError(err.message || "Failed to delete user");
        }
    };

    return (
        <div className="manage-page">
            <ManageHeader
                loading={loading}
                showCreateForm={showCreateForm}
                onRefresh={loadData}
                onShowCreate={() => setShowCreateForm(true)}
            />

            <ManageAlerts
                error={error}
                success={success}
                onClearError={() => setError("")}
                onClearSuccess={() => setSuccess("")}
            />

            {showCreateForm && (
                <CreateSectionForm
                    draft={newFolder}
                    loading={loading}
                    onDraftChange={setNewFolder}
                    onSave={handleSaveNew}
                    onCancel={handleCancelCreate}
                />
            )}

            <SectionsTable
                folders={sortedFolders}
                editingId={editingId}
                drafts={drafts}
                onEdit={handleEdit}
                onDraftChange={handleDraftChange}
                onSave={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onDelete={handleDeleteFolder}
            />

            <UsersTable
                users={sortedUsers}
                currentUserId={currentUserId}
                onChangeRole={handleChangeRole}
                onVerifyLawyer={handleVerifyLawyer}
                onToggleBan={handleToggleBan}
                onDelete={handleDeleteUser}
            />
        </div>
    );
}
