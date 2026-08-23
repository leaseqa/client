"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

const TABS = [
  { key: "qa", label: "Q&A", path: "/qa" },
  { key: "resources", label: "Resources", path: "/qa/resources" },
  { key: "stats", label: "Stats", path: "/qa/stats" },
];

export default function NavTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSelector((state: RootState) => state.session);
  const isAdmin = session.user?.role === "admin";

  const allTabs = isAdmin
    ? [...TABS, { key: "manage", label: "Manage", path: "/qa/manage" }]
    : TABS;

  const getActiveTab = () => {
    if ( pathname?.startsWith("/qa/manage") ) return "manage";
    if ( pathname?.startsWith("/qa/stats") ) return "stats";
    if ( pathname?.startsWith("/qa/resources") ) return "resources";
    return "qa";
  };

  const activeTab = getActiveTab();

  return (
    <nav
      className={`qa-nav-tabs ${isAdmin ? "has-admin-tab" : ""}`}
      aria-label="Community sections"
    >
      {allTabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            className={`qa-nav-tab ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            onClick={() => router.push(tab.path)}
          >
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
