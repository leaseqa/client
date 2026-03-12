"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import * as client from "../client";
import { RootState } from "@/app/store";
import type { Folder, FolderDraft, User } from "../types";
import {
  CreateSectionForm,
  ManageAlerts,
  ManageHeader,
  ManageSidebar,
  ManageStats,
  ManageUsersSection,
  ManageSectionsSection,
} from "./components";
import { getDisplayMetrics, getSectionEditorState, shouldKeepEditorOpenAfterRefetch } from "./view-model";

const EMPTY_DRAFT: FolderDraft = { name: "", displayName: "", description: "", color: "" };

type DatasetState<T> = {
  data: T[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string;
};

type Latest = { kind: "error" | "success"; message: string } | null;
type ReloadResult<T> = { ok: true; data: T[] } | { ok: false; error: string };

export default function ManageSectionsPage() {
  const router = useRouter();
  const session = useSelector((state: RootState) => state.session);
  const isAdmin = session.user?.role === "admin";
  const currentUserId = (session.user as any)?._id || session.user?.id || "";

  // Independent datasets
  const [usersState, setUsersState] = useState<DatasetState<User>>({ data: [], isLoading: false, hasLoaded: false, error: "" });
  const [sectionsState, setSectionsState] = useState<DatasetState<Folder>>({ data: [], isLoading: false, hasLoaded: false, error: "" });

  // Pending markers (action-scoped)
  const [userPending, setUserPending] = useState<string[]>([]);
  const [sectionPending, setSectionPending] = useState<string[]>([]);

  // Alerts surface
  const [latest, setLatest] = useState<Latest>(null);

  // Section side panel editor
  const [formMode, setFormMode] = useState<"closed" | "create" | "edit">("closed");
  const [editedSectionId, setEditedSectionId] = useState<string | null>(null);
  const [sectionDraft, setSectionDraft] = useState<FolderDraft>(EMPTY_DRAFT);
  const [savePending, setSavePending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [refetchError, setRefetchError] = useState("");

  // Auth gating handled below after fetch helpers are declared

  // Fetch helpers
  const reloadUsers = useCallback(async (): Promise<ReloadResult<User>> => {
    setUsersState((s) => ({ ...s, isLoading: true, error: s.hasLoaded ? s.error : "" }));
    try {
      const res = await client.fetchAllUsers();
      const data: User[] = (res as any)?.data || res || [];
      setUsersState({ data, isLoading: false, hasLoaded: true, error: "" });
      return { ok: true, data };
    } catch (e: any) {
      const message = e?.message || "Failed to load users";
      setUsersState((s) => ({ ...s, isLoading: false, hasLoaded: s.hasLoaded, error: message }));
      return { ok: false, error: message };
    }
  }, []);

  const reloadSections = useCallback(async (): Promise<ReloadResult<Folder>> => {
    setSectionsState((s) => ({ ...s, isLoading: true, error: s.hasLoaded ? s.error : "" }));
    try {
      const res = await client.fetchFolders();
      const data: Folder[] = (res as any)?.data || res || [];
      setSectionsState({ data, isLoading: false, hasLoaded: true, error: "" });
      return { ok: true, data };
    } catch (e: any) {
      const message = e?.message || "Failed to load sections";
      setSectionsState((s) => ({ ...s, isLoading: false, hasLoaded: s.hasLoaded, error: message }));
      return { ok: false, error: message };
    }
  }, []);

  const refreshBoth = useCallback(async () => {
    // Manual refresh should attempt both in parallel
    setLatest(null);
    const [beforeFormMode, beforeEditedId] = [formMode, editedSectionId];
    const [usersResult, sectionsResult] = await Promise.all([reloadUsers(), reloadSections()]);
    // After sections reload, determine editor persistence when in edit mode
    if (
      beforeFormMode === "edit" &&
      sectionsResult.ok &&
      !shouldKeepEditorOpenAfterRefetch({
        formMode: beforeFormMode,
        editedSectionId: beforeEditedId,
        sections: sectionsResult.data,
      })
    ) {
      setFormMode("closed");
      setEditedSectionId(null);
      setSectionDraft(EMPTY_DRAFT);
      setLatest({ kind: "error", message: "The section you were editing no longer exists. Editor closed." });
      return;
    }

    if (!usersResult.ok && !sectionsResult.ok) {
      setLatest({ kind: "error", message: "Failed to refresh users and sections." });
      return;
    }

    if (!usersResult.ok) {
      setLatest({ kind: "error", message: usersResult.error });
      return;
    }

    if (!sectionsResult.ok) {
      setLatest({ kind: "error", message: sectionsResult.error });
    }
  }, [formMode, editedSectionId, reloadUsers, reloadSections]);

  // Auth gating + initial load
  useEffect(() => {
    if (!isAdmin) {
      router.push("/qa");
      return;
    }
    void Promise.all([reloadUsers(), reloadSections()]);
  }, [isAdmin, router, reloadUsers, reloadSections]);

  // Derived metrics
  const displayMetrics = useMemo(() => getDisplayMetrics({
    users: {
      hasLoaded: usersState.hasLoaded,
      data: usersState.data,
      error: usersState.error,
      isLoading: usersState.isLoading,
    },
    sections: {
      hasLoaded: sectionsState.hasLoaded,
      data: sectionsState.data,
      error: sectionsState.error,
      isLoading: sectionsState.isLoading,
    },
  }), [usersState, sectionsState]);

  const sortedUsers = useMemo(() => [...usersState.data].sort((a, b) => a.username.localeCompare(b.username)), [usersState.data]);
  const sortedSections = useMemo(() => [...sectionsState.data].sort((a, b) => a.displayName.localeCompare(b.displayName)), [sectionsState.data]);

  // Users actions
  const withUserPending = async (marker: string, fn: () => Promise<void>) => {
    setUserPending((m) => [...m, marker]);
    try {
      await fn();
    } finally {
      setUserPending((m) => m.filter((x) => x !== marker));
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    await withUserPending(`${userId}:role`, async () => {
      try {
        await client.updateUserRole(userId, role);
        const refresh = await reloadUsers();
        setLatest(
          refresh.ok
            ? { kind: "success", message: "User role updated." }
            : { kind: "error", message: "User role updated, but failed to refresh users." },
        );
      } catch (e: any) {
        setLatest({ kind: "error", message: e?.message || "Failed to update user role" });
      }
    });
  };

  const handleVerifyLawyer = async (userId: string) => {
    await withUserPending(`${userId}:verify`, async () => {
      try {
        await client.verifyLawyer(userId);
        const refresh = await reloadUsers();
        setLatest(
          refresh.ok
            ? { kind: "success", message: "Lawyer verified." }
            : { kind: "error", message: "Lawyer verified, but failed to refresh users." },
        );
      } catch (e: any) {
        setLatest({ kind: "error", message: e?.message || "Failed to verify lawyer" });
      }
    });
  };

  const handleToggleBan = async (userId: string, banned: boolean) => {
    const action = banned ? "ban" : "unban";
    const target = usersState.data.find((u) => u._id === userId);
    if (!window.confirm(`Are you sure you want to ${action} "${target?.username || ""}"?`)) return;
    await withUserPending(`${userId}:ban`, async () => {
      try {
        await client.banUser(userId, banned);
        const refresh = await reloadUsers();
        setLatest(
          refresh.ok
            ? { kind: "success", message: `User ${banned ? "banned" : "unbanned"}.` }
            : { kind: "error", message: `User ${banned ? "banned" : "unbanned"}, but failed to refresh users.` },
        );
      } catch (e: any) {
        setLatest({ kind: "error", message: e?.message || `Failed to ${action} user` });
      }
    });
  };

  const handleDeleteUser = async (userId: string) => {
    const target = usersState.data.find((u) => u._id === userId);
    if (!window.confirm(`Delete user "${target?.username || ""}"? This cannot be undone.`)) return;
    await withUserPending(`${userId}:delete`, async () => {
      try {
        await client.deleteUser(userId);
        const refresh = await reloadUsers();
        setLatest(
          refresh.ok
            ? { kind: "success", message: "User deleted." }
            : { kind: "error", message: "User deleted, but failed to refresh users." },
        );
      } catch (e: any) {
        setLatest({ kind: "error", message: e?.message || "Failed to delete user" });
      }
    });
  };

  // Sections actions
  const withSectionPending = async (marker: string, fn: () => Promise<void>) => {
    setSectionPending((m) => [...m, marker]);
    try {
      await fn();
    } finally {
      setSectionPending((m) => m.filter((x) => x !== marker));
    }
  };

  const handleDeleteSection = async (id: string) => {
    const target = sectionsState.data.find((f) => f._id === id);
    if (!window.confirm(`Delete section "${target?.displayName || ""}"?`)) return;
    await withSectionPending(`${id}:delete`, async () => {
      try {
        await client.deleteFolder(id);
        const refresh = await reloadSections();
        setLatest(
          refresh.ok
            ? { kind: "success", message: "Section deleted." }
            : { kind: "error", message: "Section deleted, but failed to refresh sections." },
        );
      } catch (e: any) {
        setLatest({ kind: "error", message: e?.message || "Failed to delete section" });
      }
    });
  };

  const openCreate = () => {
    setFormMode("create");
    setEditedSectionId(null);
    setSectionDraft(EMPTY_DRAFT);
    setSubmitError("");
    setRefetchError("");
  };

  const openEdit = (id: string) => {
    const folder = sectionsState.data.find((f) => f._id === id);
    if (!folder) return;
    setFormMode("edit");
    setEditedSectionId(id);
    setSectionDraft({ name: folder.name, displayName: folder.displayName, description: folder.description || "", color: folder.color });
    setSubmitError("");
    setRefetchError("");
  };

  const cancelEditor = () => {
    setFormMode("closed");
    setEditedSectionId(null);
    setSectionDraft(EMPTY_DRAFT);
    setSubmitError("");
    setRefetchError("");
  };

  const saveSection = async () => {
    setSubmitError("");
    setRefetchError("");
    // validation
    if (formMode === "create") {
      if (!sectionDraft.name.trim() || !sectionDraft.displayName.trim()) {
        setSubmitError("Name and Display Name are required.");
        return;
      }
    } else if (formMode === "edit") {
      if (!sectionDraft.displayName.trim()) {
        setSubmitError("Display Name is required.");
        return;
      }
    } else {
      return;
    }

    try {
      setSavePending(true);
      if (formMode === "create") {
        await client.createFolder({
          name: sectionDraft.name.trim(),
          displayName: sectionDraft.displayName.trim(),
          description: sectionDraft.description?.trim() || "",
          color: sectionDraft.color || undefined,
        });
        setLatest({ kind: "success", message: "Section created successfully." });
      } else if (formMode === "edit" && editedSectionId) {
        await client.updateFolder(editedSectionId, {
          displayName: sectionDraft.displayName.trim(),
          description: sectionDraft.description?.trim() || "",
          color: sectionDraft.color,
        });
        setLatest({ kind: "success", message: "Section updated successfully." });
      }

      // After save, refetch sections BEFORE closing
      const refresh = await reloadSections();
      if (refresh.ok) {
        cancelEditor();
      } else {
        setRefetchError(refresh.error);
      }
    } catch (e: any) {
      setSubmitError(e?.message || "Failed to save section");
    } finally {
      setSavePending(false);
    }
  };

  const retryRefetchAfterSave = async () => {
    const refresh = await reloadSections();
    if (refresh.ok) {
      setRefetchError("");
      cancelEditor();
    } else {
      setRefetchError(refresh.error);
    }
  };

  const isRefreshing = usersState.isLoading || sectionsState.isLoading;
  const headerRefreshDisabled = isRefreshing || savePending || userPending.length > 0 || sectionPending.length > 0;
  const dualInitialFailure = !usersState.hasLoaded && !!usersState.error && !sectionsState.hasLoaded && !!sectionsState.error;
  const sectionsAvailable = sectionsState.hasLoaded; // governs create CTA enabled

  const editorUi = getSectionEditorState({
    hasSectionsLoaded: sectionsState.hasLoaded,
    sectionsError: sectionsState.error,
    formMode,
    savePending,
  });

  return (
    // Non-admin renders nothing (redirect handled above)
    !isAdmin ? null : (
    <div className="manage-page">
      <ManageHeader
        onRefresh={refreshBoth}
        onShowCreate={openCreate}
        isRefreshing={isRefreshing}
        isRefreshDisabled={headerRefreshDisabled}
        formMode={formMode}
        sectionsAvailable={sectionsAvailable}
      />

      <ManageAlerts latest={latest} onClearLatest={() => setLatest(null)} />

      <div className="admin-v2-shell">
        <ManageSidebar stats={displayMetrics} moderationHref="/qa" />

        <main>
          <ManageStats stats={{ totalUsers: displayMetrics.totalUsers, totalSections: displayMetrics.totalSections, verifiedLawyers: displayMetrics.verifiedLawyers }} />

          {/* Users Section */}
          {usersState.hasLoaded ? (
            <ManageUsersSection
              title="Users"
              isLoading={usersState.isLoading && !usersState.hasLoaded}
              isDataAvailable={true}
              users={sortedUsers}
              currentUserId={currentUserId}
              pendingMarkers={userPending}
              onChangeRole={handleChangeRole}
              onVerifyLawyer={handleVerifyLawyer}
              onToggleBan={handleToggleBan}
              onDelete={handleDeleteUser}
            />
          ) : (
            <ManageUsersSection title="Users" isLoading={usersState.isLoading} isDataAvailable={false} error={usersState.error} onRetry={reloadUsers}>
              {/* back-compat slot unused */}
            </ManageUsersSection>
          )}

          {/* Sections Section */}
          {sectionsState.hasLoaded ? (
            <ManageSectionsSection
              title="Sections"
              isLoading={sectionsState.isLoading && !sectionsState.hasLoaded}
              isDataAvailable={true}
              sections={sortedSections}
              pendingMarkers={sectionPending}
              onEdit={openEdit}
              onDelete={handleDeleteSection}
            />
          ) : (
            <ManageSectionsSection title="Sections" isLoading={sectionsState.isLoading} isDataAvailable={false} error={sectionsState.error} onRetry={reloadSections}>
              {/* back-compat slot unused */}
            </ManageSectionsSection>
          )}

          {/* Section Create/Edit side-panel form */}
          {!dualInitialFailure && editorUi.isOpen && (
            <CreateSectionForm
              draft={sectionDraft}
              loading={savePending}
              disabled={editorUi.isDisabled || !!refetchError}
              onDraftChange={setSectionDraft}
              onSave={saveSection}
              onCancel={cancelEditor}
              mode={formMode === "edit" ? "edit" : "create"}
              errors={{}}
              submitError={submitError}
              refetchError={refetchError}
              onRetryRefetch={refetchError ? retryRefetchAfterSave : undefined}
            />
          )}
        </main>
      </div>
    </div>
  ));
}
