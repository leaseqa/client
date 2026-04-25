import {describe, expect, test} from "vitest";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";

import ManageHeader from "./ManageHeader";
import ManageAlerts from "./ManageAlerts";
import CreateSectionForm from "./CreateSectionForm";
import ManageUsersSection from "./ManageUsersSection";
import ManageSectionsSection from "./ManageSectionsSection";
import ManageSidebar from "./ManageSidebar";
import ManageStats from "./ManageStats";
import type {Folder, User} from "../../types";

// Minimal stubs for event handlers
const noop = () => {
};

describe("Admin shell render smoke", () => {
  test("Sidebar renders anchors, pending/banned when available, moderation link, and never verified-lawyers card", () => {
    const html = renderToStaticMarkup(
      <ManageSidebar
        overviewHref="#overview"
        usersHref="#users"
        sectionsHref="#sections"
        moderationHref="/qa"
        stats={{pendingLawyerCount: 3, bannedUserCount: 2, verifiedLawyers: 7, totalUsers: 12, totalSections: 4}}
      />,
    );

    expect(html).toContain("#overview");
    expect(html).toContain("#users");
    expect(html).toContain("#sections");
    expect(html).toContain("Pending Verification");
    expect(html).toContain("Banned Users");
    expect(html).toContain("/qa");
    expect(html).not.toContain("Verified Lawyers");

    const htmlOmit = renderToStaticMarkup(
      <ManageSidebar
        stats={{
          pendingLawyerCount: null,
          bannedUserCount: null,
          verifiedLawyers: 5,
          totalUsers: null,
          totalSections: null
        }}
      />,
    );
    expect(htmlOmit).not.toContain("Pending Verification");
    expect(htmlOmit).not.toContain("Banned Users");
  });

  test("Header shows LeaseQA Admin and disables create when sections are unavailable", () => {
    const html = renderToStaticMarkup(
      <ManageHeader
        // new widened props
        isRefreshing={false}
        isRefreshDisabled={false}
        formMode="closed"
        sectionsAvailable={false}
        onRefresh={noop}
        onShowCreate={noop}
      />,
    );

    expect(html).toContain("LeaseQA Admin");
    // Create button should be disabled when sections are unavailable
    expect(html).toMatch(/<button[^>]*disabled[^>]*>[\s\S]*New Section/);
  });

  test("Alerts render only the latest surface (error or success)", () => {
    const latestErrorHtml = renderToStaticMarkup(
      <ManageAlerts latest={{kind: "error", message: "Boom"}} onClearLatest={noop}/>,
    );
    const latestSuccessHtml = renderToStaticMarkup(
      <ManageAlerts latest={{kind: "success", message: "Saved"}} onClearLatest={noop}/>,
    );

    expect(latestErrorHtml).toContain("Boom");
    expect(latestErrorHtml).not.toContain("Saved");
    expect(latestSuccessHtml).toContain("Saved");
    expect(latestSuccessHtml).not.toContain("Boom");
  });

  test("Stats renders only Users, Sections, Verified Lawyers cards and omits null metrics", () => {
    const html = renderToStaticMarkup(
      <ManageStats stats={{totalUsers: 10, totalSections: null, verifiedLawyers: 4}}/>,
    );
    expect(html).toContain("Users");
    expect(html).toContain("Verified Lawyers");
    expect(html).not.toContain("Pending Verification");
    expect(html).not.toContain("Banned Users");
    // Omit null metric card
    expect(html).not.toContain("Sections");
  });

  test("ManageUsersSection and ManageSectionsSection render inline retry states", () => {
    const usersHtml = renderToStaticMarkup(
      <ManageUsersSection
        title="Users"
        isLoading={false}
        isDataAvailable={false}
        error="Failed to load users"
        onRetry={noop}
      >
        <div>unused</div>
      </ManageUsersSection>,
    );

    const sectionsHtml = renderToStaticMarkup(
      <ManageSectionsSection
        title="Sections"
        isLoading={false}
        isDataAvailable={false}
        error="Failed to load sections"
        onRetry={noop}
      >
        <div>unused</div>
      </ManageSectionsSection>,
    );

    expect(usersHtml).toContain("Retry users");
    expect(sectionsHtml).toContain("Retry sections");
  });

  test("ManageUsersSection and ManageSectionsSection own their rendering when data is available", () => {
    const users: User[] = [{_id: "u1", username: "alice", email: "a@x", role: "tenant"}];
    const usersHtml = renderToStaticMarkup(
      <ManageUsersSection
        title="Users"
        isLoading={false}
        isDataAvailable={true}
        users={users}
        currentUserId="u2"
        pendingMarkers={[]}
        onChangeRole={noop}
        onVerifyLawyer={noop}
        onToggleBan={noop}
        onDelete={noop}
      />,
    );
    expect(usersHtml).toContain("Users");
    expect(usersHtml).toContain("alice");

    const sections: Folder[] = [{_id: "s1", name: "repairs", displayName: "Repairs", description: "", color: ""}];
    const sectionsHtml = renderToStaticMarkup(
      <ManageSectionsSection
        title="Sections"
        isLoading={false}
        isDataAvailable={true}
        sections={sections}
        pendingMarkers={[]}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    expect(sectionsHtml).toContain("Sections");
    expect(sectionsHtml).toContain("Repairs");
  });

  test("CreateSectionForm in edit mode shows edit heading and a read-only name field", () => {
    const html = renderToStaticMarkup(
      <CreateSectionForm
        draft={{name: "repairs", displayName: "Repairs", description: "", color: ""}}
        mode="edit"
        loading={false}
        disabled={false}
        errors={{}}
        submitError=""
        refetchError=""
        onDraftChange={noop}
        onSave={noop}
        onCancel={noop}
      />,
    );

    expect(html).toContain("Edit section");
    expect(html).toContain('name="name"');
    expect(html).toMatch(/read(?:O|o)nly/);
  });
});
